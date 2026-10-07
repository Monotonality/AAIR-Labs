import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import {
  createAdminClient,
  hasServiceRoleEnv,
} from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth-helpers";


export async function PATCH(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured on this environment." },
      { status: 500 },
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  const supabase = await createClient();

  if (action === "password") {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required." },
        { status: 400 },
      );
    }

    // Re-verify the current password before rotating it.
    const verified = await createClient();
    const { error: signInError } =
      await verified.auth.signInWithPassword({
        email: user.email ?? "",
        password: currentPassword,
      });
    if (signInError) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 },
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "email") {
    const { newEmail } = body;
    if (!newEmail) {
      return NextResponse.json(
        { error: "New email is required." },
        { status: 400 },
      );
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Keep the public profile row in sync.
    if (hasServiceRoleEnv()) {
      const admin = await createAdminClient();
      await admin
        .from("profiles")
        .update({ email: newEmail })
        .eq("id", user.id);
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
