import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const username = "admin";
const password = "admin123";

const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, username));
if (existing) {
  console.log("Admin user already exists");
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 10);
await db.insert(usersTable).values({ username, passwordHash, active: true, isAdmin: true });
console.log("Admin user created → username: admin / password: admin123");
process.exit(0);
