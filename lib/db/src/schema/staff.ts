import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const staffTable = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  role: text("role").notNull(),
  subject: text("subject").notNull(),
  assignedClass: text("assigned_class"),
  phone: text("phone").notNull(),

  status: text("status").notNull().default("Active"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type StaffRecord = typeof staffTable.$inferSelect;
export type NewStaffRecord = typeof staffTable.$inferInsert;

