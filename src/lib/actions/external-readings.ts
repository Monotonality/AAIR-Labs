"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser, isAdmin } from "@/lib/auth-helpers";
import { normalizeHttpUrl } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { ExternalReadingInput } from "@/lib/types";

function revalidateReadings() {
  revalidatePath("/portal/external-reading");
  revalidatePath("/portal");
  revalidatePath("/library");
}

function parseYear(value: string): { year: number | null } | { error: string } {
  const trimmed = value.trim();
  if (!trimmed) return { year: null };
  if (!/^\d{4}$/.test(trimmed)) {
    return { error: "Year needs to be a four-digit year, or left blank." };
  }
  const year = Number(trimmed);
  if (year < 1900 || year > 2100) {
    return { error: "Year needs to be between 1900 and 2100." };
  }
  return { year };
}

export async function saveExternalReading(input: ExternalReadingInput) {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) {
    return { ok: false as const, error: "Not authorized." };
  }

  const title = input.title?.trim() ?? "";
  const authors = input.authors?.trim() ?? "";
  const venue = input.venue?.trim() ?? "";
  const context = input.context?.trim() ?? "";
  const sourceUrl = normalizeHttpUrl(input.source_url ?? "");
  const yearResult = parseYear(input.published_year ?? "");

  if (!title || title.length > 300) {
    return { ok: false as const, error: "A title of 300 characters or fewer is required." };
  }
  if (!authors || authors.length > 500) {
    return { ok: false as const, error: "List the original authors (500 characters or fewer)." };
  }
  if (venue.length > 200) {
    return { ok: false as const, error: "Venue must be 200 characters or fewer." };
  }
  if (!sourceUrl) {
    return { ok: false as const, error: "Source URL needs a valid http or https link." };
  }
  if (!context || context.length > 4000) {
    return {
      ok: false as const,
      error: "Context is required and must be 4,000 characters or fewer.",
    };
  }
  if ("error" in yearResult) return { ok: false as const, error: yearResult.error };

  const payload = {
    title,
    authors,
    venue,
    published_year: yearResult.year,
    source_url: sourceUrl,
    context,
  };

  const supabase = await createClient();
  const { error } = input.id
    ? await supabase.from("external_readings").update(payload).eq("id", input.id)
    : await supabase
        .from("external_readings")
        .insert({ ...payload, created_by: user.id });

  if (error) return { ok: false as const, error: error.message };

  revalidateReadings();
  return { ok: true as const };
}

export async function deleteExternalReading(id: string) {
  const user = await getAuthenticatedUser();
  if (!user || !(await isAdmin(user))) {
    return { ok: false as const, error: "Not authorized." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("external_readings").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidateReadings();
  return { ok: true as const };
}
