import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetStudentQueryKey,
  getListStudentsQueryKey,
  useCreateStudent,
  useGetStudent,
  useListStudents,
  useUpdateStudent,
} from "@workspace/api-client-react";
import type { Student, StudentInput } from "@workspace/api-client-react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Download,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const classNames = Array.from({ length: 8 }, (_, i) => `Class ${i + 1}`);
const studentSchema = z.object({
  admissionNumber: z.string().trim().min(1, "Admission number is required").max(32, "Use 32 characters or fewer"),
  name: z.string().trim().min(1, "Student name is required").max(120, "Use 120 characters or fewer"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Female", "Male", "Other"], { required_error: "Choose a gender" }),
  className: z.enum(["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"], { required_error: "Choose a class" }),
  section: z.string().trim().min(1, "Section is required").max(20, "Use 20 characters or fewer"),
  admissionDate: z.string().min(1, "Admission date is required"),
  fatherName: z.string().trim().max(120, "Use 120 characters or fewer"),
  motherName: z.string().trim().max(120, "Use 120 characters or fewer"),
  guardianPhone: z.string().trim().min(7, "Enter a phone number with at least 7 characters").max(20, "Use 20 characters or fewer").regex(/^[0-9+() -]{7,20}$/, "Use digits and standard phone punctuation only"),
  address: z.string().trim().min(1, "Address is required").max(500, "Use 500 characters or fewer"),
});

const emptyStudent: StudentInput = {
  admissionNumber: "",
  name: "",
  dateOfBirth: "",
  gender: "Female",
  className: "Class 1",
  section: "",
  admissionDate: "",
  fatherName: "",
  motherName: "",
  guardianPhone: "",
  address: "",
};

type PanelMode = "view" | "edit" | "create";

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Something went wrong. Please try again.";
}

