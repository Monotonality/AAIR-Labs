import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";

export async function signOutAction() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[0.8rem] font-medium text-ink transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-3.5" />
        Sign out
      </button>
    </form>
  );
}