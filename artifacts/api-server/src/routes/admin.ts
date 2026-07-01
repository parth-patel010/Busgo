import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  if (!req.session?.isAdmin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  next();
}

router.use("/admin", requireAdmin);

router.get("/admin/users", async (_req, res): Promise<void> => {
  const users = await db
    .select({ id: usersTable.id, username: usersTable.username, active: usersTable.active, isAdmin: usersTable.isAdmin, createdAt: usersTable.createdAt })
    .from(usersTable)
    .orderBy(usersTable.createdAt);
  res.json(users);
});

router.patch("/admin/users/:id/active", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { active } = req.body as { active: boolean };
  const [user] = await db.update(usersTable).set({ active }).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ id: user.id, username: user.username, active: user.active, isAdmin: user.isAdmin });
});

router.post("/admin/users", async (req, res): Promise<void> => {
  const { username, password, active } = req.body as { username?: string; password?: string; active?: boolean };
  if (!username || !password) { res.status(400).json({ error: "Username and password required" }); return; }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ username, passwordHash, active: active ?? false }).returning();
  res.status(201).json({ id: user.id, username: user.username, active: user.active, isAdmin: user.isAdmin });
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

export default router;
