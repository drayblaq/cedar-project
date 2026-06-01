/* Cedar Training Center — sample data layer (Cotonou, Bénin)
   Plain JS, attached to window.CEDAR. Loaded before the React components. */
(function () {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const programs = [
    { id: "gen", name: "General English", color: "#2ea82a" },
    { id: "biz", name: "Business English", color: "#1a6b18" },
    { id: "exam", name: "IELTS · TOEFL · TOEIC", color: "#d4a843" },
    { id: "int", name: "Intensive", color: "#3f7d8c" },
  ];

  // ── Students ──
  const students = [
    { id: "s01", name: "Chimène Adjovi",       level: "B1", program: "gen",  enrolled: "2025-09-03", phone: "+229 97 41 22 08", attendance: 94, balance: 0,       avgScore: 82, status: "active", login: true },
    { id: "s02", name: "Rashidat Bello",        level: "A2", program: "gen",  enrolled: "2025-09-15", phone: "+229 96 18 70 31", attendance: 88, balance: 25000,   avgScore: 74, status: "active", login: true },
    { id: "s03", name: "Ange Hounkpatin",       level: "C1", program: "exam", enrolled: "2025-08-21", phone: "+229 95 02 64 19", attendance: 97, balance: 0,       avgScore: 91, status: "active", login: true },
    { id: "s04", name: "Fadel Soumanou",        level: "B2", program: "biz",  enrolled: "2025-10-01", phone: "+229 67 33 90 55", attendance: 79, balance: 60000,   avgScore: 68, status: "active", login: false },
    { id: "s05", name: "Mariam Tidjani",        level: "A1", program: "gen",  enrolled: "2026-01-12", phone: "+229 94 50 11 73", attendance: 91, balance: 0,       avgScore: 77, status: "active", login: true },
    { id: "s06", name: "Gérard Dossou",         level: "B1", program: "int",  enrolled: "2025-11-04", phone: "+229 97 88 26 40", attendance: 85, balance: 40000,   avgScore: 80, status: "active", login: true },
    { id: "s07", name: "Sandrine Aïkpé",        level: "B2", program: "exam", enrolled: "2025-09-29", phone: "+229 96 70 44 12", attendance: 96, balance: 0,       avgScore: 88, status: "active", login: true },
    { id: "s08", name: "Ibrahim Lawani",        level: "A2", program: "gen",  enrolled: "2026-02-02", phone: "+229 95 61 38 27", attendance: 72, balance: 30000,   avgScore: 65, status: "active", login: false },
    { id: "s09", name: "Florentine Koudjo",     level: "C1", program: "biz",  enrolled: "2025-08-11", phone: "+229 67 19 55 84", attendance: 98, balance: 0,       avgScore: 93, status: "active", login: true },
    { id: "s10", name: "Marius Agbodjan",       level: "B1", program: "gen",  enrolled: "2025-12-08", phone: "+229 94 27 63 09", attendance: 83, balance: 15000,   avgScore: 75, status: "active", login: true },
    { id: "s11", name: "Nadège Zinsou",         level: "A1", program: "int",  enrolled: "2026-01-26", phone: "+229 97 04 81 50", attendance: 90, balance: 0,       avgScore: 79, status: "active", login: false },
    { id: "s12", name: "Boukari Issa",          level: "B2", program: "biz",  enrolled: "2025-10-19", phone: "+229 96 52 17 66", attendance: 87, balance: 50000,   avgScore: 84, status: "active", login: true },
    { id: "s13", name: "Carine Houngbédji",     level: "C2", program: "exam", enrolled: "2025-07-30", phone: "+229 95 33 70 22", attendance: 99, balance: 0,       avgScore: 95, status: "active", login: true },
    { id: "s14", name: "Romaric Tossou",        level: "A2", program: "gen",  enrolled: "2026-02-14", phone: "+229 67 80 49 13", attendance: 68, balance: 45000,   avgScore: 62, status: "paused", login: false },
    { id: "s15", name: "Sariatou Bachabi",      level: "B1", program: "gen",  enrolled: "2025-11-22", phone: "+229 94 66 02 38", attendance: 92, balance: 0,       avgScore: 81, status: "active", login: true },
    { id: "s16", name: "Prince Ahouandjinou",   level: "C1", program: "biz",  enrolled: "2025-09-08", phone: "+229 97 15 73 90", attendance: 95, balance: 20000,   avgScore: 89, status: "active", login: true },
  ];

  const programName = (id) => (programs.find((p) => p.id === id) || {}).name || id;

  // ── Staff ──
  const staff = [
    { id: "t1", name: "Daniel Okonkwo",  role: "Senior Instructor", classes: ["c1", "c3"], email: "d.okonkwo@cedar.bj" },
    { id: "t2", name: "Patricia Sossou",  role: "Instructor",        classes: ["c2"],       email: "p.sossou@cedar.bj" },
    { id: "t3", name: "Emmanuel Adéyemi", role: "Exam Prep Lead",    classes: ["c4"],       email: "e.adeyemi@cedar.bj" },
  ];

  // ── Classes ──
  const classes = [
    { id: "c1", name: "General English — B1 Morning", level: "B1", teacher: "t1", room: "Salle 2", schedule: "Mon · Wed · Fri — 08:30", count: 14 },
    { id: "c2", name: "Foundations — A1/A2 Evening",  level: "A2", teacher: "t2", room: "Salle 1", schedule: "Tue · Thu — 18:00",       count: 12 },
    { id: "c3", name: "Business English — B2",         level: "B2", teacher: "t1", room: "Salle 4", schedule: "Mon · Wed — 17:30",      count: 11 },
    { id: "c4", name: "IELTS Intensive — C1",          level: "C1", teacher: "t3", room: "Salle 3", schedule: "Sat — 09:00 (4h)",       count: 9 },
  ];

  // ── Payments (recent) ──
  const payments = [
    { id: "p1",  student: "Chimène Adjovi",     amount: 90000,  method: "Mobile Money", date: "2026-05-28", program: "General English",  status: "paid" },
    { id: "p2",  student: "Ange Hounkpatin",    amount: 120000, method: "Bank transfer", date: "2026-05-26", program: "IELTS Prep",       status: "paid" },
    { id: "p3",  student: "Florentine Koudjo",  amount: 110000, method: "Cash",          date: "2026-05-24", program: "Business English", status: "paid" },
    { id: "p4",  student: "Fadel Soumanou",     amount: 60000,  method: "Mobile Money",  date: "2026-05-22", program: "Business English", status: "partial" },
    { id: "p5",  student: "Sandrine Aïkpé",     amount: 120000, method: "Mobile Money",  date: "2026-05-20", program: "TOEFL Prep",       status: "paid" },
    { id: "p6",  student: "Carine Houngbédji",  amount: 120000, method: "Bank transfer", date: "2026-05-18", program: "TOEIC Prep",       status: "paid" },
    { id: "p7",  student: "Marius Agbodjan",    amount: 45000,  method: "Cash",          date: "2026-05-15", program: "General English",  status: "partial" },
    { id: "p8",  student: "Boukari Issa",       amount: 50000,  method: "Mobile Money",  date: "2026-05-12", program: "Business English", status: "partial" },
  ];

  // revenue by month (XOF, thousands)
  const revenueByMonth = [
    { m: "Dec", v: 1180 }, { m: "Jan", v: 1620 }, { m: "Feb", v: 1485 },
    { m: "Mar", v: 1910 }, { m: "Apr", v: 1740 }, { m: "May", v: 2240 },
  ];

  // enrollment by level
  const enrollmentByLevel = levels.map((l) => ({
    level: l,
    count: students.filter((s) => s.level === l).length,
  }));

  // ── Grades ──
  const grades = [
    { student: "Chimène Adjovi",    subject: "Speaking",   term: "Term 2", score: 84, remark: "Confident, expand vocabulary",   date: "2026-05-20" },
    { student: "Chimène Adjovi",    subject: "Writing",    term: "Term 2", score: 79, remark: "Good structure",                 date: "2026-05-14" },
    { student: "Ange Hounkpatin",   subject: "Listening",  term: "Term 2", score: 92, remark: "Excellent comprehension",        date: "2026-05-19" },
    { student: "Sandrine Aïkpé",    subject: "Reading",    term: "Term 2", score: 88, remark: "Strong inference skills",         date: "2026-05-17" },
    { student: "Florentine Koudjo", subject: "Speaking",   term: "Term 2", score: 95, remark: "Near-native fluency",            date: "2026-05-16" },
    { student: "Fadel Soumanou",    subject: "Writing",    term: "Term 2", score: 66, remark: "Work on cohesion & tenses",      date: "2026-05-13" },
  ];

  // ── Announcements ──
  const announcements = [
    { id: "a1", title: "Term 3 placement tests — 9 June", body: "All continuing students must confirm their slot at reception by 6 June. Bring your student ID.", date: "2026-05-29", tag: "Academic" },
    { id: "a2", title: "Centre closed — Whit Monday", body: "Cedar Training Center will be closed Monday 8 June for the public holiday. Classes resume Tuesday.", date: "2026-05-27", tag: "Notice" },
    { id: "a3", title: "New IELTS mock exam dates", body: "Two full mock IELTS sessions are scheduled for 14 & 21 June, 09:00 in Salle 3. Register with Mr. Adéyemi.", date: "2026-05-23", tag: "Exam" },
  ];

  // ── Calendar events ──
  const events = [
    { id: "e1", title: "Term 3 placement tests", date: "2026-06-09", type: "exam" },
    { id: "e2", title: "Whit Monday — closed",   date: "2026-06-08", type: "holiday" },
    { id: "e3", title: "IELTS mock exam",         date: "2026-06-14", type: "exam" },
    { id: "e4", title: "Parent–teacher evening",  date: "2026-06-18", type: "event" },
    { id: "e5", title: "Term 3 begins",           date: "2026-06-23", type: "term" },
  ];

  // ── Progress over terms (for student/parent graphs) ──
  const progressSeries = [
    { term: "T1 ’25", score: 61 },
    { term: "T2 ’25", score: 68 },
    { term: "T3 ’25", score: 74 },
    { term: "T1 ’26", score: 79 },
    { term: "T2 ’26", score: 84 },
  ];

  // student-facing attendance log
  const attendanceLog = [
    { date: "2026-05-29", status: "present" },
    { date: "2026-05-27", status: "present" },
    { date: "2026-05-24", status: "late" },
    { date: "2026-05-22", status: "present" },
    { date: "2026-05-20", status: "present" },
    { date: "2026-05-17", status: "absent" },
    { date: "2026-05-15", status: "present" },
    { date: "2026-05-13", status: "present" },
  ];

  const fmtXOF = (n) =>
    new Intl.NumberFormat("fr-FR").format(n) + " CFA";

  const fmtDate = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const initials = (name) =>
    name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  // deterministic soft avatar color from name
  const avatarColor = (name) => {
    const palette = ["#2ea82a", "#1a6b18", "#d4a843", "#3f7d8c", "#8c6a3f", "#6a8c3f"];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  };

  window.CEDAR = {
    levels, programs, students, staff, classes, payments,
    revenueByMonth, enrollmentByLevel, grades, announcements, events,
    progressSeries, attendanceLog,
    programName, fmtXOF, fmtDate, initials, avatarColor,
    // headline metrics
    metrics: {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === "active").length,
      revenueMonth: 2240000,
      attendanceRate: Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length),
      outstanding: students.reduce((a, s) => a + s.balance, 0),
      withLogin: students.filter((s) => s.login).length,
    },
  };

  window.toast = (msg) => window.dispatchEvent(new CustomEvent("cedar-toast", { detail: msg }));
})();
