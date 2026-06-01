// ─────────────────────────────────────────────────────────────────────────────
// Cedar — test user seeder
// Edit the CONFIG block below, then run:   node scripts/seed-users.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load env from .env.local ──────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(s => s.trim()))
    .map(([k, ...v]) => [k, v.join("=")])
);

const SUPABASE_URL      = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY          = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// ═════════════════════════════════════════════════════════════════════════════
//  ✏️  EDIT THIS BLOCK — change names, emails, passwords freely
// ═════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  staff: {
    email:    "staff@cedar.test",
    password: "Cedar2026!",
    name:     "Ayolekan Biao",        // display name
  },

  student: {
    email:    "student@cedar.test",
    password: "Cedar2026!",
    name:     "jennifar ..",        // display name
    level:    "Intermediate",          // must match a name in your levels table
                                       // options: Beginner, Elementary,
                                       // Pre-Intermediate, Intermediate,
                                       // Upper-Intermediate, Advanced
  },

  parent: {
    email:    "parent@cedar.test",
    password: "Cedar2026!",
    name:     "Lauretta Salem",        // display name
    // this parent will be linked to the student above automatically
  },
};
// ═════════════════════════════════════════════════════════════════════════════

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const anon = createClient(SUPABASE_URL, ANON_KEY);

async function getRoleId(roleName) {
  const { data, error } = await admin.from("roles").select("id").eq("name", roleName).single();
  if (error || !data) throw new Error(`Role "${roleName}" not found: ${error?.message}`);
  return data.id;
}

async function getLevelId(levelName) {
  const { data, error } = await admin.from("levels").select("id").eq("name", levelName).single();
  if (error || !data) throw new Error(`Level "${levelName}" not found: ${error?.message}`);
  return data.id;
}

async function upsertAuthUser(email, password, name) {
  // Check if exists
  const { data: { users } } = await admin.auth.admin.listUsers();
  const existing = users.find(u => u.email === email);

  let userId;
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`Update ${email}: ${error.message}`);
    userId = existing.id;
    console.log(`  ↺  Updated  ${email}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`Create ${email}: ${error.message}`);
    userId = data.user.id;
    console.log(`  +  Created  ${email}`);
  }

  return userId;
}

async function upsertProfile(userId, name, roleId) {
  const { error } = await admin.from("profiles").upsert(
    { id: userId, full_name: name, role_id: roleId },
    { onConflict: "id" }
  );
  if (error) throw new Error(`Profile for ${name}: ${error.message}`);
}

async function main() {
  console.log("\n🌱  Cedar user seeder\n");

  const [staffRoleId, studentRoleId, parentRoleId] = await Promise.all([
    getRoleId("staff"),
    getRoleId("student"),
    getRoleId("parent"),
  ]);

  // ── Staff ──────────────────────────────────────────────────────────────────
  const staffId = await upsertAuthUser(CONFIG.staff.email, CONFIG.staff.password, CONFIG.staff.name);
  await upsertProfile(staffId, CONFIG.staff.name, staffRoleId);

  // ── Student ────────────────────────────────────────────────────────────────
  const studentId = await upsertAuthUser(CONFIG.student.email, CONFIG.student.password, CONFIG.student.name);
  await upsertProfile(studentId, CONFIG.student.name, studentRoleId);

  // Upsert students table row
  const levelId = await getLevelId(CONFIG.student.level);
  const nameParts = CONFIG.student.name.trim().split(" ");
  const firstName = nameParts[0];
  const lastName  = nameParts.slice(1).join(" ") || "";

  const { data: existingStu } = await admin
    .from("students").select("id").eq("user_id", studentId).maybeSingle();

  if (existingStu) {
    await admin.from("students").update({
      full_name: CONFIG.student.name,
      first_name: firstName,
      last_name: lastName,
      email: CONFIG.student.email,
      level_id: levelId,
      status: "active",
      application_status: "approved",
    }).eq("id", existingStu.id);
    console.log(`  ↺  Updated  student record`);
  } else {
    const { error } = await admin.from("students").insert({
      user_id: studentId,
      full_name: CONFIG.student.name,
      first_name: firstName,
      last_name: lastName,
      email: CONFIG.student.email,
      level_id: levelId,
      status: "active",
      application_status: "approved",
    });
    if (error) throw new Error(`Student record: ${error.message}`);
    console.log(`  +  Created  student record`);
  }

  // ── Parent ─────────────────────────────────────────────────────────────────
  const parentId = await upsertAuthUser(CONFIG.parent.email, CONFIG.parent.password, CONFIG.parent.name);
  await upsertProfile(parentId, CONFIG.parent.name, parentRoleId);

  // Link parent → student
  const { data: stuRow } = await admin
    .from("students").select("id").eq("user_id", studentId).single();

  const { data: existingLink } = await admin
    .from("parent_students")
    .select("id")
    .eq("parent_id", parentId)
    .eq("student_id", stuRow.id)
    .maybeSingle();

  if (!existingLink) {
    const { error } = await admin.from("parent_students").insert({
      parent_id: parentId,
      student_id: stuRow.id,
    });
    if (error) console.warn(`  ⚠  Parent link: ${error.message}`);
    else console.log(`  +  Linked   parent → student`);
  } else {
    console.log(`  ↺  Parent already linked to student`);
  }

  // ── Verify logins work ─────────────────────────────────────────────────────
  console.log("\n  Verifying logins…");
  for (const { email, password } of [CONFIG.staff, CONFIG.student, CONFIG.parent]) {
    const { error } = await anon.auth.signInWithPassword({ email, password });
    if (error) console.log(`  ✗  ${email}: ${error.message}`);
    else       console.log(`  ✓  ${email}`);
    await anon.auth.signOut();
  }

  console.log(`
✅  Done!

  Role     Email                    Password
  ───────  ───────────────────────  ────────────────
  staff    ${CONFIG.staff.email.padEnd(23)}  ${CONFIG.staff.password}
  student  ${CONFIG.student.email.padEnd(23)}  ${CONFIG.student.password}
  parent   ${CONFIG.parent.email.padEnd(23)}  ${CONFIG.parent.password}

  Sign in at: http://localhost:3000/auth/login
`);
}

main().catch(e => { console.error("\n❌", e.message); process.exit(1); });
