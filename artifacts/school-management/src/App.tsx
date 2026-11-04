import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { Form } from '@/components/ui/form';
import schoolPhoto from '@assets/school_pic_1793026170242.jpeg';
import { useListStudents, type Student as ApiStudent } from '@workspace/api-client-react';
import StudentManagementPage from './pages/StudentsPage';
import {
  Activity, ArrowUpRight, BadgeIndianRupee, BookOpen,
  CalendarDays, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, Clock3, Download, FileBarChart2, FileText, GraduationCap,
  Home, IndianRupee, Menu, Pencil, Plus, Printer, Search, Trash2,
  Settings2, Users, UserRound, X, BookMarked, LockKeyhole, ShieldCheck, Building2,
} from 'lucide-react';

type Student = ApiStudent & { roll: string; guardian: string; phone: string };
type Fee = { id: string; studentId: string; student: string; className: string; month: string; amount: number; status: 'Paid' | 'Due'; date: string; method: string };
type Staff = { id: string; name: string; role: string; subject: string; phone: string; status: string };
type Exam = { id: string; name: string; className: string; subject: string; date: string; marks: number; outOf: number; student: string };
type TimetableEntry = { id: string; className: string; day: string; period: string; time: string; subject: string; teacher: string };

const starterStudents: Student[] = [
  { id: '00000000-0000-4000-8000-000000002401', admissionNumber: 'ST-2401', name: 'Aarav Sharma', dateOfBirth: '2014-08-19', gender: 'Male', className: 'Class 5', section: 'A', admissionDate: '2021-04-05', fatherName: 'Rajesh Sharma', motherName: 'Meera Sharma', guardianPhone: '0000000000', address: 'Fictional sample address, Jagdishpur', roll: '05', guardian: 'Meera Sharma', phone: '0000000000', status: 'Active' },
  { id: '00000000-0000-4000-8000-000000002402', admissionNumber: 'ST-2402', name: 'Ananya Patel', dateOfBirth: '2016-03-11', gender: 'Female', className: 'Class 3', section: 'A', admissionDate: '2022-04-01', fatherName: 'Rakesh Patel', motherName: 'Nisha Patel', guardianPhone: '0000000000', address: 'Fictional sample address, Jagdishpur', roll: '12', guardian: 'Rakesh Patel', phone: '0000000000', status: 'Active' },
  { id: '00000000-0000-4000-8000-000000002403', admissionNumber: 'ST-2403', name: 'Kabir Mehta', dateOfBirth: '2012-11-27', gender: 'Male', className: 'Class 7', section: 'B', admissionDate: '2020-04-06', fatherName: 'Amit Mehta', motherName: 'Nisha Mehta', guardianPhone: '0000000000', address: 'Fictional sample address, Jagdishpur', roll: '03', guardian: 'Nisha Mehta', phone: '0000000000', status: 'Active' },
  { id: '00000000-0000-4000-8000-000000002404', admissionNumber: 'ST-2404', name: 'Ishita Rao', dateOfBirth: '2017-06-02', gender: 'Female', className: 'Class 2', section: 'A', admissionDate: '2023-04-03', fatherName: 'Vikram Rao', motherName: 'Anita Rao', guardianPhone: '0000000000', address: 'Fictional sample address, Jagdishpur', roll: '18', guardian: 'Vikram Rao', phone: '0000000000', status: 'Active' },
  { id: '00000000-0000-4000-8000-000000002405', admissionNumber: 'ST-2405', name: 'Vihaan Joshi', dateOfBirth: '2013-09-14', gender: 'Male', className: 'Class 6', section: 'A', admissionDate: '2021-04-05', fatherName: 'Nitin Joshi', motherName: 'Pooja Joshi', guardianPhone: '0000000000', address: 'Fictional sample address, Jagdishpur', roll: '09', guardian: 'Pooja Joshi', phone: '0000000000', status: 'Active' },
  { id: '00000000-0000-4000-8000-000000002406', admissionNumber: 'ST-2406', name: 'Mira Desai', dateOfBirth: '2015-02-18', gender: 'Female', className: 'Class 4', section: 'B', admissionDate: '2022-04-04', fatherName: 'Kunal Desai', motherName: 'Ritu Desai', guardianPhone: '0000000000', address: 'Fictional sample address, Jagdishpur', roll: '07', guardian: 'Kunal Desai', phone: '0000000000', status: 'Active' },
  { id: '00000000-0000-4000-8000-000000002407', admissionNumber: 'ST-2407', name: 'Arjun Nair', dateOfBirth: '2018-01-21', gender: 'Male', className: 'Class 1', section: 'A', admissionDate: '2024-04-01', fatherName: 'Suresh Nair', motherName: 'Leena Nair', guardianPhone: '0000000000', address: 'Fictional sample address, Jagdishpur', roll: '14', guardian: 'Leena Nair', phone: '0000000000', status: 'Active' },
  { id: '00000000-0000-4000-8000-000000002408', admissionNumber: 'ST-2408', name: 'Sara Khan', dateOfBirth: '2011-10-09', gender: 'Female', className: 'Class 8', section: 'B', admissionDate: '2020-04-06', fatherName: 'Imran Khan', motherName: 'Farah Khan', guardianPhone: '0000000000', address: 'Fictional sample address, Jagdishpur', roll: '02', guardian: 'Farah Khan', phone: '0000000000', status: 'Active' },
];
const initialFees: Fee[] = [
  { id: 'RC-1048', studentId: 'ST-2401', student: 'Aarav Sharma', className: 'Class 5', month: 'June 2025', amount: 2400, status: 'Paid', date: '12 Jun 2025', method: 'UPI' },
  { id: 'RC-1047', studentId: 'ST-2402', student: 'Ananya Patel', className: 'Class 3', month: 'June 2025', amount: 2200, status: 'Due', date: 'â€”', method: 'â€”' },
  { id: 'RC-1046', studentId: 'ST-2403', student: 'Kabir Mehta', className: 'Class 7', month: 'June 2025', amount: 2800, status: 'Paid', date: '11 Jun 2025', method: 'Cash' },
  { id: 'RC-1045', studentId: 'ST-2404', student: 'Ishita Rao', className: 'Class 2', month: 'June 2025', amount: 2200, status: 'Due', date: 'â€”', method: 'â€”' },
  { id: 'RC-1044', studentId: 'ST-2405', student: 'Vihaan Joshi', className: 'Class 6', month: 'June 2025', amount: 2600, status: 'Paid', date: '10 Jun 2025', method: 'Bank transfer' },
  { id: 'RC-1043', studentId: 'ST-2406', student: 'Mira Desai', className: 'Class 4', month: 'June 2025', amount: 2400, status: 'Due', date: 'â€”', method: 'â€”' },
];
const initialStaff: Staff[] = [
  { id: 'SF-018', name: 'Sunita Kulkarni', role: 'Class teacher', subject: 'Mathematics', phone: 'XXXXX 76451', status: 'On duty' },
  { id: 'SF-017', name: 'Rohan Iyer', role: 'Class teacher', subject: 'English', phone: 'XXXXX 84326', status: 'On duty' },
  { id: 'SF-016', name: 'Farida Shaikh', role: 'Subject teacher', subject: 'Science', phone: 'XXXXX 10429', status: 'On duty' },
  { id: 'SF-015', name: 'Prakash More', role: 'Office assistant', subject: 'Administration', phone: 'XXXXX 51640', status: 'On duty' },
  { id: 'SF-014', name: 'Nandita Bose', role: 'Class teacher', subject: 'Hindi', phone: 'XXXXX 75814', status: 'On leave' },
];
const initialExams: Exam[] = [
  { id: 'EX-052', name: 'Unit Assessment 2', className: 'Class 5', subject: 'Mathematics', date: '18 Jun 2025', marks: 42, outOf: 50, student: 'Aarav Sharma' },
  { id: 'EX-051', name: 'Unit Assessment 2', className: 'Class 5', subject: 'English', date: '17 Jun 2025', marks: 38, outOf: 50, student: 'Aarav Sharma' },
  { id: 'EX-050', name: 'Unit Assessment 2', className: 'Class 3', subject: 'Mathematics', date: '17 Jun 2025', marks: 45, outOf: 50, student: 'Ananya Patel' },
  { id: 'EX-049', name: 'Unit Assessment 2', className: 'Class 7', subject: 'Science', date: '16 Jun 2025', marks: 41, outOf: 50, student: 'Kabir Mehta' },
];

