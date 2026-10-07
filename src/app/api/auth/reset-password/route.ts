import { NextResponse } from "next/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";


export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured on this environment." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${request.headers.get("origin") ?? "http://localhost:3000"}/auth/reset-password`,
  });

  // Always return success to avoid revealing which emails exist.
  return NextResponse.json({ ok: true });
}
