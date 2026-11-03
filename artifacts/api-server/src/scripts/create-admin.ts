import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const userId = process.env.ADMIN_USER_ID;
  const name = process.env.ADMIN_NAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!userId || !name || !passwordHash) {
    throw new Error("Admin data missing");
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    console.log("Admin already exists");
    process.exit(0);
  }

  await db.insert(usersTable).values({
    userId,
    name,
    passwordHash,
    role: "Admin",
    status: "Active",
  });

  console.log("Admin created successfully");
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("Create admin failed:", error);
  process.exit(1);
});