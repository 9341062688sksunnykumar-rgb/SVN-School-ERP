import { Router, type IRouter } from "express";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db, studentsTable, type StudentRecord } from "@workspace/db";
import {
  CreateStudentBody,
  GetStudentParams,
  GetStudentResponse,
  ListStudentsQueryParams,
  UpdateStudentBody,
  UpdateStudentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toStudentResponse(record: StudentRecord) {
  const validated = GetStudentResponse.parse(record);
  return {
    ...validated,
    dateOfBirth: record.dateOfBirth,
    admissionDate: record.admissionDate,
  };
}

function toDatabaseDates<T extends { dateOfBirth: Date; admissionDate: Date }>(data: T) {
  return {
    ...data,
    dateOfBirth: data.dateOfBirth.toISOString().slice(0, 10),
    admissionDate: data.admissionDate.toISOString().slice(0, 10),
  };
}

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ("code" in current && (current as { code?: string }).code === "23505") return true;
    current = "cause" in current ? (current as { cause?: unknown }).cause : undefined;
  }
  return false;
}

router.get("/students", async (req, res): Promise<void> => {
  const parsed = ListStudentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const clauses = [];
  const search = parsed.data.search?.trim();
  if (search) {
    const escapedSearch = search.replace(/[\\%_]/g, "\\$&");
    const searchClause = or(
      ilike(studentsTable.name, `%${escapedSearch}%`),
      ilike(studentsTable.admissionNumber, `%${escapedSearch}%`),
    );
    if (searchClause) clauses.push(searchClause);
  }
  if (parsed.data.className) {
    clauses.push(eq(studentsTable.className, parsed.data.className));
  }

  const records = await db
    .select()
    .from(studentsTable)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(asc(studentsTable.className), asc(studentsTable.name));

  res.json(records.map(toStudentResponse));
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = toDatabaseDates(parsed.data);
  try {
    const [record] = await db.insert(studentsTable).values({
      ...data,
      admissionNumber: data.admissionNumber.trim().toUpperCase(),
      name: data.name.trim(),
      section: data.section.trim().toUpperCase(),
      fatherName: data.fatherName.trim(),
      motherName: data.motherName.trim(),
      guardianPhone: data.guardianPhone.trim(),
      address: data.address.trim(),
    }).returning();

    res.status(201).json(toStudentResponse(record));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "That admission number is already in use." });
      return;
    }
    throw error;
  }
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [record] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.id));

  if (!record) {
    res.status(404).json({ error: "Student not found." });
    return;
  }

  res.json(toStudentResponse(record));
});

router.put("/students/:id", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = toDatabaseDates(parsed.data);
  try {
    const [record] = await db
      .update(studentsTable)
      .set({
        ...data,
        admissionNumber: data.admissionNumber.trim().toUpperCase(),
        name: data.name.trim(),
        section: data.section.trim().toUpperCase(),
        fatherName: data.fatherName.trim(),
        motherName: data.motherName.trim(),
        guardianPhone: data.guardianPhone.trim(),
        address: data.address.trim(),
        updatedAt: new Date(),
      })
      .where(eq(studentsTable.id, params.data.id))
      .returning();

    if (!record) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    res.json(toStudentResponse(record));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "That admission number is already in use." });
      return;
    }
    throw error;
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedStudent] = await db
      .delete(studentsTable)
      .where(eq(studentsTable.id, id))
      .returning();

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);

    return res.status(500).json({
      message: "Unable to delete student",
    });
  }
});

export default router;
