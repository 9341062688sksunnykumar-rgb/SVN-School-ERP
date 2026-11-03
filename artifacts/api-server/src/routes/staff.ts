import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, staffTable, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

// Get all staff
router.get("/staff", async (_req, res) => {
  try {
    const staff = await db.select().from(staffTable);
    return res.json(staff);
  } catch (error) {
    console.error("Get staff error:", error);
    return res.status(500).json({ message: "Unable to load staff" });
  }
});

// Add staff
router.post("/staff", async (req, res) => {
  try {
    const { name, role, subject, phone, status, assignedClass } = req.body;

    const [staff] = await db
      .insert(staffTable)
      .values({
        name,
        role,
        subject,
        phone,
        assignedClass,
        status: status || "Active",
      })
      .returning();

    return res.status(201).json(staff);
  } catch (error) {
    console.error("Create staff error:", error);
    return res.status(500).json({ message: "Unable to create staff" });
  }
});

// Update staff
router.put("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, subject, phone, status, assignedClass } = req.body;

    const [staff] = await db
      .update(staffTable)
      .set({
        name,
        role,
        subject,
        phone,
        status,
        updatedAt: new Date(),
      })
      .where(eq(staffTable.id, id))
      .returning();

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.json(staff);
  } catch (error) {
    console.error("Update staff error:", error);
    return res.status(500).json({ message: "Unable to update staff" });
  }
});

// Delete staff
router.delete("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [staff] = await db
      .delete(staffTable)
      .where(eq(staffTable.id, id))
      .returning();

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    return res.status(500).json({ message: "Unable to delete staff" });
  }
});

export default router;