const navItems = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/students', label: 'Students', icon: GraduationCap },
  { path: '/fees', label: 'Fees', icon: IndianRupee },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/exams', label: 'Exams & marks', icon: BookOpen },
  { path: '/staff', label: 'Staff', icon: Users },
  { path: '/academics', label: 'Academics', icon: BookMarked },
  { path: '/reports', label: 'Reports', icon: FileBarChart2 },
];
const money = (amount: number) => `â‚¹${amount.toLocaleString('en-IN')}`;
const initialTimetable: TimetableEntry[] = [
  { id: 'TT-01', className: 'Class 5', day: 'Monday', period: 'Period 1', time: '08:30â€“09:10', subject: 'Mathematics', teacher: 'Sunita Kulkarni' },
  { id: 'TT-02', className: 'Class 5', day: 'Monday', period: 'Period 2', time: '09:10â€“09:50', subject: 'English', teacher: 'Rohan Iyer' },
  { id: 'TT-03', className: 'Class 5', day: 'Tuesday', period: 'Period 1', time: '08:30â€“09:10', subject: 'Science', teacher: 'Farida Shaikh' },
  { id: 'TT-04', className: 'Class 3', day: 'Monday', period: 'Period 1', time: '08:30â€“09:10', subject: 'Hindi', teacher: 'Nandita Bose' },
];

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function toAppStudent(student: ApiStudent): Student {
  const guardian = [student.fatherName, student.motherName].filter(Boolean).join(' / ');
  return { ...student, roll: 'â€”', guardian: guardian || 'â€”', phone: student.guardianPhone };
}



type PortalRole = 'student' | 'admin' | 'management' | 'teacher';

const portalRoles: { id: PortalRole; title: string; detail: string; icon: typeof GraduationCap }[] = [
  { id: 'student', title: 'Student Portal', detail: 'Attendance, fees, results & report cards', icon: GraduationCap },
  { id: 'teacher', title: 'Teacher Login', detail: 'Attendance, marks & class work', icon: BookOpen },
  { id: 'admin', title: 'Admin Login', detail: 'School records & ERP administration', icon: ShieldCheck },
  { id: 'management', title: 'Management Login', detail: 'Reports, oversight & school management', icon: Building2 },
];

function PortalLogin({ onAdminPreview }: { onAdminPreview: () => void }) {
  const [selectedRole, setSelectedRole] = useState<PortalRole | null>(null);
  const role = portalRoles.find(item => item.id === selectedRole);
  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setLoginError("");
  setLoginLoading(true);

  const formData = new FormData(e.currentTarget);
  const userId = String(formData.get("userId") || "").trim();
  const password = String(formData.get("password") || "");

  try {
    const response = await fetch("https://svn-school-erp.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLoginError(data.message || "Invalid User ID or password");
      return;
    }

    if (data.user?.role !== "Admin") {
      setLoginError("This account does not have Admin access.");
      return;
    }

    onAdminPreview();
  } catch {
    setLoginError("Unable to connect to the server.");
  } finally {
    setLoginLoading(false);
  }
};
  const [loginError, setLoginError] = useState("");
