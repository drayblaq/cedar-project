-- Period-based English level assessments per student per term per skill area
create table if not exists skill_assessments (
  id                uuid        primary key default gen_random_uuid(),
  student_id        uuid        not null references students(id) on delete cascade,
  academic_term_id  uuid        not null references academic_terms(id) on delete cascade,
  skill_area        text        not null check (skill_area in ('speaking','listening','grammar_vocabulary','reading','writing','overall')),
  skill_level       text        not null check (skill_level in ('A1','A2','B1','B2','C1','C2')),
  assessed_by       uuid        references profiles(id) on delete set null,
  assessed_at       timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique (student_id, academic_term_id, skill_area)
);

-- Indexes for common query patterns
create index if not exists skill_assessments_student_idx  on skill_assessments(student_id);
create index if not exists skill_assessments_term_idx     on skill_assessments(academic_term_id);

alter table skill_assessments enable row level security;

-- Admins and staff can read/write all assessments
create policy "admin_staff_all_skill_assessments"
  on skill_assessments for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

-- Students can only read their own assessments
create policy "students_read_own_skill_assessments"
  on skill_assessments for select
  using (
    exists (
      select 1 from students
      where students.id = skill_assessments.student_id
        and students.user_id = auth.uid()
    )
  );
