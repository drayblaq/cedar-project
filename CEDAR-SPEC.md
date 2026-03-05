# cedar-project
a platform for a center where individuals in benin learn enlish

Build a full-stack English Learning Center Management Platform for Cedar Training Center (CTC) located in Cotonou, Benin.

The platform must include:

1. Public Marketing Website:

* Home page
* About page
* Courses & English levels
* Registration form
* Contact page
* Testimonials
* Location map

2. Authentication System:

* Role-based access (Admin, Staff, Student, Parent)
* Secure login system
* Email-based accounts
* Role-based dashboard redirection

3. Admin Dashboard:

* Add/Edit/Delete students
* Assign English levels
* Upload student documents
* Record payments and generate receipts
* Mark attendance
* Add grades and remarks
* View analytics (total students, revenue, attendance rate)
* Manage announcements
* Create academic terms and calendar events

4. Staff Dashboard:

* View assigned classes
* Mark attendance
* Upload grades
* Add comments
* Upload assignments

5. Student Portal:

* View attendance
* View grades and progress
* See English level progression
* View announcements
* Access academic calendar
* Download materials

6. Parent Portal:

* View child progress
* View attendance
* View payment history
* Receive announcements

7. Database:
   Use PostgreSQL with proper relational structure:

* users
* roles
* students
* parents
* classes
* attendance
* payments
* grades
* assignments
* announcements
* academic_terms
* levels

8. Security:

* Role-Based Access Control (RBAC)
* Students only see their own data
* Parents only see linked child data
* Staff limited to assigned classes

9. Tech Stack:

* Next.js (App Router)
* Tailwind CSS
* Supabase (PostgreSQL)
* Server Actions for backend
* Deployed on Vercel

Design must be modern, clean, and professional for an educational institution.
Include dashboards with charts and clean UI components.
Make it scalable for future mobile app integration.


4️⃣ Platform Structure (Very Important)
🌍 A. Public Website (Marketing)

Home Page

About Cedar Training Center

Courses Offered

English Levels (Beginner → Advanced)

IELTS/TOEFL Prep (if available)

Testimonials

Registration Form

Contact Page

Location Map (Cotonou)

🔐 B. Admin Dashboard

Admin Can:

👥 Student Management

Add new student

Assign level

Upload documents

Store ID/passport copies

Track enrollment date

📊 Academic Records

Add grades

Record speaking test scores

Add teacher remarks

Track level progress

💰 Payments

Record payments

See unpaid students

Generate receipts

Payment history per student

📅 Attendance

Mark present / absent

Monthly attendance stats

Export attendance report

📈 Analytics

Total students

Active students

Revenue this month

Completion rate

👨‍🏫 C. Staff / Teacher Dashboard

Teachers Can:

Mark attendance

Add test results

Add comments

Upload assignments

View their class students only

(NO access to finance section)

🎓 D. Student Portal

Student Can:

See English level

See progress graph

View grades

Download results

See attendance %

View upcoming activities

View academic calendar

Receive announcements

Access learning materials (PDFs, videos)

Optional:

Practice speaking AI chatbot

Upload assignment recordings

👨‍👩‍👧 E. Parent/Guardian Portal

Parents Can:

View student progress

See attendance

See payment status

Receive announcements

Contact administration

5️⃣ Database Structure (Core Tables)

You MUST structure database well:

Tables Needed:

users

roles (admin, staff, student, parent)

students

parents

classes

attendance

payments

grades

assignments

announcements

academic_terms

levels

staff


| Role    | Can See                  |
| ------- | ------------------------ |
| Admin   | Everything               |
| Staff   | Only assigned classes    |
| Student | Only their records       |
| Parent  | Only their child records |


This platform helps Cedar:

Look professional

Track performance

Increase trust

Attract students planning to relocate

Compete with other centers in Cotonou

/app
   /dashboard
       /admin
       /staff
       /student
       /parent
   /auth
   /api
/components
/lib
/types
/hooks

this is huge i guess we cant do all at once so guide me so we go step by step to make every part of web platform functional for this traing center