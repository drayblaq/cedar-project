# Cedar Training Center — What’s Done on the Site

Summary of what is currently implemented (as of Phase 6 complete).

---

## 1. Public marketing website

- **Home** (`/`) — Hero, “English in Cotonou”, value proposition, CTAs.
- **About** (`/about`) — About the center.
- **Courses** (`/courses`) — Courses and English levels.
- **Contact** (`/contact`) — Contact form / info.
- **Testimonials** (`/testimonials`) — Testimonials section.
- **Register** (`/register`) — Public registration form; saves to `students` (no login created).
- **Location** — Map (e.g. Cotonou) where specified.
- **Logo & branding** — Cedar logo, favicon, shared header/footer.

---

## 2. Authentication

- **Login** (`/auth/login`) — Email/password via Supabase Auth; role-based redirect.
- **Sign up** (`/auth/signup`) — Info-only page; explains that student logins are created by the center after payment (no self-signup for students).
- **Roles** — Admin, Staff, Student, Parent (in DB and UI).
- **Session** — Cookie-based; dashboard protected; unauthenticated users sent to login.
- **Redirects by role:**
  - **Admin** → `/dashboard` (overview).
  - **Student** → `/dashboard/student`.
  - **Staff** → `/dashboard/staff`.
  - **Parent** → `/dashboard/parent`.

---

## 3. Admin dashboard (`/dashboard` and sub-routes)

- **Overview** (`/dashboard`) — Total students, payments count, attendance count, revenue this month, revenue-by-month chart, recent payments. Shown only to admin; students/staff/parents are redirected to their own area.
- **Students** (`/dashboard/students`) — List (name, email, phone, level, enrolled, login status); Add student; Edit; **Send login invite** (paid students only, invite by email).
- **Payments** (`/dashboard/payments`) — Record payment (student, amount, currency, date); list payments.
- **Attendance** (`/dashboard/attendance`) — Mark attendance by date; grid of students (present/absent/late).
- **Grades** (`/dashboard/grades`) — Add grade (student, term, subject, score, remarks); list recent grades.
- **Announcements** (`/dashboard/announcements`) — Create and delete announcements; list recent.
- **Calendar** (`/dashboard/calendar`) — Academic terms; calendar events (title, date, type); create/delete events.
- **Classes** (`/dashboard/classes`) — Create classes (level); assign staff to classes; create assignments; list classes and assignments.

All admin routes are under the same dashboard layout; URLs do not use `/admin` (e.g. `/dashboard/students` not `/dashboard/admin/students`). Admin-only sections are protected by a layout that redirects non-admins to `/dashboard`.

---

## 4. Staff dashboard

- **My classes** (`/dashboard/staff`) — List of assigned classes; per class: level, students in that level, link to mark attendance; list of assignments.
- **Attendance** (`/dashboard/staff/attendance`) — Choose class and date; mark attendance for that class’s students (same grid as admin, scoped to staff’s classes).

Staff cannot access payments or other admin-only areas.

---

## 5. Student portal (invite-only)

- **Access** — Students do not self-sign-up. Admin sends a **login invite** from the Students list (only after at least one payment); invite is sent by email; student sets password and signs in. First login links the auth user to the `students` row (by email).
- **My progress** (`/dashboard/student`) — Welcome, level; cards: Grades, Attendance %, Announcements, Calendar; recent grades; upcoming events.
- **Grades** (`/dashboard/student/grades`) — Table of own grades (subject, term, score, remarks, date).
- **Attendance** (`/dashboard/student/attendance`) — Attendance % summary; table of own attendance (date, status).
- **Announcements** (`/dashboard/student/announcements`) — Read-only list of center announcements.
- **Calendar** (`/dashboard/student/calendar`) — Upcoming and past events.

All student data is scoped to the linked `students` row (`user_id`).

---

## 6. Parent portal (before Phase 7)

- **Placeholder** (`/dashboard/parent`) — Stub message only; no linked children or data yet.

---

## 7. Database (Supabase / PostgreSQL)

- **Core:** `roles`, `profiles` (auth user + role), `levels`.
- **Students:** `students` (with `user_id` for portal login), `payments`, `attendance`.
- **Academics:** `academic_terms`, `calendar_events`, `grades`, `announcements`.
- **Classes:** `classes`, `staff_classes`, `assignments`.
- **Auth:** Supabase Auth; trigger creates profile with default “student” role; admin can set role to admin/staff/parent in DB or via script.
- **RLS:** Enabled on relevant tables; helpers `is_admin()`, `is_staff()`, `staff_teaches_class()`; public registration allowed for `students` (insert only, no auth).

---

## 8. Tech stack

- Next.js (App Router), React, TypeScript.
- Tailwind CSS, shared design system (e.g. emerald/teal, cards, glass header).
- Supabase: Auth, PostgreSQL, optional Storage.
- Server Actions for mutations; Server Components for data.
- Recharts for admin revenue chart.

---

## 9. Not done yet (or partial)

- **Parent portal** — Link parents to students; parent view of child progress, attendance, payments, announcements (Phase 7).
- **Documents** — Upload/store student documents (e.g. ID); optional documents table (mentioned in spec, not implemented).
- **Learning materials** — Materials table/Storage and student download (spec optional).
- **Receipts** — Printable/PDF receipt for payments (spec optional).
- **Security polish** — Stricter RLS so parents see only linked students’ data at DB level (Phase 8).
- **Deploy** — Vercel + env and domain (Phase 8).

---

*Next important phase: **Phase 7 — Parent portal** (link parents to students, parent dashboard with child progress, attendance, payments, announcements).*
