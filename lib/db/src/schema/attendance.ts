import { date, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const attendanceTable = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id").notNull(),
    attendanceDate: date("attendance_date").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("attendance_student_date_unique").on(
      table.studentId,
      table.attendanceDate
    ),
  ],
);

export type AttendanceRecord = typeof attendanceTable.$inferSelect;
export type NewAttendanceRecord = typeof attendanceTable.$inferInsert;
