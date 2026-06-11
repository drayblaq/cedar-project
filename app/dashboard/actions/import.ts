"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCallerRole } from "./_auth";

export interface ParsedStudent {
  full_name: string;
  email: string;
  phone: string;
  why_learn_english: string;
  date_of_birth: string;
  gender: "male" | "female" | null;
  resident_address: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_address: string;
  educational_level: string;
  discovery_channel: string;
  declaration_agreed: boolean;
}

export interface ImportResult {
  name: string;
  status: "created" | "skipped" | "error";
  reason?: string;
}

export async function importStudents(students: ParsedStudent[]): Promise<ImportResult[]> {
  const role = await getCallerRole();
  if (!role) return [{ name: "(system)", status: "error", reason: "Not authenticated" }];
  if (role !== "admin") return [{ name: "(system)", status: "error", reason: "Unauthorized" }];

  const supabase = await createClient();
  const results: ImportResult[] = [];

  for (const student of students) {
    if (!student.email) {
      results.push({ name: student.full_name || "(no name)", status: "skipped", reason: "No email address" });
      continue;
    }

    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .eq("email", student.email)
      .maybeSingle();

    if (existing) {
      results.push({ name: student.full_name, status: "skipped", reason: "Already exists" });
      continue;
    }

    const { error } = await supabase.from("students").insert({
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || null,
      why_learn_english: student.why_learn_english || null,
      date_of_birth: student.date_of_birth || null,
      gender: student.gender,
      resident_address: student.resident_address || null,
      guardian_name: student.guardian_name || null,
      guardian_phone: student.guardian_phone || null,
      guardian_address: student.guardian_address || null,
      educational_level: student.educational_level || null,
      discovery_channel: student.discovery_channel || null,
      declaration_agreed: student.declaration_agreed,
      status: "pending",
      application_status: "submitted",
    });

    if (error) {
      results.push({ name: student.full_name, status: "error", reason: error.message });
    } else {
      results.push({ name: student.full_name, status: "created" });
    }
  }

  revalidatePath("/admin/students");
  return results;
}
