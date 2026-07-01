import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const uploadsDir = path.resolve(workspaceRoot, "artifacts/api-server/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not logged in" }); return; }
  if (!req.session?.isAdmin) { res.status(403).json({ error: "Admin only" }); return; }
  next();
}

router.use("/admin", requireAdmin);

router.get("/admin/users", async (_req, res): Promise<void> => {
  const users = await db
    .select({ id: usersTable.id, username: usersTable.username, active: usersTable.active, isAdmin: usersTable.isAdmin, photoPath: usersTable.photoPath, createdAt: usersTable.createdAt })
    .from(usersTable)
    .orderBy(usersTable.createdAt);
  const withUrl = users.map(u => ({
    ...u,
    photoUrl: u.photoPath ? `/api/uploads/${path.basename(u.photoPath)}` : null,
  }));
  res.json(withUrl);
});

router.post("/admin/users", upload.single("photo"), async (req, res): Promise<void> => {
  const { username, password, active } = req.body as { username?: string; password?: string; active?: string };
  if (!username || !password) { res.status(400).json({ error: "Username and password required" }); return; }
  const passwordHash = await bcrypt.hash(password, 10);
  const photoPath = req.file ? req.file.path : null;
  const [user] = await db
    .insert(usersTable)
    .values({ username, passwordHash, active: active === "true", photoPath })
    .returning();
  res.status(201).json({
    id: user.id, username: user.username, active: user.active, isAdmin: user.isAdmin,
    photoUrl: user.photoPath ? `/api/uploads/${path.basename(user.photoPath)}` : null,
  });
});

router.patch("/admin/users/:id", upload.single("photo"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { username, password, active } = req.body as { username?: string; password?: string; active?: string };

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (username) updates.username = username;
  if (password) updates.passwordHash = await bcrypt.hash(password, 10);
  if (active !== undefined) updates.active = active === "true";

  if (req.file) {
    // delete old photo
    const [existing] = await db.select({ photoPath: usersTable.photoPath }).from(usersTable).where(eq(usersTable.id, id));
    if (existing?.photoPath && fs.existsSync(existing.photoPath)) fs.unlinkSync(existing.photoPath);
    updates.photoPath = req.file.path;
  }

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({
    id: user.id, username: user.username, active: user.active, isAdmin: user.isAdmin,
    photoUrl: user.photoPath ? `/api/uploads/${path.basename(user.photoPath)}` : null,
  });
});

router.patch("/admin/users/:id/active", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { active } = req.body as { active: boolean };
  const [user] = await db.update(usersTable).set({ active }).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ id: user.id, username: user.username, active: user.active, isAdmin: user.isAdmin });
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (user?.photoPath && fs.existsSync(user.photoPath)) fs.unlinkSync(user.photoPath);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

export default router;
