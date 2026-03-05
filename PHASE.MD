
Here’s a step-by-step plan so you can build the Cedar Training Center platform in order and keep each phase shippable.

---

## Phased implementation plan

### **Phase 1: Foundation (start here)**  
*Goal: project, DB, auth, and one public page*

1. **Project setup**
   - Next.js (App Router), Tailwind, TypeScript
   - Supabase: project + env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

2. **Database schema (core only)**
   - `users`, `roles`, `levels`
   - `students` (linked to `users`), `parents` (linked to `users`)
   - Row Level Security (RLS) policies for `users`/roles

3. **Auth**
   - Supabase Auth (email/password)
   - Role stored on `users` or in a `user_roles` table
   - Login page + redirect by role: `/dashboard/admin`, `/dashboard/staff`, `/dashboard/student`, `/dashboard/parent`

4. **One public page**
   - Home page (hero, short “About CTC”, CTA to register/contact) to validate layout and styling

**Checkpoint:** You can log in as different roles and land on the right dashboard (even if dashboards are still placeholder).

---

### **Phase 2: Public website**

5. **Public pages**
   - About, Courses & English levels, Contact, Testimonials
   - Registration form (writes to `students` + `users` or your chosen flow)
   - Location map (e.g. embed Google Maps for Cotonou)

**Checkpoint:** Full marketing site + registration working.

---

### **Phase 3: Admin – core operations**

6. **Admin: students & levels**
   - Tables: `classes`, `staff` (if needed), link students to levels/classes
   - Admin UI: list students, add/edit student, assign level, enrollment date

7. **Admin: documents**
   - Supabase Storage bucket for documents
   - Upload ID/passport, link to student; optional “documents” table

8. **Admin: payments**
   - Tables: `payments`, optionally `receipts`
   - Record payment, link to student, “unpaid students” view, simple receipt (e.g. PDF or printable page)

9. **Admin: attendance**
   - Table: `attendance` (student, date, class/session, status)
   - Mark present/absent per day or per session; monthly stats, export (CSV or similar)

**Checkpoint:** Admin can manage students, levels, documents, payments, and attendance.

---

### **Phase 4: Admin – academics & analytics**

10. **Admin: grades & remarks**
    - Tables: `grades`, optionally `academic_terms`
    - Add grades, speaking scores, teacher remarks, level progress

11. **Admin: announcements & calendar**
    - Tables: `announcements`, `academic_terms` (or `calendar_events`)
    - CRUD for announcements and academic terms/events

12. **Admin: analytics**
    - Dashboard: total students, active students, revenue (e.g. this month), completion rate, attendance rate
    - Use Supabase for aggregates; charts with something like Recharts or Chart.js

**Checkpoint:** Admin has full academic and reporting workflow.

---

### **Phase 5: Staff dashboard**

13. **Staff: classes & permissions**
    - Assign staff to classes (e.g. `staff_classes` or `classes.teacher_id`)
    - RLS so staff see only their classes/students

14. **Staff: attendance, grades, assignments**
    - Mark attendance for their classes
    - Add grades/comments; table `assignments`, upload to Storage, link to class/level
    - Staff UI: no access to payments or other admin-only areas

**Checkpoint:** Staff can do everything they need without seeing finance or other classes.

---

### **Phase 6: Student portal**

15. **Student: profile & progress**
    - Profile page: level, progress (e.g. grades over time), simple progress graph

16. **Student: grades, attendance, materials**
    - View grades and attendance %
    - List announcements, academic calendar
    - Learning materials: Storage bucket + “materials” table; download links

17. **Optional**
    - Speaking practice chatbot, assignment recordings (upload to Storage and link to assignment)

**Checkpoint:** Students see their own data and materials only.

---

### **Phase 7: Parent portal**

18. **Parent: link and data**
    - Table: e.g. `parent_students` (parent_id, student_id)
    - RLS: parents see only linked students

19. **Parent: UI**
    - View child progress, attendance, payment status, announcements, contact admin (e.g. contact form or mailto)

**Checkpoint:** Parents see only their children’s data.

---

### **Phase 8: Polish & deploy**

20. **Security & RBAC**
    - Review RLS for all roles; ensure students/parents/staff see only what they should

21. **UI polish**
    - Consistent layout, loading/error states, basic accessibility

22. **Deploy**
    - Vercel + Supabase; env vars; optional custom domain

---

## Suggested folder structure (matches your sketch)

```text
/app
  /page.tsx                 # public home
  /(public)/about, /courses, /contact, /register...
  /(auth)/login, /signup...
  /dashboard
    /admin/...
    /staff/...
    /student/...
    /parent/...
  /api/...                  # if you need route handlers
/components
  /ui/...                   # shared UI
  /dashboard/...           # dashboard-specific
/lib
  /supabase/...            # client & server
/types
/hooks
```

---

## Next concrete step

Start with **Phase 1**:

1. Create the Next.js app (App Router + Tailwind + TypeScript).
2. Create the Supabase project and add the first tables: `users` (or use Supabase Auth `auth.users` + extended profile), `roles`, `levels`, `students`, `parents`.
3. Implement login with Supabase Auth and role-based redirect to `/dashboard/admin`, `/dashboard/staff`, etc.

If you tell me your current state (e.g. “no code yet” or “Next.js already created”), I can give you the exact commands and file-by-file steps for Phase 1 (including sample `lib/supabase` setup and a minimal login + redirect flow).