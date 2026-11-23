#!/usr/bin/env node
/**
 * Creates demo auth users, profiles, memberships, and the demo student passport.
 *
 * Usage (after `npx supabase start`):
 *   node scripts/seed-demo-users.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
 * (or a local .env loaded by your shell).
 */
import { createClient } from "@supabase/supabase-js";

const ORG_ID = "11111111-1111-1111-1111-111111111111";
const PASSPORT_ID = "SSP-DEMO-0001";

const USERS = [
  {
    email: "student@demo.edu",
    password: "DemoStudent123!",
    role: "student",
    fullName: "Demo Student",
    createStudentProfile: true,
  },
  {
    email: "admin@demo.edu",
    password: "DemoAdmin123!",
    role: "college_admin",
    fullName: "Demo Admin",
    createStudentProfile: false,
  },
  {
    email: "recruiter@demo.edu",
    password: "DemoRecruiter123!",
    role: "recruiter",
    fullName: "Demo Recruiter",
    createStudentProfile: false,
  },
];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Set it from \`npx supabase status\` output.`);
    process.exit(1);
  }
  return value;
}

const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureUser(def) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  let user = listed.users.find((u) => u.email?.toLowerCase() === def.email.toLowerCase());

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: def.email,
      password: def.password,
      email_confirm: true,
      user_metadata: { full_name: def.fullName },
    });
    if (error) throw error;
    user = data.user;
    console.log(`Created auth user ${def.email} (${user.id})`);
  } else {
    console.log(`Auth user exists ${def.email} (${user.id})`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: def.email,
      full_name: def.fullName,
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  const { error: membershipError } = await supabase.from("organization_memberships").upsert(
    {
      organization_id: ORG_ID,
      user_id: user.id,
      role: def.role,
      is_active: true,
    },
    { onConflict: "organization_id,user_id,role" },
  );
  if (membershipError) throw membershipError;

  if (def.createStudentProfile) {
    const { error: studentError } = await supabase.from("student_profiles").upsert(
      {
        user_id: user.id,
        organization_id: ORG_ID,
        passport_id: PASSPORT_ID,
        degree: "B.Tech",
        branch: "Computer Science",
        graduation_year: 2026,
        bio: "Demo student account for Smart Skill Passport.",
        profile_completion: 25,
        sharing_enabled: false,
      },
      { onConflict: "user_id" },
    );
    if (studentError) throw studentError;
    console.log(`Student profile ${PASSPORT_ID} linked to ${def.email}`);
  }

  return user.id;
}

async function main() {
  console.log("Seeding demo users for Smart Skill Passport…");

  const { error: orgError } = await supabase.from("organizations").upsert(
    {
      id: ORG_ID,
      slug: "demo-college",
      name: "Demo Institute of Technology",
      type: "college",
    },
    { onConflict: "id" },
  );
  if (orgError) throw orgError;

  for (const def of USERS) {
    await ensureUser(def);
  }

  console.log("Done. Demo credentials:");
  for (const def of USERS) {
    console.log(`  ${def.email} / ${def.password} (${def.role})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});