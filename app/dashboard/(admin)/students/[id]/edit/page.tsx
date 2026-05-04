import { createClient } from "@/lib/supabase/server";
import { updateStudent } from "@/app/dashboard/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, email, phone, level_id, enrollment_date, notes, status")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const { data: levels } = await supabase.from("levels").select("id, name").order("sort_order");

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/students"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; Students
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-900">
        Edit student
      </h1>

      <form action={updateStudent.bind(null, id) as unknown as (fd: FormData) => Promise<void>} className="mt-8 max-w-xl space-y-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
            Full name *
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={student.full_name}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={student.email}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={student.phone ?? ""}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="level_id" className="block text-sm font-medium text-slate-700">
            Level
          </label>
          <select
            id="level_id"
            name="level_id"
            defaultValue={student.level_id ?? ""}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          >
            <option value="">— Select level —</option>
            {levels?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={student.status ?? "active"}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label htmlFor="enrollment_date" className="block text-sm font-medium text-slate-700">
            Enrollment date
          </label>
          <input
            id="enrollment_date"
            name="enrollment_date"
            type="date"
            defaultValue={student.enrollment_date ?? ""}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={student.notes ?? ""}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600"
          >
            Save changes
          </button>
          <Link
            href="/admin/students"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
