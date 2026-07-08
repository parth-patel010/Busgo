import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { upload, photoUrlFromPath, deletePhotoFile } from "../lib/upload";

const router: IRouter = Router();

function toUserResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    active: user.active,
    isAdmin: user.isAdmin,
    photoUrl: photoUrlFromPath(user.photoPath),
  };
}

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: "Not logged in" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { req.session.destroy(() => {}); res.status(401).json({ error: "User not found" }); return; }
  res.json(toUserResponse(user));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) { res.status(400).json({ error: "Username and password required" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
  req.session.userId = user.id;
  req.session.isAdmin = user.isAdmin;
  res.json(toUserResponse(user));
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => { res.json({ ok: true }); });
});

router.post("/auth/photo", upload.single("photo"), async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: "Not logged in" }); return; }
  if (!req.file) { res.status(400).json({ error: "Photo required" }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!existing) { res.status(401).json({ error: "User not found" }); return; }

  deletePhotoFile(existing.photoPath);

  const [user] = await db
    .update(usersTable)
    .set({ photoPath: req.file.path })
    .where(eq(usersTable.id, userId))
    .returning();

  res.json(toUserResponse(user!));
});

export default router;
