import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import {
  createAdminClient,
  hasServiceRoleEnv,
} from "@/lib/supabase/admin";


export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured on this environment." },
      { status: 500 },
    );
  }

  const { email, password, fullName, role } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName ?? "New Member",
        role: role ?? "student",
        onboarding_completed: false,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const userId = data.user?.id;
  if (userId && hasServiceRoleEnv()) {
    try {
      const admin = await createAdminClient();
      await admin.from("profiles").insert({
        id: userId,
        email,
        full_name: fullName ?? "New Member",
        role: role ?? "student",
        onboarding_completed: false,
      });
    } catch {
      // Profile creation is also handled by a DB trigger; ignore duplicates.
    }
  }

  // TRD: sessions are returned directly (email verification disabled).
  return NextResponse.json({ session: data.session, user: data.user });
}
