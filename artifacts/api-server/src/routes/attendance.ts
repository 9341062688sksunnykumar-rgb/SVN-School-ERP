import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, attendanceTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/attendance", async (req, res) => {
  try {
    const date = req.query.date as string;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const records = await db
      .select()
      .from(attendanceTable)
      .where(eq(attendanceTable.attendanceDate, date));

    return res.json(records);
  } catch (error) {
    console.error("Get attendance error:", error);
    return res.status(500).json({ message: "Unable to load attendance" });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    const { studentId, attendanceDate, status } = req.body;

    const [existing] = await db
      .select()
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.studentId, studentId),
          eq(attendanceTable.attendanceDate, attendanceDate)
        )
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(attendanceTable)
        .set({ status, updatedAt: new Date() })
        .where(eq(attendanceTable.id, existing.id))
        .returning();

      return res.json(updated);
    }

    const [created] = await db
      .insert(attendanceTable)
      .values({ studentId, attendanceDate, status })
      .returning();

    return res.status(201).json(created);
  } catch (error) {
    console.error("Save attendance error:", error);
    return res.status(500).json({ message: "Unable to save attendance" });
  }
});

export default router;