function isDuplicateError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  const status = error && typeof error === "object" && "status" in error ? Number(error.status) : undefined;
  return status === 409 || message.includes("duplicate") || message.includes("already exists") || message.includes("admission number");
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function downloadStudentCsv(students: Student[]) {
  const columns: (keyof Student | "status")[] = [
    "admissionNumber", "name", "dateOfBirth", "gender", "className", "section",
    "admissionDate", "fatherName", "motherName", "guardianPhone", "address", "status",
  ];
  const rows = [
    ["Admission number", "Student name", "Date of birth", "Gender", "Class", "Section", "Admission date", "Father's name", "Mother's name", "Guardian phone", "Address", "Status"],
    ...students.map(student => columns.map(column => student[column])),
  ];
  const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "sidhi-vinayak-students.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function StudentForm({
  student,
  mode,
  busy,
  submitError,
  onSubmit,
  onCancel,
}: {
  student?: Student;
  mode: "create" | "edit";
  busy: boolean;
  submitError: string;
  onSubmit: (data: StudentInput) => void;
  onCancel: () => void;
}) {
  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: student ? {
      admissionNumber: student.admissionNumber,
      name: student.name,
      dateOfBirth: student.dateOfBirth.slice(0, 10),
      gender: student.gender,
      className: student.className,
      section: student.section,
      admissionDate: student.admissionDate.slice(0, 10),
      fatherName: student.fatherName ?? "",
      motherName: student.motherName ?? "",
      guardianPhone: student.guardianPhone,
      address: student.address,
    } : emptyStudent,
  });

  useEffect(() => {
    if (student) {
      form.reset({
        admissionNumber: student.admissionNumber,
        name: student.name,
        dateOfBirth: student.dateOfBirth.slice(0, 10),
        gender: student.gender,
        className: student.className,
        section: student.section,
        admissionDate: student.admissionDate.slice(0, 10),
        fatherName: student.fatherName ?? "",
        motherName: student.motherName ?? "",
        guardianPhone: student.guardianPhone,
        address: student.address,
      });
    }
  }, [student, form]);

  const field = (name: keyof StudentInput, label: string, type = "text", required = true) => (
    <FormField key={name} control={form.control} name={name} render={({ field: control }) => (
      <FormItem className="space-y-1.5">
        <FormLabel className="text-[12px] font-semibold text-[#425c73]">{label}{required && <span className="ml-1 text-[#a34d4d]" aria-hidden="true">*</span>}</FormLabel>
        <FormControl><Input {...control} type={type} className="h-10 rounded-lg border-[#d9e3eb] bg-white text-[13px] shadow-none placeholder:text-[#9aa9b5]" data-testid={`input-student-${name}`} /></FormControl>
        <FormMessage className="text-[11px]" />
      </FormItem>
    )} />
  );

  const selectField = (name: "gender" | "className", label: string, options: string[]) => (
    <FormField key={name} control={form.control} name={name} render={({ field: control }) => (
      <FormItem className="space-y-1.5">
        <FormLabel className="text-[12px] font-semibold text-[#425c73]">{label}<span className="ml-1 text-[#a34d4d]" aria-hidden="true">*</span></FormLabel>
        <Select onValueChange={control.onChange} value={control.value}>
          <FormControl><SelectTrigger className="h-10 rounded-lg border-[#d9e3eb] bg-white text-[13px]" data-testid={`select-student-${name}`}><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger></FormControl>
          <SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
        </Select>
        <FormMessage className="text-[11px]" />
      </FormItem>
    )} />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit({ ...values, fatherName: values.fatherName ?? "", motherName: values.motherName ?? "" }))} className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          {submitError && <div role="alert" className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[12px] ${submitError.toLowerCase().includes("admission number") || submitError.toLowerCase().includes("already") ? "border-[#efd6c7] bg-[#fff7f0] text-[#8c4f2e]" : "border-[#efd1d1] bg-[#fff4f3] text-[#914c4a]"}`} data-testid="status-student-submit-error"><AlertCircle size={15} className="mt-0.5 shrink-0" /><span>{submitError}</span></div>}
          <section>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#7890a3]">Student details</p>
            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              {field("admissionNumber", "Admission number")}
              {field("name", "Student name")}
              {field("dateOfBirth", "Date of birth", "date")}
              {selectField("gender", "Gender", ["Female", "Male", "Other"])}
              {selectField("className", "Class", classNames)}
              {field("section", "Section")}
              {field("admissionDate", "Admission date", "date")}
              {field("guardianPhone", "Guardian phone", "tel")}
            </div>
          </section>
          <section>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#7890a3]">Family & contact</p>
            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              {field("fatherName", "Father's name", "text", false)}
              {field("motherName", "Mother's name", "text", false)}
              <FormField control={form.control} name="address" render={({ field: control }) => (
                <FormItem className="space-y-1.5 sm:col-span-2">
                  <FormLabel className="text-[12px] font-semibold text-[#425c73]">Home address<span className="ml-1 text-[#a34d4d]" aria-hidden="true">*</span></FormLabel>
                  <FormControl><Textarea {...control} rows={3} className="resize-y rounded-lg border-[#d9e3eb] bg-white text-[13px] shadow-none placeholder:text-[#9aa9b5]" data-testid="input-student-address" /></FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )} />
            </div>
          </section>
          <p className="text-[10px] text-[#8293a1]"><span className="text-[#a34d4d]">*</span> Required fields. Parent names may be left blank.</p>
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-[#e6edf2] bg-[#fbfcfd] px-5 py-4 sm:px-7">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy} data-testid="button-cancel-student">Cancel</Button>
          <Button type="submit" disabled={busy} className="bg-[#246891] text-white hover:bg-[#1d5879]" data-testid="button-save-student">
            {busy ? <LoaderCircle size={15} className="mr-2 animate-spin" /> : <Check size={15} className="mr-2" />}
            {busy ? "Saving…" : mode === "create" ? "Add student" : "Save changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function StudentManagementPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [panel, setPanel] = useState<{ mode: PanelMode; id?: string } | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const params = useMemo(() => ({
    ...(deferredSearch ? { search: deferredSearch } : {}),
    ...(classFilter !== "all" ? { className: classFilter as Student["className"] } : {}),
  }), [deferredSearch, classFilter]);
  const listQuery = useListStudents(params);
  const detailId = panel?.id ?? "";
  const detailQuery = useGetStudent(detailId, {
    query: { enabled: Boolean(detailId), queryKey: getGetStudentQueryKey(detailId) },
  });
  const queryClient = useQueryClient();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const [submitError, setSubmitError] = useState("");

  const closePanel = () => {
    setPanel(null);
    setSubmitError("");
  };
  const onSave = (data: StudentInput) => {
    setSubmitError("");
    if (panel?.mode === "create") {
      createMutation.mutate({ data }, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          closePanel();
        },
        onError: (error) => setSubmitError(isDuplicateError(error) ? "That admission number is already in use. Check the number and try again." : getErrorMessage(error)),
      });
    } else if (panel?.mode === "edit" && panel.id) {
      updateMutation.mutate({ id: panel.id, data }, {
        onSuccess: async (student) => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() }),
            queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(student.id) }),
          ]);
          closePanel();
        },
        onError: (error) => setSubmitError(isDuplicateError(error) ? "That admission number is already in use. Check the number and try again." : getErrorMessage(error)),
      });
    }
  };

  const students = listQuery.data ?? [];
  const isEditor = panel?.mode === "edit" || panel?.mode === "create";
  const currentStudent = detailQuery.data;
  const loadingDetail = Boolean(panel?.id) && detailQuery.isLoading;

  return (
    <main className="fade-in mx-auto w-full max-w-[1440px]" data-testid="page-students">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#63839a]">School office / records</p>
          <h2 className="font-display text-[26px] font-extrabold tracking-[-.04em] text-[#203951] md:text-[30px]" data-testid="heading-students">Students</h2>
          <p className="mt-1 max-w-xl text-[13px] text-[#75889a]">Find a student record, review admission details, or update family information.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button type="button" variant="outline" onClick={() => downloadStudentCsv(students)} disabled={students.length === 0} className="h-10 w-full sm:w-auto" data-testid="button-export-students">
            <Download size={15} className="mr-1.5" /> Export CSV
          </Button>
          <Button onClick={() => { setSubmitError(""); setPanel({ mode: "create" }); }} className="btn-primary h-10 w-full sm:w-auto" data-testid="button-add-student">
            <Plus size={16} /> Add student
          </Button>
        </div>
      </div>

      <section className="surface-card overflow-hidden" aria-label="Student records">
        <div className="flex flex-col gap-3 border-b border-[#e7edf2] p-4 md:flex-row md:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#8da0ad]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or admission number" aria-label="Search student records" className="h-10 rounded-lg border-[#d9e3eb] bg-white pl-9 text-[12px] shadow-none" data-testid="input-search-students" />
          </label>
          <label className="relative block w-full md:w-[190px]">
            <span className="sr-only">Filter by class</span>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-10 rounded-lg border-[#d9e3eb] bg-white text-[12px]" data-testid="filter-student-class"><SelectValue placeholder="All classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <ChevronDown size={13} className="pointer-events-none absolute right-9 top-3 text-[#8496a3]" />
          </label>
          <span className="whitespace-nowrap text-[11px] text-[#8293a1]" data-testid="text-student-count">
            {listQuery.isLoading ? "Loading records…" : `${students.length} ${students.length === 1 ? "record" : "records"}`}
          </span>
        </div>

        {listQuery.isLoading ? (
          <div className="space-y-3 p-4" aria-label="Loading student records" data-testid="loading-students">
            {[0, 1, 2, 3].map(i => <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg border border-[#edf1f4] p-4"><div className="h-10 w-10 rounded-full bg-[#e8eff4]" /><div className="flex-1 space-y-2"><div className="h-3 w-1/4 rounded bg-[#e8eff4]" /><div className="h-2.5 w-1/3 rounded bg-[#f0f4f7]" /></div><div className="hidden h-3 w-24 rounded bg-[#f0f4f7] sm:block" /></div>)}
          </div>
        ) : listQuery.isError ? (
          <div className="grid justify-items-center px-5 py-14 text-center" role="alert" data-testid="error-students">
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[#fff0ef] text-[#ad5b56]"><AlertCircle size={20} /></span>
            <h3 className="text-[14px] font-bold text-[#334d64]">Records could not be loaded</h3>
            <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-[#8192a0]">{getErrorMessage(listQuery.error)}</p>
            <Button variant="outline" onClick={() => listQuery.refetch()} className="mt-4" data-testid="button-retry-students">Try again</Button>
          </div>
        ) : students.length === 0 ? (
          <div className="grid justify-items-center px-5 py-14 text-center" data-testid="empty-students">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf4f8] text-[#3c7c9f]"><UsersRound size={22} /></span>
            <h3 className="text-[14px] font-bold text-[#334d64]">{deferredSearch || classFilter !== "all" ? "No matching students" : "No student records yet"}</h3>
            <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-[#8192a0]">{deferredSearch || classFilter !== "all" ? "Try another search or choose a different class." : "When a student is added, their record will appear here."}</p>
            {(deferredSearch || classFilter !== "all") && <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setClassFilter("all"); }} data-testid="button-clear-student-filters">Clear filters</Button>}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table min-w-[760px]">
                <thead><tr><th>Student</th><th>Class & section</th><th>Admission no.</th><th>Guardian</th><th>Phone</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {students.map(student => <tr key={student.id} data-testid={`row-student-${student.id}`}>
                    <td><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8f2f7] text-[11px] font-bold text-[#47718a]" aria-hidden="true">{initials(student.name)}</span><div className="min-w-0"><p className="font-bold text-[#304b63]" data-testid={`text-student-name-${student.id}`}>{student.name}</p><p className="text-[10px] text-[#91a0ac]">{formatDate(student.dateOfBirth)}</p></div></div></td>
                    <td>{student.className}<span className="text-[#91a0ac]"> · {student.section}</span></td>
                    <td className="font-medium text-[#506a7f]">{student.admissionNumber}</td>
                    <td>{student.fatherName || student.motherName || "—"}</td>
                    <td className="whitespace-nowrap">{student.guardianPhone}</td>
                    <td><span className={`pill ${student.status.toLowerCase() === "active" ? "pill-green" : "pill-blue"}`} data-testid={`status-student-${student.id}`}>{student.status}</span></td>
                    <td><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => setPanel({ mode: "view", id: student.id })} aria-label={`View ${student.name}`} data-testid={`button-view-student-${student.id}`}><Eye size={15} /></Button><Button variant="ghost" size="icon" onClick={() => { setSubmitError(""); setPanel({ mode: "edit", id: student.id }); }} aria-label={`Edit ${student.name}`} data-testid={`button-edit-student-${student.id}`}><Pencil size={14} /></Button></div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-[#e9eef2] md:hidden">
              {students.map(student => <article key={student.id} className="p-4" data-testid={`card-student-${student.id}`}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f2f7] text-[11px] font-bold text-[#47718a]" aria-hidden="true">{initials(student.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><div><h3 className="truncate text-[13px] font-bold text-[#304b63]">{student.name}</h3><p className="mt-0.5 text-[11px] text-[#8192a0]">{student.admissionNumber}</p></div><span className={`pill ${student.status.toLowerCase() === "active" ? "pill-green" : "pill-blue"}`}>{student.status}</span></div>
                    <p className="mt-2 text-[12px] text-[#526c80]">{student.className} · Section {student.section}</p>
                    <p className="mt-1 text-[11px] text-[#8192a0]">{student.fatherName || student.motherName || "Guardian not listed"} · {student.guardianPhone}</p>
                    <div className="mt-3 flex gap-2"><Button variant="outline" size="sm" onClick={() => setPanel({ mode: "view", id: student.id })} data-testid={`button-view-student-mobile-${student.id}`}><Eye size={14} className="mr-1.5" />View</Button><Button variant="outline" size="sm" onClick={() => { setSubmitError(""); setPanel({ mode: "edit", id: student.id }); }} data-testid={`button-edit-student-mobile-${student.id}`}><Pencil size={13} className="mr-1.5" />Edit</Button></div>
                  </div>
                </div>
              </article>)}
            </div>
          </>
        )}
      </section>
      <p className="mt-3 text-[10px] text-[#91a0ac]">Student records are supplied by the school records service.</p>

      <Dialog open={Boolean(panel)} onOpenChange={(open) => { if (!open) closePanel(); }}>
        <DialogContent className="flex max-h-[94dvh] w-[calc(100%-24px)] max-w-[700px] flex-col gap-0 overflow-hidden rounded-2xl border-[#dce6ed] p-0 sm:max-h-[90dvh]" data-testid="dialog-student">
          {panel && isEditor ? (
            <>
              <DialogHeader className="shrink-0 border-b border-[#e6edf2] px-5 py-4 text-left sm:px-7">
                <DialogTitle className="font-display text-[19px] font-extrabold text-[#203951]">{panel.mode === "create" ? "Add a student" : "Edit student record"}</DialogTitle>
                <DialogDescription className="text-[12px] text-[#7e91a0]">{panel.mode === "create" ? "Enter the student's admission and contact details." : "Update the record and save your changes."}</DialogDescription>
              </DialogHeader>
              {panel.mode === "create" ? <StudentForm mode="create" busy={createMutation.isPending} submitError={submitError} onSubmit={onSave} onCancel={closePanel} /> : loadingDetail ? <div className="space-y-4 p-7" aria-label="Loading student record"><div className="h-4 w-1/3 animate-pulse rounded bg-[#e8eff4]" /><div className="h-10 animate-pulse rounded bg-[#f0f4f7]" /><div className="h-10 animate-pulse rounded bg-[#f0f4f7]" /></div> : detailQuery.isError ? <div className="p-7 text-center" role="alert" data-testid="error-student-detail"><AlertCircle className="mx-auto mb-2 text-[#ad5b56]" size={22} /><p className="text-[13px] font-semibold text-[#425c73]">Could not load this student</p><p className="mt-1 text-[12px] text-[#8192a0]">{getErrorMessage(detailQuery.error)}</p><Button variant="outline" onClick={() => detailQuery.refetch()} className="mt-4" data-testid="button-retry-student-detail">Try again</Button></div> : currentStudent ? <StudentForm key={currentStudent.id} mode="edit" student={currentStudent} busy={updateMutation.isPending} submitError={submitError} onSubmit={onSave} onCancel={closePanel} /> : null}
            </>
          ) : panel?.mode === "view" ? (
            <>
              <DialogHeader className="shrink-0 border-b border-[#e6edf2] px-5 py-4 text-left sm:px-7">
                <div className="flex items-start justify-between gap-3">
                  <div><DialogTitle className="font-display text-[19px] font-extrabold text-[#203951]">Student record</DialogTitle><DialogDescription className="mt-1 text-[12px] text-[#7e91a0]">Admission and family information.</DialogDescription></div>
                  {currentStudent && <Button variant="outline" size="sm" onClick={() => { setSubmitError(""); setPanel({ mode: "edit", id: currentStudent.id }); }} data-testid="button-edit-student-detail"><Pencil size={14} className="mr-1.5" />Edit record</Button>}
                </div>
              </DialogHeader>
              {loadingDetail ? <div className="space-y-4 p-6" aria-label="Loading student details"><div className="h-16 animate-pulse rounded-xl bg-[#edf3f6]" /><div className="h-20 animate-pulse rounded-xl bg-[#f2f5f7]" /><div className="h-20 animate-pulse rounded-xl bg-[#f2f5f7]" /></div> : detailQuery.isError ? <div className="p-7 text-center" role="alert" data-testid="error-student-detail"><AlertCircle className="mx-auto mb-2 text-[#ad5b56]" size={22} /><p className="text-[13px] font-semibold text-[#425c73]">Could not load this student</p><p className="mt-1 text-[12px] text-[#8192a0]">{getErrorMessage(detailQuery.error)}</p><Button variant="outline" onClick={() => detailQuery.refetch()} className="mt-4" data-testid="button-retry-student-detail">Try again</Button></div> : currentStudent ? <StudentDetails student={currentStudent} onClose={closePanel} /> : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function StudentDetails({ student, onClose }: { student: Student; onClose: () => void }) {
  const items = [
    ["Admission number", student.admissionNumber],
    ["Date of birth", formatDate(student.dateOfBirth)],
    ["Gender", student.gender],
    ["Class", `${student.className} · Section ${student.section}`],
    ["Admission date", formatDate(student.admissionDate)],
    ["Father's name", student.fatherName || "Not provided"],
    ["Mother's name", student.motherName || "Not provided"],
    ["Guardian phone", student.guardianPhone],
  ];
  return (
    <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-7" data-testid={`detail-student-${student.id}`}>
      <div className="flex items-center gap-3 rounded-xl border border-[#e3edf3] bg-[#f4f9fb] p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dcecf4] text-[13px] font-bold text-[#3b6e8b]" aria-hidden="true">{initials(student.name)}</span>
        <div className="min-w-0 flex-1"><h3 className="truncate text-[17px] font-bold text-[#2b465e]" data-testid={`text-student-detail-name-${student.id}`}>{student.name}</h3><p className="mt-0.5 text-[11px] text-[#7b8f9e]">Student record</p></div>
        <span className={`pill ${student.status.toLowerCase() === "active" ? "pill-green" : "pill-blue"}`} data-testid={`status-student-detail-${student.id}`}>{student.status}</span>
      </div>
      <section>
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#7890a3]">Student information</h4>
        <dl className="grid gap-0 sm:grid-cols-2">
          {items.map(([label, value]) => <div key={label} className="border-b border-[#edf1f4] py-3 sm:mr-5"><dt className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#8b9aa6]">{label}</dt><dd className="mt-1 break-words text-[13px] font-medium text-[#405a70]">{value}</dd></div>)}
        </dl>
      </section>
      <section><h4 className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#7890a3]">Home address</h4><p className="rounded-lg bg-[#f5f8fa] px-3 py-3 text-[13px] leading-relaxed text-[#405a70]">{student.address}</p></section>
      <div className="flex justify-end border-t border-[#e6edf2] pt-4"><Button variant="outline" onClick={onClose} data-testid="button-close-student-detail" aria-label="Close student details"><X size={15} className="mr-1.5" />Close</Button></div>
    </div>
  );
}
