import { createInsertSchema } from "drizzle-zod";
import { date, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const studentsTable = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    admissionNumber: text("admission_number").notNull(),
    name: text("name").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
    gender: text("gender").notNull(),
    className: text("class_name").notNull(),
    section: text("section").notNull(),
    admissionDate: date("admission_date", { mode: "string" }).notNull(),
    fatherName: text("father_name").notNull().default(""),
    motherName: text("mother_name").notNull().default(""),
    guardianPhone: text("guardian_phone").notNull(),
    address: text("address").notNull(),
    status: text("status").notNull().default("Active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("students_admission_number_unique").on(table.admissionNumber)],
);

export const insertStudentRecordSchema = createInsertSchema(studentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type NewStudentRecord = z.infer<typeof insertStudentRecordSchema>;
export type StudentRecord = typeof studentsTable.$inferSelect;