const [loginLoading, setLoginLoading] = useState(false);

  return <div className="portal-login" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,27,45,.72), rgba(8,27,45,.32)), url(${schoolPhoto})` }}>
    <div className="portal-login__content">
      <div className="portal-brand">
        <span className="portal-brand__icon"><GraduationCap size={28}/></span>
        <div><p className="portal-brand__name">SVN ERP</p><p className="portal-brand__school">Sidhi Vinayak Public School</p></div>
      </div>
      <div className="portal-copy">
        <span className="portal-kicker">School Management System</span>
        <h1>Welcome to <span>SVN ERP</span></h1>
        <p>Choose your portal to continue. Each user gets access only to the area meant for their role.</p>
      </div>
      <div className="portal-card" aria-label="SVN ERP portal selection">
        {!selectedRole ? <>
          <div className="portal-card__head"><div><p className="portal-card__eyebrow">Secure access</p><h2>Select your portal</h2></div><LockKeyhole size={20}/></div>
          <div className="portal-role-grid">{portalRoles.map(item => { const Icon = item.icon; return <button key={item.id} className="portal-role" onClick={() => setSelectedRole(item.id)} data-testid={`portal-${item.id}`}><span className="portal-role__icon"><Icon size={21}/></span><span><strong>{item.title}</strong><small>{item.detail}</small></span><ChevronRight size={18}/></button>; })}</div>
        </> : <>
          <button className="portal-back" onClick={() => setSelectedRole(null)}>â† Back to portals</button>
          {loginError && <p className="portal-error">{loginError}</p>}
          <div className="portal-card__head"><div><p className="portal-card__eyebrow">SVN ERP</p><h2>{role?.title}</h2></div><LockKeyhole size={20}/></div>
          <form className="portal-form" onSubmit={handleAdminLogin}>
            <label>User ID<input name="userId" type="text" autoComplete="username" placeholder={selectedRole === 'student' ? 'Student ID' : 'Enter user ID'} required/></label>
<label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter password" required/></label>
            {selectedRole === 'admin' ? <button className="portal-submit" type="submit">Open Admin Dashboard <ChevronRight size={17}/></button> : <button className="portal-submit" type="button" disabled>Portal access will be connected after approval</button>}
          </form>
          <p className="portal-security"><ShieldCheck size={14}/> Role permissions will be enforced on the server before real student data is used.</p>
        </>}
      </div>
      <p className="portal-footnote">Sidhi Vinayak Public School Â· SVN ERP</p>
    </div>
  </div>;
}

function App() {
  const studentQuery = useListStudents();
  const students = studentQuery.data?.map(toAppStudent) ?? starterStudents;
  const [fees, setFees] = useState(initialFees);
  const [staff, setStaff] = useState(initialStaff);
  const [staffLoading, setStaffLoading] = useState(false);
  const loadStaff = async () => {
  setStaffLoading(true);

  try {
    const response = await fetch("https://svn-school-erp.onrender.com/api/staff");

    if (!response.ok) {
      throw new Error("Unable to load staff");
    }

    const data = await response.json();
    setStaff(data);
  } catch (error) {
    console.error("Load staff error:", error);
  } finally {
    setStaffLoading(false);
  }
};
const saveAttendance = async (studentId: string, status: string) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch('https://svn-school-erp.onrender.com/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        attendanceDate: today,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error('Unable to save attendance');
    }

    setAttendance(current => ({
      ...current,
      [studentId]: status,
    }));
  } catch (error) {
    console.error('Save attendance error:', error);
  }
};
const loadAttendance = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`https://svn-school-erp.onrender.com/api/attendance?date=${today}`);

    if (!response.ok) {
      throw new Error("Unable to load attendance");
    }

    const data = await response.json();

    setAttendance(
      Object.fromEntries(
        data.map((record: { studentId: string; status: string }) => [
          record.studentId,
          record.status,
        ])
      )
    );
  } catch (error) {
    console.error("Load attendance error:", error);
  }
};
const deleteStaff = async (staffMember: Staff) => {
  if (!window.confirm(`Delete ${staffMember.name}?`)) return;

  try {
    const response = await fetch(`https://svn-school-erp.onrender.com/api/staff/${staffMember.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Unable to delete staff');
    }

    await loadStaff();
  } catch (error) {
    console.error('Delete staff error:', error);
  }
};
useEffect(() => {
  loadStaff();
  loadAttendance();
}, []);
  const [exams, setExams] = useState(initialExams);
  const [timetable, setTimetable] = useState(initialTimetable);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [dialog, setDialog] = useState<{
    kind: string;
    item?: Record<string, string | number>;
    id?: string;
  } | null>(null);

  const [receipt, setReceipt] = useState<Fee | null>(null);
  const [location, setLocation] = useLocation();
  const [adminPreview, setAdminPreview] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const saveRecord = async (kind: string, payload: Record<string, string>) => {
    if (kind === 'staff') {
      try {
  const response = await fetch(
    dialog?.id ? `https://svn-school-erp.onrender.com/api/staff/${dialog.id}` : 'https://svn-school-erp.onrender.com/api/staff',
    {
      method: dialog?.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        role: payload.role,
        subject: payload.subject,
        phone: payload.phone,
        status: payload.status || 'On duty',
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Unable to save staff');
  }

  await loadStaff();
} catch (error) {
  console.error('Save staff error:', error);
}
    } else if (kind === 'exam') {
      const record: Exam = {
        id: dialog?.id ?? `EX-${Math.floor(60 + Math.random() * 90)}`,
        name: payload.name,
        className: payload.className,
        subject: payload.subject,
        date: payload.date,
        marks: Number(payload.marks),
        outOf: Number(payload.outOf),
        student: payload.student,
      };

      setExams(current =>
        dialog?.id
          ? current.map(s => s.id === dialog.id ? record : s)
          : [record, ...current]
      );
    } else if (kind === 'payment') {
      const chosen =
        students.find(
          s => s.id === payload.studentId ||
               s.admissionNumber === payload.studentId
        ) ?? students[0];

      const record: Fee = {
        id: `RC-${Math.floor(1050 + Math.random() * 800)}`,
        studentId: chosen.admissionNumber,
        student: chosen.name,
        className: chosen.className,
        month: payload.month,
        amount: Number(payload.amount),
        status: 'Paid',
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        method: payload.method,
      };

      setFees(current => [
        record,
        ...current.filter(
          f => !(f.studentId === chosen.id && f.month === payload.month)
        ),
      ]);

      setReceipt(record);
    } else if (kind === 'timetable') {
      const record: TimetableEntry = {
        id: dialog?.id ?? `TT-${Date.now()}`,
        className: payload.className,
        day: payload.day,
        period: payload.period,
        time: payload.time,
        subject: payload.subject,
        teacher: payload.teacher,
      };

      setTimetable(current =>
        dialog?.id
          ? current.map(entry => entry.id === dialog.id ? record : entry)
          : [record, ...current]
      );
    }

    setDialog(null);
  };

  if (!adminPreview) return <PortalLogin onAdminPreview={() => setAdminPreview(true)} />;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const currentDate = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return <div className="school-shell flex flex-col md:flex-row">
    {mobileMenuOpen && <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-black/50 md:hidden" />}

<button
  onClick={() => setMobileMenuOpen(true)}
  className="fixed left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-xl border border-[#dce5ec] bg-white text-[#203951] shadow-sm md:hidden"
  aria-label="Open menu"
>
  <Menu size={22}/>
</button>

<aside className={`school-sidebar fixed inset-y-0 left-0 z-50 flex w-[270px] max-w-[85vw] flex-col overflow-y-auto text-white shadow-xl transition-transform duration-300 md:fixed md:inset-y-0 md:left-0 md:z-20 md:w-[250px] md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-3 px-5 py-5 md:px-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#8ed1ed] text-[#183651]"><GraduationCap size={23}/></div>
         <div className="min-w-0 flex-1"><div className="font-display text-[16px] font-extrabold tracking-tight leading-tight">SVN ERP</div><div className="mt-1 text-[9px] tracking-[.12em] text-sky-100/65">SIDHI VINAYAK PUBLIC SCHOOL</div></div><button onClick={() => setMobileMenuOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 md:hidden" aria-label="Close menu"><X size={20}/></button>
      </div>
      <div className="hidden md:block px-6 pb-4 pt-3 text-[10px] font-bold uppercase tracking-[.16em] text-sky-100/45">School office</div>
      <nav className="mobile-nav px-3 pb-3 md:block md:px-3 md:pb-0" aria-label="Main navigation">
        {navItems.map(item => { const Icon = item.icon; const active = location === item.path; return <Link key={item.path} href={item.path} className={`nav-link ${active ? 'active' : ''}`} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} aria-current={active ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)}><Icon size={18}/><span>{item.label}</span></Link>; })}
      </nav>
      <div className="mt-auto hidden p-4 md:block">
        <div className="rounded-xl border border-white/10 bg-white/[.06] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold"><Activity size={15} className="text-sky-200"/> A steady school day</div>
          <p className="text-[11px] leading-relaxed text-sky-100/65">Your daily records, all in one calm place.</p>
          <div className="mt-3 border-t border-white/10 pt-3 text-[10px] text-sky-100/50">Prototype Â· Sample records only</div>
        </div>
      </div>
    </aside>
    <main className="school-main flex-1 md:ml-[250px]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#dce5ec] bg-[#f4f8fb]/95 px-4 py-3 backdrop-blur md:px-8 md:py-[18px]">
        <div><p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#74879a]">{currentDate}</p><h1 className="font-display mt-0.5 text-[18px] font-extrabold tracking-tight text-[#203951] md:text-[20px]">{navItems.find(n => n.path === location)?.label ?? 'School workspace'}</h1></div>
         <div className="flex items-center gap-2"><span className="hidden rounded-full border border-[#d6e5ef] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#56738a] sm:inline-flex"><span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-[#55a77b]"/>Demo workspace</span><span className="grid h-9 w-9 place-items-center rounded-full border border-[#dbe4eb] bg-white text-[#47627a]" title="School office workspace" aria-label="School office workspace" data-testid="status-office-workspace"><UserRound size={17}/></span><button
  onClick={() => setAdminPreview(false)}
  className="btn-secondary"
  data-testid="button-logout"
>
  Logout
</button></div>
      </header>
      <div className="px-4 py-5 md:px-8 md:py-7">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#d6e7f0] bg-[#eaf5fa] px-4 py-3 text-[#3b6179]" data-testid="notice-sample-data"><div className="mt-0.5 rounded-full bg-white p-1.5"><Activity size={14}/></div><p className="text-[12px] leading-relaxed"><strong>Fictional sample data.</strong> Student records save to the configured database. This prototype has no secure login or access controlsâ€”do not enter real student information. Other demo sections are temporary and reset after refresh.{studentQuery.isError && ' Student records could not be loaded; related demo sections are showing sample records.'}</p></div>
        <Switch>
          <Route path="/"><Dashboard students={students} fees={fees} attendance={attendance} setLocation={setLocation}/></Route>
          <Route path="/students"><StudentManagementPage /></Route>
          <Route path="/fees"><FeesPage students={students} fees={fees} onPay={fee => setDialog({ kind: 'payment', item: fee ? { studentId: fee.studentId, month: fee.month, amount: fee.amount } : undefined })} onReceipt={setReceipt}/></Route>
          <Route path="/attendance"><AttendancePage students={students} attendance={attendance} setAttendance={setAttendance} saveAttendance={saveAttendance}/></Route>
          <Route path="/exams"><ExamsPage exams={exams} students={students} onAdd={() => setDialog({ kind: 'exam' })} onEdit={e => setDialog({ kind: 'exam', id: e.id, item: e as unknown as Record<string, string | number> })}/></Route>
         <Route path="/staff">
  <StaffPage
    staff={staff}
    onAdd={() => setDialog({ kind: 'staff' })}
    onEdit={s => setDialog({ kind: 'staff', id: s.id, item: s as unknown as Record<string, string> })}
    onDelete={deleteStaff}
  />
</Route>
          <Route path="/academics"><AcademicsPage timetable={timetable} onAdd={() => setDialog({ kind: 'timetable' })} onEdit={entry => setDialog({ kind: 'timetable', id: entry.id, item: entry as unknown as Record<string, string> })}/></Route>
          <Route path="/reports"><ReportsPage students={students} fees={fees} exams={exams} attendance={attendance}/></Route>
          <Route><NotFound /></Route>
        </Switch>
      </div>
    </main>
    {dialog && <RecordDialog kind={dialog.kind} item={dialog.item} students={students} onClose={() => setDialog(null)} onSave={payload => saveRecord(dialog.kind, payload)} />}
    {receipt && <ReceiptModal fee={receipt} onClose={() => setReceipt(null)} />}
  </div>;
}

function PageTitle({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-bold uppercase tracking-[.15em] text-[#63839a]">{eyebrow}</p><h2 className="font-display text-[26px] font-extrabold tracking-[-.04em] text-[#203951] md:text-[30px]">{title}</h2><p className="mt-1 text-[13px] text-[#75889a]">{detail}</p></div>{action}</div>;
}
function Metric({ label, value, sub, icon: Icon, tone = 'blue', trend }: { label: string; value: string; sub: string; icon: typeof Users; tone?: string; trend?: string }) {
  return <div className="surface-card p-4 md:p-5"><div className="flex items-start justify-between"><div><p className="text-[12px] font-semibold text-[#71869a]">{label}</p><p className="font-display mt-2 text-[25px] font-extrabold tracking-tight text-[#243e57]">{value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone === 'mint' ? 'bg-[#e6f5ef] text-[#338363]' : tone === 'gold' ? 'bg-[#fff3df] text-[#a37220]' : 'bg-[#e8f3fa] text-[#36799f]'}`}><Icon size={19}/></span></div><div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8192a1]">{trend && <span className="font-bold text-[#438c68]">{trend}</span>}{sub}</div></div>;
}
function Dashboard({ students, fees, attendance, setLocation }: { students: Student[]; fees: Fee[]; attendance: Record<string, string>; setLocation: (path: string) => void }) {
  const paid = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const dueCount = fees.filter(f => f.status === 'Due').length;
  const presentCount = Object.values(attendance).filter(a => a === 'Present').length;
  return <div className="fade-in">
    <section className="mb-6 grid overflow-hidden rounded-2xl border border-[#d7e5ee] bg-white shadow-sm md:grid-cols-[.95fr_1.05fr]" data-testid="banner-school">
      <div className="flex flex-col items-start justify-center bg-[#eaf4f8] px-5 py-6 sm:px-8 sm:py-8 md:px-10">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#63839a]">School office</p>
        <h2 className="font-display mt-2 max-w-lg text-[25px] font-extrabold leading-tight tracking-[-.035em] text-[#203951] sm:text-[30px] md:text-[34px]">
          SIDHI VINAYAK PUBLIC SCHOOL
        </h2>
        <p className="mt-3 max-w-md text-[13px] leading-relaxed text-[#678094]">
          A thoughtful workspace for the school day, from admissions to attendance and learning.
        </p>
        <button onClick={() => setLocation('/students')} className="btn-primary mt-5" data-testid="link-banner-students">
          Browse student records <ChevronRight size={15}/>
        </button>
      </div>
      <div className="flex items-center justify-center bg-white p-3 sm:p-4">
        <img
          src={schoolPhoto}
          alt="Original uploaded exterior photo of Sidhi Vinayak Public School"
          width={1448}
          height={1086}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full"
          data-testid="image-school-banner"
        />
      </div>
    </section>
    <PageTitle eyebrow={currentDate} title={`${greeting}, school office`} detail="A quick look at today's school-office routines." action={<button className="btn-secondary" onClick={() => window.print()} data-testid="button-print-overview"><Printer size={15}/>Print overview</button>} />
    <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4 md:gap-4">
      <Metric label="Enrolled students" value={String(196 + students.length - starterStudents.length)} sub="Across Classes 1â€“8" icon={GraduationCap} trend="+4 this term"/>
      <Metric label="Present today" value={`${presentCount + 178}`} sub="of 196 students" icon={ClipboardCheck} tone="mint"/>
      <Metric label="Fees collected" value={money(paid + 384600)} sub="June collection so far" icon={IndianRupee} tone="gold" trend="â†‘ 8.4%"/>
      <Metric label="Fees to follow up" value={String(dueCount + 14)} sub="Families with a balance" icon={Clock3}/>
    </div>
    <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e6edf2] px-5 py-4"><div><h3 className="font-display text-[16px] font-extrabold text-[#253e56]">Today at a glance</h3><p className="mt-0.5 text-[11px] text-[#8392a0]">Your daily office checklist</p></div><span className="rounded-full bg-[#eef6fa] px-2.5 py-1 text-[10px] font-bold text-[#4d7792]">TUESDAY</span></div>
        <div className="divide-y divide-[#edf1f4]">
          <button onClick={() => setLocation('/attendance')} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#f8fbfd]" data-testid="action-today-attendance"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e9f5f8] text-[#3b8294]"><ClipboardCheck size={17}/></span><span className="min-w-0 flex-1"><strong className="block text-[13px] text-[#334d64]">Morning roll call</strong><small className="text-[11px] text-[#8b99a5]">{presentCount + 178} students marked present</small></span><span className="pill pill-green"><Check size={12}/> Up to date</span><ChevronRight size={16} className="text-[#9badbb]"/></button>
          <button onClick={() => setLocation('/fees')} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#f8fbfd]" data-testid="action-today-fees"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff4e3] text-[#a87529]"><BadgeIndianRupee size={17}/></span><span className="min-w-0 flex-1"><strong className="block text-[13px] text-[#334d64]">June fee follow-up</strong><small className="text-[11px] text-[#8b99a5]">{dueCount + 14} payments are still due</small></span><span className="pill pill-amber">Needs attention</span><ChevronRight size={16} className="text-[#9badbb]"/></button>
          <button onClick={() => setLocation('/exams')} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#f8fbfd]" data-testid="action-today-exams"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f1eefb] text-[#7561a9]"><BookOpen size={17}/></span><span className="min-w-0 flex-1"><strong className="block text-[13px] text-[#334d64]">Unit Assessment 2</strong><small className="text-[11px] text-[#8b99a5]">Marks entry in progress Â· Classes 3â€“7</small></span><span className="pill pill-blue">In progress</span><ChevronRight size={16} className="text-[#9badbb]"/></button>
        </div>
      </section>
      <section className="surface-card p-5">
        <div className="mb-4 flex items-center justify-between"><div><h3 className="font-display text-[16px] font-extrabold text-[#253e56]">Attendance this week</h3><p className="mt-0.5 text-[11px] text-[#8392a0]">School-wide daily average</p></div><span className="text-[12px] font-bold text-[#438c68]">96.8%</span></div>
        <div className="flex h-[142px] items-end justify-between gap-3 border-b border-[#e7edf2] px-2 pb-2">
          {[['M', 74], ['T', 92], ['W', 86], ['T', 98], ['F', 81]].map(([day, height], i) => <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={i}><div className={`w-full max-w-[34px] rounded-t-md ${i === 3 ? 'bg-[#3985a8]' : 'bg-[#b9ddec]'}`} style={{ height: `${height}%` }} title={`${height}%`}/><span className="text-[10px] text-[#8193a2]">{day}</span></div>)}
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px]"><span className="text-[#8293a1]">Consistent morning attendance</span><button className="font-bold text-[#347da1]" onClick={() => setLocation('/attendance')} data-testid="link-attendance-detail">View register <ArrowUpRight size={13} className="inline"/></button></div>
      </section>
    </div>
    <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <section className="surface-card p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-display text-[16px] font-extrabold text-[#253e56]">Recent fee activity</h3><p className="mt-0.5 text-[11px] text-[#8392a0]">Latest payments recorded</p></div><button className="text-[11px] font-bold text-[#347da1]" onClick={() => setLocation('/fees')} data-testid="link-fees-detail">Open fees <ArrowUpRight size={13} className="inline"/></button></div>
        <div className="space-y-3">{fees.filter(f => f.status === 'Paid').slice(0, 3).map(f => <div key={f.id} className="flex items-center gap-3"><Avatar name={f.student}/><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-[#344f66]">{f.student}</p><p className="text-[10px] text-[#8b99a5]">{f.month} Â· {f.date}</p></div><strong className="text-[12px] text-[#344f66]">{money(f.amount)}</strong><span className="pill pill-green">Paid</span></div>)}</div>
      </section>
      <section className="surface-card flex flex-col justify-between bg-[#eaf4f8] p-5"><div><span className="mb-3 inline-grid h-9 w-9 place-items-center rounded-lg bg-white text-[#36799f]"><CalendarDays size={18}/></span><h3 className="font-display text-[17px] font-extrabold text-[#203951]">A school day, made simpler.</h3><p className="mt-1.5 max-w-[310px] text-[12px] leading-relaxed text-[#678094]">Keep the small routines moving â€” roll call, fee slips and classroom records â€” all from one thoughtful workspace.</p></div><button onClick={() => setLocation('/students')} className="mt-5 flex w-fit items-center gap-2 text-[12px] font-bold text-[#2c7398]" data-testid="link-student-records">Browse student records <ChevronRight size={15}/></button></section>
    </div>
  </div>;
}
function Avatar({ name }: { name: string }) { return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e5eff5] text-[11px] font-bold text-[#47718a]">{name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>; }
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="relative block min-w-[190px] flex-1"><Search size={15} className="absolute left-3 top-[12px] text-[#8da0ad]"/><input className="field pl-9 text-[12px]" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} data-testid="input-search"/></label>; }
function FeesPage({ students, fees, onPay, onReceipt }: { students: Student[]; fees: Fee[]; onPay: (fee?: Fee) => void; onReceipt: (fee: Fee) => void }) {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('All payments'); const [month, setMonth] = useState('June 2025');
  const shown = fees.filter(f => `${f.student} ${f.id}`.toLowerCase().includes(query.toLowerCase()) && (status === 'All payments' || f.status === status) && (month === 'All months' || f.month === month));
  const amount = shown.filter(f => f.status === 'Paid').reduce((n, f) => n + f.amount, 0);
  return <div className="fade-in"><PageTitle eyebrow="Accounts Â· monthly tracking" title="Fee collection" detail="Mark payments, follow up on balances and print receipts." action={<div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => downloadCsv('sidhi-vinayak-fees.csv', [['Receipt','Student','Class','Month','Amount INR','Status','Date','Method'], ...shown.map(f => [f.id,f.student,f.className,f.month,f.amount,f.status,f.date,f.method])])} data-testid="button-export-fees"><Download size={15}/>Export CSV</button><button className="btn-primary" onClick={() => onPay()} data-testid="button-record-payment"><Plus size={16}/>Record payment</button></div>}/>
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3"><Metric label="Collected this month" value={money(amount + 384600)} sub="June 2025" icon={IndianRupee} tone="mint"/><Metric label="Payments recorded" value={String(fees.filter(f => f.status === 'Paid').length + 148)} sub="of 196 student accounts" icon={CheckCircle2}/><Metric label="Outstanding" value={money(37600)} sub={`${fees.filter(f => f.status === 'Due').length + 14} accounts to follow up`} icon={Clock3} tone="gold"/></div>
    <div className="surface-card overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e7edf2] p-4 lg:flex-row"><SearchBox value={query} onChange={setQuery} placeholder="Search student or receipt"/><select className="field lg:w-[170px]" value={month} onChange={e => setMonth(e.target.value)} aria-label="Filter by month" data-testid="filter-fee-month"><option>June 2025</option><option>May 2025</option><option>All months</option></select><select className="field lg:w-[170px]" value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by payment status" data-testid="filter-fee-status"><option>All payments</option><option>Paid</option><option>Due</option></select></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Student</th><th>Month</th><th>Amount</th><th>Payment date</th><th>Method</th><th>Status</th><th>Receipt / action</th></tr></thead><tbody>{shown.map(f => <tr key={f.id} data-testid={`row-fee-${f.id}`}><td><p className="font-bold text-[#304b63]">{f.student}</p><p className="text-[10px] text-[#91a0ac]">{f.className} Â· {f.id}</p></td><td>{f.month}</td><td className="font-bold">{money(f.amount)}</td><td>{f.date}</td><td>{f.method}</td><td><span className={`pill ${f.status === 'Paid' ? 'pill-green' : 'pill-amber'}`}>{f.status}</span></td><td>{f.status === 'Paid' ? <button className="btn-secondary !px-2.5 !py-1.5 text-[11px]" onClick={() => onReceipt(f)} data-testid={`button-receipt-${f.id}`}><FileText size={13}/>Receipt</button> : <button className="text-[11px] font-bold text-[#307a9c]" onClick={() => onPay(f)} data-testid={`button-pay-${f.id}`}>Mark paid <ChevronRight size={13} className="inline"/></button>}</td></tr>)}</tbody></table></div>
      {shown.length === 0 && <EmptyState title="No payments match" detail="Change the month, status or search to see records."/>}
    </div><div className="mt-3 flex items-center gap-2 text-[11px] text-[#8092a1]"><FileText size={14}/>Receipts are printable from each completed payment.</div>
  </div>;
}
function AttendancePage({ students, attendance, setAttendance, saveAttendance }: { students: Student[]; attendance: Record<string, string>; setAttendance: (value: (current: Record<string, string>) => Record<string, string>) => void; saveAttendance: (studentId: string, status: string) => Promise<void> }) {
  const [classFilter, setClassFilter] = useState('Class 5'); const [query, setQuery] = useState('');
  const classStudents = students.filter(s => s.className === classFilter && s.name.toLowerCase().includes(query.toLowerCase()));
  const present = classStudents.filter(s => (attendance[s.id] ?? 'Present') === 'Present').length;
  const markAll = async (value: string) => { await Promise.all(classStudents.map(s => saveAttendance(s.id, value))); };
  return <div className="fade-in"><PageTitle eyebrow="Daily roll call" title="Attendance" detail="Mark each class present or absent for today's register." action={<div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => downloadCsv('sidhi-vinayak-attendance.csv', [['Student ID','Student','Class','Roll','Attendance'], ...students.map(student => [student.id,student.name,student.className,student.roll,attendance[student.id] ?? 'Present'])])} data-testid="button-export-attendance"><Download size={15}/>Export CSV</button><button className="btn-secondary" onClick={() => window.print()} data-testid="button-print-register"><Printer size={15}/>Print register</button></div>}/>
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#dce8ef] bg-white p-4 sm:flex-row sm:items-center"><div className="flex flex-1 items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f3fa] text-[#36799f]"><CalendarDays size={18}/></div><div><p className="text-[12px] font-bold text-[#304b63]">{currentDate}</p><p className="text-[11px] text-[#8394a1]">Today's attendance register</p></div></div><select className="field sm:w-[160px]" value={classFilter} onChange={e => setClassFilter(e.target.value)} aria-label="Select class" data-testid="filter-attendance-class">{Array.from({ length: 8 }, (_, i) => <option key={i}>Class {i + 1}</option>)}</select><span className="pill pill-green self-start sm:self-auto">{present} present</span></div>
    <div className="surface-card overflow-hidden"><div className="flex flex-col justify-between gap-3 border-b border-[#e7edf2] p-4 sm:flex-row sm:items-center"><div><h3 className="font-display font-extrabold text-[#253e56]">{classFilter} register</h3><p className="mt-1 text-[11px] text-[#8392a0]">{classStudents.length} students in this sample register</p></div><div className="flex flex-wrap gap-2"><button className="btn-secondary text-[11px]" onClick={() => markAll('Present')} data-testid="button-mark-all-present"><Check size={14}/>Mark all present</button><button className="btn-secondary text-[11px]" onClick={() => markAll('Absent')} data-testid="button-mark-all-absent">Mark all absent</button></div></div>
      <div className="border-b border-[#edf1f4] p-3"><SearchBox value={query} onChange={setQuery} placeholder="Find a student"/></div>
      <div className="divide-y divide-[#edf1f4]">{classStudents.length ? classStudents.map((s, i) => { const current = attendance[s.id] ?? 'Present'; return <div key={s.id} className="flex items-center gap-3 px-4 py-3.5" data-testid={`row-attendance-${s.id}`}><span className="w-7 text-center text-[11px] text-[#98a6b1]">{String(i + 1).padStart(2, '0')}</span><Avatar name={s.name}/><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-[#304b63]">{s.name}</p><p className="text-[10px] text-[#91a0ac]">Roll no. {s.roll}</p></div><div className="flex gap-1 rounded-lg bg-[#f1f5f7] p-1"><button onClick={() => saveAttendance(s.id, 'Present')} className={`rounded-md px-3 py-1.5 text-[11px] font-bold ${current === 'Present' ? 'bg-white text-[#347c5a] shadow-sm' : 'text-[#8696a3]'}`} aria-label={`Mark ${s.name} present`} data-testid={`button-present-${s.id}`}>Present</button><button onClick={() => saveAttendance(s.id, 'Absent')} className={`rounded-md px-3 py-1.5 text-[11px] font-bold ${current === 'Absent' ? 'bg-white text-[#a64e4c] shadow-sm' : 'text-[#8696a3]'}`} aria-label={`Mark ${s.name} absent`} data-testid={`button-absent-${s.id}`}>Absent</button></div></div>; }) : <EmptyState title="No students in this class" detail="Add a student record or try another class."/>}</div>
      <div className="flex items-center justify-between border-t border-[#e7edf2] bg-[#f9fbfc] px-4 py-3 text-[11px]"><span className="text-[#8393a0]">Attendance for this session</span><span className="font-bold text-[#42647c]">{present} present Â· {classStudents.length - present} absent</span></div>
    </div>
  </div>;
}
function ExamsPage({ exams, students, onAdd, onEdit }: { exams: Exam[]; students: Student[]; onAdd: () => void; onEdit: (exam: Exam) => void }) {
  const [query, setQuery] = useState(''); const [classFilter, setClassFilter] = useState('All classes');
  const [reportStudent, setReportStudent] = useState<string | null>(null);
  const shown = exams.filter(e => `${e.student} ${e.subject} ${e.name}`.toLowerCase().includes(query.toLowerCase()) && (classFilter === 'All classes' || e.className === classFilter));
  const avg = exams.length ? Math.round(exams.reduce((n, e) => n + e.marks / e.outOf * 100, 0) / exams.length) : 0;
  return <div className="fade-in"><PageTitle eyebrow="Learning progress" title="Exams & marks" detail="Keep assessments and student marks easy to find." action={<div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => downloadCsv('sidhi-vinayak-marks.csv', [['Assessment ID','Assessment','Student','Class','Subject','Date','Marks','Out of'], ...shown.map(exam => [exam.id,exam.name,exam.student,exam.className,exam.subject,exam.date,exam.marks,exam.outOf])])} data-testid="button-export-marks"><Download size={15}/>Export CSV</button><button className="btn-primary" onClick={onAdd} data-testid="button-add-mark"><Plus size={16}/>Add marks</button></div>}/>
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3"><Metric label="Assessments entered" value="12" sub="Across Classes 1â€“8" icon={BookOpen}/><Metric label="Average score" value={`${avg || 82}%`} sub="Unit Assessment 2" icon={Activity} tone="mint"/><Metric label="Marks to enter" value="3 classes" sub="Assessment closes 20 June" icon={Clock3} tone="gold"/></div>
    <div className="surface-card overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e7edf2] p-4 sm:flex-row"><SearchBox value={query} onChange={setQuery} placeholder="Search student, subject or exam"/><select className="field sm:w-[165px]" aria-label="Filter marks by class" value={classFilter} onChange={e => setClassFilter(e.target.value)} data-testid="filter-exam-class"><option>All classes</option>{Array.from({ length: 8 }, (_, i) => <option key={i}>Class {i + 1}</option>)}</select></div>
       <div className="table-scroll"><table className="data-table"><thead><tr><th>Assessment</th><th>Student</th><th>Class</th><th>Subject</th><th>Date</th><th>Score</th><th>Result</th><th>Actions</th></tr></thead><tbody>{shown.map(e => <tr key={e.id} data-testid={`row-exam-${e.id}`}><td><p className="font-bold text-[#304b63]">{e.name}</p><p className="text-[10px] text-[#91a0ac]">{e.id}</p></td><td>{e.student}</td><td>{e.className}</td><td>{e.subject}</td><td>{e.date}</td><td className="font-bold">{e.marks} <span className="font-normal text-[#91a0ac]">/ {e.outOf}</span></td><td><span className={`pill ${e.marks / e.outOf >= .6 ? 'pill-green' : 'pill-amber'}`}>{e.marks / e.outOf >= .8 ? 'Strong' : e.marks / e.outOf >= .6 ? 'On track' : 'Review'}</span></td><td><div className="flex gap-2"><button className="btn-secondary !p-2" onClick={() => onEdit(e)} aria-label={`Edit marks for ${e.student}`} data-testid={`button-edit-exam-${e.id}`}><Pencil size={14}/></button><button className="btn-secondary !px-2 !py-1.5 text-[11px]" onClick={() => setReportStudent(e.student)} aria-label={`View report card for ${e.student}`} data-testid={`button-report-card-${e.id}`}><FileText size={13}/>Report</button></div></td></tr>)}</tbody></table></div>{shown.length === 0 && <EmptyState title="No marks found" detail="Try changing the class or search filter."/>}
    </div><p className="mt-3 text-[11px] text-[#8494a1]">Showing fictional sample marks for {students.length} sample student records.</p>
    {reportStudent && <ReportCardModal studentName={reportStudent} student={students.find(s => s.name === reportStudent)} exams={exams.filter(e => e.student === reportStudent)} onClose={() => setReportStudent(null)}/>}
  </div>;
}
function StaffPage({ staff, onAdd, onEdit, onDelete }: { staff: Staff[]; onAdd: () => void; onEdit: (staff: Staff) => void; onDelete: (staff: Staff) => void }) {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All staff');
  const shown = staff.filter(s => `${s.name} ${s.subject} ${s.role}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All staff' || s.status === filter));
  return <div className="fade-in"><PageTitle eyebrow="People at Sidhi Vinayak Public School" title="Staff directory" detail="Teacher and staff contacts for the everyday running of school." action={<div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => downloadCsv('sidhi-vinayak-staff.csv', [['Staff ID','Name','Role','Subject','Contact','Status'], ...shown.map(member => [member.id,member.name,member.role,member.subject,member.phone,member.status])])} data-testid="button-export-staff"><Download size={15}/>Export CSV</button><button className="btn-primary" onClick={onAdd} data-testid="button-add-staff"><Plus size={16}/>Add staff member</button></div>}/>
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3"><Metric label="Staff members" value={String(staff.length + 19)} sub="Supporting Classes 1â€“8" icon={Users}/><Metric label="Teachers" value="18" sub="Class and subject teachers" icon={GraduationCap} tone="mint"/><Metric label="On duty today" value="21 / 22" sub="One planned leave" icon={CheckCircle2} tone="gold"/></div>
    <div className="surface-card overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e7edf2] p-4 sm:flex-row"><SearchBox value={query} onChange={setQuery} placeholder="Search name, role or subject"/><select className="field sm:w-[160px]" aria-label="Filter by staff status" value={filter} onChange={e => setFilter(e.target.value)} data-testid="filter-staff-status"><option>All staff</option><option>On duty</option><option>On leave</option></select><span className="self-center text-[11px] text-[#8595a3]">{shown.length} listed</span></div>
      <div className="divide-y divide-[#edf1f4]">{shown.map(s => <div className="flex items-center gap-3 px-4 py-4 md:px-5" key={s.id} data-testid={`row-staff-${s.id}`}><Avatar name={s.name}/><div className="min-w-0 flex-1"><p className="text-[13px] font-bold text-[#304b63]">{s.name}</p><p className="mt-0.5 text-[11px] text-[#8595a3]">{s.role} Â· {s.subject}</p></div><span className="hidden text-[12px] text-[#61788a] sm:block">{s.phone}</span><span className={`pill ${s.status === 'On duty' ? 'pill-green' : 'pill-amber'}`}>{s.status}</span><button className="btn-secondary !p-2" onClick={() => onEdit(s)} aria-label={`Edit ${s.name}`} data-testid={`button-edit-staff-${s.id}`}><Pencil size={14}/></button><button
  className="btn-secondary !p-2"
  onClick={() => onDelete(s)}
  aria-label={`Delete ${s.name}`}
  data-testid={`button-delete-staff-${s.id}`}
>
  <Trash2 size={14}/>
</button></div>)}
      {shown.length === 0 && <EmptyState title="No staff match" detail="Try a different search or status filter."/>}</div>
    </div><p className="mt-3 text-[11px] text-[#8494a1]">Contact details are fictional and provided for demonstration.</p>
  </div>;
}
function AcademicsPage({ timetable, onAdd, onEdit }: { timetable: TimetableEntry[]; onAdd: () => void; onEdit: (entry: TimetableEntry) => void }) {
  const [classFilter, setClassFilter] = useState('Class 5');
  const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const subjects = ['English', 'Hindi', 'Mathematics', 'Environmental Studies', 'Science', 'Social Studies', 'Art & Craft', 'Physical Education'];
  const entries = timetable.filter(entry => entry.className === classFilter);
  return <div className="fade-in">
    <PageTitle eyebrow="Classes Â· subjects Â· weekly plan" title="Academics" detail="Classroom essentials and the weekly timetable in one place." action={<button className="btn-primary" onClick={onAdd} data-testid="button-add-timetable"><Plus size={16}/>Add timetable entry</button>}/>
    <div className="mb-5 grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
      <section className="surface-card p-5"><div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f3fa] text-[#36799f]"><GraduationCap size={19}/></span><div><h3 className="font-display font-extrabold text-[#253e56]">Classes</h3><p className="text-[11px] text-[#8392a0]">School sections in this prototype</p></div></div><div className="grid grid-cols-2 gap-2">{Array.from({ length: 8 }, (_, i) => <button key={i} onClick={() => setClassFilter(`Class ${i + 1}`)} className={`rounded-lg border px-3 py-2.5 text-left text-[12px] font-bold ${classFilter === `Class ${i + 1}` ? 'border-[#8fc0d8] bg-[#edf7fb] text-[#286b8b]' : 'border-[#e4ebef] text-[#526d81] hover:bg-[#f6fafc]'}`} data-testid={`button-class-${i + 1}`}>Class {i + 1}<span className="mt-1 block text-[10px] font-normal text-[#91a0ac]">Section A</span></button>)}</div></section>
      <section className="surface-card p-5"><div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f5ef] text-[#398367]"><BookOpen size={19}/></span><div><h3 className="font-display font-extrabold text-[#253e56]">Subjects</h3><p className="text-[11px] text-[#8392a0]">Core learning areas Â· Classes 1â€“8</p></div></div><div className="flex flex-wrap gap-2">{subjects.map(subject => <span key={subject} className="rounded-full border border-[#e1eaf0] bg-[#f8fbfc] px-3 py-2 text-[11px] font-semibold text-[#526d81]" data-testid={`subject-${subject.toLowerCase().replaceAll(' ', '-')}`}>{subject}</span>)}</div><p className="mt-4 text-[11px] text-[#8392a0]">Subject list is illustrative and shared across class sections.</p></section>
    </div>
    <section className="surface-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#e7edf2] p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-display font-extrabold text-[#253e56]">Weekly timetable</h3><p className="mt-1 text-[11px] text-[#8392a0]">Edit any slot to keep the class plan current.</p></div><label className="text-[11px] font-bold text-[#6d8294]">CLASS<select className="field mt-1 w-full sm:w-[160px]" value={classFilter} onChange={e => setClassFilter(e.target.value)} aria-label="Timetable class" data-testid="filter-timetable-class">{Array.from({ length: 8 }, (_, i) => <option key={i}>Class {i + 1}</option>)}</select></label></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Day</th><th>Period</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Action</th></tr></thead><tbody>{week.flatMap(day => entries.filter(entry => entry.day === day).map(entry => <tr key={entry.id} data-testid={`row-timetable-${entry.id}`}><td className="font-bold">{day}</td><td>{entry.period}</td><td>{entry.time}</td><td>{entry.subject}</td><td>{entry.teacher}</td><td><button className="btn-secondary !p-2" onClick={() => onEdit(entry)} aria-label={`Edit ${day} ${entry.period}`} data-testid={`button-edit-timetable-${entry.id}`}><Pencil size={14}/></button></td></tr>))}</tbody></table></div>
      {entries.length === 0 && <EmptyState title="No timetable entries for this class" detail="Add a weekly slot to begin building the class schedule."/>}
      <div className="border-t border-[#edf1f4] px-4 py-3 text-[11px] text-[#8392a0]">Illustrative timetable Â· no official school schedule is represented.</div>
    </section>
  </div>;
}

function ReportCardModal({ studentName, student, exams, onClose }: { studentName: string; student?: Student; exams: Exam[]; onClose: () => void }) {
  const average = exams.length ? Math.round(exams.reduce((total, exam) => total + exam.marks / exam.outOf * 100, 0) / exams.length) : 0;
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="report-card-heading" data-testid="dialog-report-card">
    <div className="no-print flex items-center justify-between border-b border-[#e7edf2] px-5 py-4"><div><h2 className="font-display font-extrabold text-[#253e56]">Student report card</h2><p className="text-[11px] text-[#8393a0]">Fictional assessment summary</p></div><button onClick={onClose} aria-label="Close report card" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#edf3f6]" data-testid="button-close-report-card"><X size={17}/></button></div>
    <div id="report-card-print" className="p-6"><div className="border-b-2 border-[#244c6b] pb-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#71899a]">Sidhi Vinayak Public School</p><h2 id="report-card-heading" className="mt-2 font-display text-xl font-extrabold text-[#203951]">Assessment report</h2><p className="mt-1 text-xs text-[#74899a]">{studentName} Â· {student?.className ?? exams[0]?.className ?? 'Class'} Â· Roll {student?.roll ?? 'â€”'}</p></div><div className="table-scroll mt-4"><table className="data-table"><thead><tr><th>Assessment</th><th>Subject</th><th>Score</th><th>Date</th></tr></thead><tbody>{exams.map(exam => <tr key={exam.id}><td>{exam.name}</td><td>{exam.subject}</td><td>{exam.marks} / {exam.outOf}</td><td>{exam.date}</td></tr>)}</tbody></table></div><div className="mt-4 rounded-lg bg-[#edf6f8] p-4"><span className="text-xs text-[#527185]">Average percentage</span><strong className="float-right text-lg text-[#244b68]">{average}%</strong></div><p className="mt-4 text-center text-[10px] text-[#8b9ba6]">Illustrative sample report card Â· not an official academic record.</p></div>
    <div className="no-print flex justify-end gap-2 border-t border-[#e7edf2] px-5 py-4"><button className="btn-secondary" onClick={onClose} data-testid="button-dismiss-report">Close</button><button className="btn-primary" onClick={() => window.print()} data-testid="button-print-report-card"><Printer size={15}/>Print report card</button></div>
  </section></div>;
}
function ReportsPage({ students, fees, exams, attendance }: { students: Student[]; fees: Fee[]; exams: Exam[]; attendance: Record<string, string> }) {
  const [period, setPeriod] = useState('June 2025'); const [classFilter, setClassFilter] = useState('All classes');
  const shownStudents = students.filter(s => classFilter === 'All classes' || s.className === classFilter);
  const due = fees.filter(f => f.status === 'Due').length + 14;
  const paid = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0) + 384600;
  const present = Object.values(attendance).filter(a => a === 'Present').length + 178;
  const cards = [
    { label: 'Fee collection', value: money(paid), sub: `${period} payments received`, icon: IndianRupee, color: 'bg-[#e6f5ef] text-[#338363]' },
    { label: 'Outstanding accounts', value: String(due), sub: 'Family follow-ups due', icon: Clock3, color: 'bg-[#fff3df] text-[#a37220]' },
    { label: 'Average attendance', value: '96.8%', sub: `${present} students present today`, icon: ClipboardCheck, color: 'bg-[#e8f3fa] text-[#36799f]' },
    { label: 'Marks recorded', value: String(exams.length + 148), sub: 'Assessment entries this term', icon: BookOpen, color: 'bg-[#f1eefb] text-[#7561a9]' },
  ];
  return <div className="fade-in"><PageTitle eyebrow="School summaries" title="Reports" detail="Useful snapshots for the school office and family meetings." action={<div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => downloadCsv('sidhi-vinayak-summary.csv', [['Metric','Illustrative value'], ['Reporting period',period], ['Students in scope',shownStudents.length], ['Fees collected INR',paid], ['Outstanding accounts',due], ['Attendance present',present], ['Marks recorded',exams.length + 148]])} data-testid="button-export-report-csv"><Download size={15}/>Download CSV</button><button className="btn-secondary" onClick={() => window.print()} data-testid="button-export-report"><Printer size={15}/>Print report</button></div>}/>
    <div className="surface-card mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-end"><label className="flex-1 text-[11px] font-bold text-[#6d8294]">REPORTING PERIOD<select className="field mt-1.5" value={period} onChange={e => setPeriod(e.target.value)} aria-label="Reporting period" data-testid="filter-report-period"><option>June 2025</option><option>May 2025</option><option>Term 1 Â· 2025</option></select></label><label className="flex-1 text-[11px] font-bold text-[#6d8294]">CLASS<select className="field mt-1.5" value={classFilter} onChange={e => setClassFilter(e.target.value)} aria-label="Report class filter" data-testid="filter-report-class"><option>All classes</option>{Array.from({ length: 8 }, (_, i) => <option key={i}>Class {i + 1}</option>)}</select></label><button className="btn-secondary" onClick={() => { setPeriod('June 2025'); setClassFilter('All classes'); }} data-testid="button-reset-report-filters"><Settings2 size={15}/>Reset filters</button></div>
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(({ label, value, sub, icon: Icon, color }) => <div className="surface-card p-4" key={label}><span className={`mb-3 grid h-9 w-9 place-items-center rounded-lg ${color}`}><Icon size={17}/></span><p className="text-[11px] font-semibold text-[#7c8e9d]">{label}</p><p className="font-display mt-1 text-[23px] font-extrabold tracking-tight text-[#243e57]">{value}</p><p className="mt-1 text-[10px] text-[#8b9aa6]">{sub}</p></div>)}</div>
    <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><section className="surface-card p-5"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-display text-[16px] font-extrabold text-[#253e56]">Collection overview</h3><p className="text-[11px] text-[#8392a0]">{period} Â· fictional sample totals</p></div><span className="pill pill-blue">Fees</span></div><div className="mb-2 flex items-end justify-between"><div><p className="font-display text-[28px] font-extrabold text-[#253e56]">{money(paid)}</p><p className="text-[11px] text-[#8495a2]">Collected this period</p></div><div className="text-right"><span className="flex items-center justify-end text-[11px] font-bold text-[#418967]"><ArrowUpRight size={14}/> 8.4%</span><p className="text-[10px] text-[#8b9aa6]">vs. last month</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf2f5]"><div className="h-full w-[82%] rounded-full bg-[#4c9b85]"/></div><div className="mt-2 flex justify-between text-[10px] text-[#8999a5]"><span>82% of expected fees</span><span>Target {money(469000)}</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#edf1f4] pt-4"><div><p className="text-[10px] text-[#8495a2]">Payments received</p><p className="mt-1 font-bold text-[#35536b]">{fees.filter(f => f.status === 'Paid').length + 148} accounts</p></div><div><p className="text-[10px] text-[#8495a2]">Outstanding follow-up</p><p className="mt-1 font-bold text-[#35536b]">{due} accounts</p></div></div></section>
      <section className="surface-card p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-display text-[16px] font-extrabold text-[#253e56]">Student distribution</h3><p className="text-[11px] text-[#8392a0]">{shownStudents.length} sample records in selected scope</p></div><Users size={18} className="text-[#6f8ba0]"/></div><div className="space-y-3">{Array.from({ length: 8 }, (_, i) => { const cls = `Class ${i + 1}`; const count = shownStudents.filter(s => s.className === cls).length + (classFilter === 'All classes' ? 21 + (i % 4) : 0); return <div key={cls} className="flex items-center gap-3"><span className="w-[64px] text-[11px] text-[#657d91]">{cls}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#edf2f5]"><div className="h-full rounded-full bg-[#78b5d2]" style={{ width: `${Math.max(9, count / 32 * 100)}%` }}/></div><strong className="w-7 text-right text-[11px] text-[#3d5a70]">{count}</strong></div>; })}</div></section></div>
    <div className="mt-4 rounded-xl border border-[#d8e7ee] bg-[#eff7fa] p-4 text-[11px] leading-relaxed text-[#668093]"><strong className="text-[#3c6178]">About this report.</strong> Figures combine sample summary totals with the fictional records shown in this prototype. They are illustrative only and are not financial or official school records.</div>
  </div>;
}
function RecordDialog({ kind, item, students, onClose, onSave }: { kind: string; item?: Record<string, string | number>; students: Student[]; onClose: () => void; onSave: (data: Record<string, string>) => void }) {
  const title = kind === 'student' ? item ? 'Edit student record' : 'Add a student' : kind === 'staff' ? item ? 'Edit staff details' : 'Add staff member' : kind === 'exam' ? item ? 'Edit marks' : 'Record marks' : kind === 'payment' ? 'Record a fee payment' : item ? 'Edit timetable entry' : 'Add a timetable entry';
  const fields = kind === 'student'
    ? [['name', 'Student name', 'text'], ['className', 'Class', 'select'], ['roll', 'Roll number', 'text'], ['guardian', 'Parent / guardian', 'text'], ['phone', 'Contact number', 'tel']]
    : kind === 'staff'
      ? [['name', 'Full name', 'text'], ['role', 'Role', 'text'], ['subject', 'Subject / responsibility', 'text'], ['assignedClass', 'Assigned Class', 'select'], ['phone', 'Contact number', 'tel'], ['status', 'Status', 'status']]
    : kind === 'exam'
        ? [['student', 'Student', 'student'], ['className', 'Class', 'select'], ['name', 'Assessment', 'text'], ['subject', 'Subject', 'text'], ['date', 'Date', 'text'], ['marks', 'Marks earned', 'number'], ['outOf', 'Out of', 'number']]
        : kind === 'payment'
          ? [['studentId', 'Student', 'studentId'], ['month', 'Fee month', 'month'], ['amount', 'Amount (â‚¹)', 'number'], ['method', 'Payment method', 'method']]
          : [['className', 'Class', 'select'], ['day', 'Day', 'day'], ['period', 'Period', 'period'], ['time', 'Time slot', 'text'], ['subject', 'Subject', 'text'], ['teacher', 'Teacher', 'text']];
  const form = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(fields.map(([name, , type]) => {
      const savedValue = item?.[name];
      if (savedValue != null) return [name, String(savedValue)];
      if (type === 'select') return [name, 'Class 1'];
      if (type === 'student') return [name, students[0]?.name ?? ''];
      if (type === 'studentId') return [name, students[0]?.id ?? ''];
      if (type === 'status') return [name, 'On duty'];
      if (type === 'month') return [name, 'June 2025'];
      if (type === 'method') return [name, 'UPI'];
      if (type === 'day') return [name, 'Monday'];
      if (type === 'period') return [name, 'Period 1'];
      return [name, ''];
    })),
  });
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="dialog-title" data-testid="dialog-record"><div className="flex items-start justify-between border-b border-[#e7edf2] px-5 py-4"><div><h2 id="dialog-title" className="font-display text-[18px] font-extrabold text-[#253e56]">{title}</h2><p className="mt-1 text-[11px] text-[#8393a0]">Sample workspace Â· changes are not saved after reload</p></div><button onClick={onClose} aria-label="Close form" className="grid h-8 w-8 place-items-center rounded-lg text-[#8393a0] hover:bg-[#edf3f6]" data-testid="button-close-dialog"><X size={17}/></button></div>
    <Form {...form}><form className="space-y-3 p-5" onSubmit={form.handleSubmit(onSave)} data-testid="form-record">
      <div className="grid gap-3 sm:grid-cols-2">{fields.map(([name, label, type]) => {
        if (type === 'select') return <label className="text-[11px] font-bold text-[#6d8294]" key={name}>{label}<select className="field mt-1.5 font-normal" {...form.register(name)} required data-testid={`input-${name}`}>{Array.from({ length: 8 }, (_, i) => <option key={i}>Class {i + 1}</option>)}</select></label>;
        if (type === 'student' || type === 'studentId') return <label className="text-[11px] font-bold text-[#6d8294]" key={name}>{label}<select className="field mt-1.5 font-normal" {...form.register(name)} required data-testid={`input-${name}`}>{students.map(s => <option key={s.id} value={type === 'studentId' ? s.admissionNumber : s.name}>{s.name} Â· {s.className}</option>)}</select></label>;
        if (type === 'status') return <label className="text-[11px] font-bold text-[#6d8294]" key={name}>{label}<select className="field mt-1.5 font-normal" {...form.register(name)} data-testid={`input-${name}`}><option>On duty</option><option>On leave</option></select></label>;
        if (type === 'month') return <label className="text-[11px] font-bold text-[#6d8294]" key={name}>{label}<select className="field mt-1.5 font-normal" {...form.register(name)} data-testid={`input-${name}`}><option>June 2025</option><option>May 2025</option><option>April 2025</option></select></label>;
        if (type === 'method') return <label className="text-[11px] font-bold text-[#6d8294]" key={name}>{label}<select className="field mt-1.5 font-normal" {...form.register(name)} data-testid={`input-${name}`}><option>UPI</option><option>Cash</option><option>Bank transfer</option><option>Cheque</option></select></label>;
        if (type === 'day') return <label className="text-[11px] font-bold text-[#6d8294]" key={name}>{label}<select className="field mt-1.5 font-normal" {...form.register(name)} required data-testid={`input-${name}`}>{['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => <option key={day}>{day}</option>)}</select></label>;
        if (type === 'period') return <label className="text-[11px] font-bold text-[#6d8294]" key={name}>{label}<select className="field mt-1.5 font-normal" {...form.register(name)} required data-testid={`input-${name}`}>{Array.from({length: 8}, (_, i) => <option key={i}>Period {i + 1}</option>)}</select></label>;
        return <label className="text-[11px] font-bold text-[#6d8294]" key={name}>{label}<input className="field mt-1.5 font-normal" {...form.register(name)} type={type} placeholder={label} required min={type === 'number' ? 0 : undefined} data-testid={`input-${name}`}/></label>;
      })}</div>
      <div className="flex justify-end gap-2 border-t border-[#edf1f4] pt-4"><button type="button" className="btn-secondary" onClick={onClose} data-testid="button-cancel-record">Cancel</button><button className="btn-primary" type="submit" data-testid="button-save-record"><Check size={15}/>{kind === 'payment' ? 'Mark as paid' : kind === 'timetable' ? 'Save timetable entry' : 'Save changes'}</button></div>
    </form></Form>
  </section></div>;
}
function ReceiptModal({ fee, onClose }: { fee: Fee; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="receipt-heading"><div className="no-print flex items-center justify-between border-b border-[#e7edf2] px-5 py-4"><div><h2 className="font-display font-extrabold text-[#253e56]">Payment receipt</h2><p className="text-[11px] text-[#8393a0]">Ready to print Â· sample receipt</p></div><button onClick={onClose} aria-label="Close receipt" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#edf3f6]" data-testid="button-close-receipt"><X size={17}/></button></div><div id="receipt-print" className="receipt p-6"><div className="flex items-start justify-between border-b-2 border-[#244c6b] pb-4"><div><div className="flex items-center gap-2"><GraduationCap size={24} className="text-[#2e779a]"/><h2 id="receipt-heading" className="font-display text-[20px] font-extrabold text-[#203951]">Sidhi Vinayak Public School</h2></div><p className="mt-1 text-[11px] text-[#74899a]">School office Â· Sample receipt</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7890a0]">Receipt no.</p><p className="mt-1 font-mono text-[13px] font-bold text-[#284760]">{fee.id}</p></div></div><div className="py-5"><p className="text-[10px] font-bold uppercase tracking-wider text-[#8295a3]">Received with thanks from</p><p className="mt-1 text-[18px] font-bold text-[#29455e]">{fee.student}</p><p className="mt-0.5 text-[12px] text-[#74899a]">{fee.className} Â· Student ID {fee.studentId}</p></div><div className="space-y-3 border-y border-dashed border-[#cfdbe3] py-4 text-[12px]"><div className="flex justify-between"><span className="text-[#738899]">Fee period</span><strong>{fee.month}</strong></div><div className="flex justify-between"><span className="text-[#738899]">Payment method</span><strong>{fee.method}</strong></div><div className="flex justify-between"><span className="text-[#738899]">Date received</span><strong>{fee.date}</strong></div><div className="flex justify-between"><span className="text-[#738899]">Payment status</span><span className="pill pill-green">Paid</span></div></div><div className="my-4 flex items-center justify-between rounded-lg bg-[#edf6f8] px-4 py-3"><span className="text-[12px] font-semibold text-[#527185]">Amount received</span><strong className="font-display text-[22px] font-extrabold text-[#244b68]">{money(fee.amount)}</strong></div><p className="text-center text-[10px] text-[#8b9ba6]">Thank you. This is a fictional sample receipt for prototype use only.</p></div><div className="no-print flex justify-end gap-2 border-t border-[#e7edf2] px-5 py-4"><button className="btn-secondary" onClick={onClose}>Close</button><button className="btn-primary" onClick={() => window.print()} data-testid="button-print-receipt"><Printer size={15}/>Print receipt</button></div></section></div>;
}
function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="grid min-h-[170px] place-items-center px-5 py-8 text-center"><div><span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-[#edf4f8] text-[#6086a0]"><Search size={17}/></span><p className="text-[13px] font-bold text-[#405d73]">{title}</p><p className="mt-1 text-[11px] text-[#8797a3]">{detail}</p></div></div>; }
function NotFound() { return <div className="surface-card mx-auto max-w-lg p-8 text-center"><h2 className="font-display text-xl font-extrabold text-[#233e56]">Page not found</h2><p className="mt-2 text-sm text-[#7e909e]">That school record page isn't available.</p><Link className="mt-4 inline-flex text-sm font-bold text-[#347da1]" href="/">Return to overview</Link></div>; }

export default function RoutedApp() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><App/></WouterRouter>;
}
















