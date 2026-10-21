import { z } from "zod";

import { PROPOSAL_CATEGORY_VALUES } from "@/lib/proposal-categories";

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .max(200, "Title must be 200 characters or fewer.");

const abstractSchema = z
  .string()
  .trim()
  .min(1, "Description is required.")
  .max(4000, "Description must be 4,000 characters or fewer.");

const tagListSchema = z
  .string()
  .max(2000, "Keep each list under 2,000 characters.");

/** Newline- or comma-separated list → trimmed, de-duplicated string array. */
export function parseTagList(value: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of value.split(/[\n,]/)) {
    const item = piece.trim().slice(0, 60);
    if (!item || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length >= 12) break;
  }
  return out;
}

const projectDetailsFields = {
  title: titleSchema,
  abstract: abstractSchema,
  target_domain: z.string().trim().max(200, "Field must be 200 characters or fewer."),
  topics: tagListSchema,
  geographic_scope: tagListSchema,
  methodology: tagListSchema,
  data_sources: tagListSchema,
  // Director-only; absent from lead submissions (optional in the form).
  category: z.enum(PROPOSAL_CATEGORY_VALUES).optional(),
} as const;

const projectCreateFields = {
  proposal_id: z.string().trim().max(64),
  title: titleSchema,
  abstract: abstractSchema,
  category: z.enum(PROPOSAL_CATEGORY_VALUES),
  target_domain: z.string().trim().max(200),
  lead_id: z.string().trim().min(1, "Choose a lead researcher."),
  co_author_ids: z.array(z.string().trim().min(1)).default([]),
} as const;

type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function firstError(error: z.ZodError, fallback: string) {
  return error.issues[0]?.message ?? fallback;
}

export type ProjectDetailsInput = z.infer<z.ZodObject<typeof projectDetailsFields>>;
export type ProjectCreateInput = z.infer<z.ZodObject<typeof projectCreateFields>>;

export function parseProjectDetails(
  input: unknown,
): ParseResult<ProjectDetailsInput> {
  const result = z.object(projectDetailsFields).safeParse(input);
  if (!result.success) {
    return { ok: false, error: firstError(result.error, "Check the project fields.") };
  }
  return { ok: true, data: result.data };
}

export function parseProjectCreate(
  input: unknown,
): ParseResult<ProjectCreateInput> {
  const result = z.object(projectCreateFields).safeParse(input);
  if (!result.success) {
    return { ok: false, error: firstError(result.error, "Check the project fields.") };
  }

  const leadId = result.data.lead_id;
  const coAuthorIds = Array.from(
    new Set(result.data.co_author_ids.filter((id) => id !== leadId)),
  );

  return {
    ok: true,
    data: { ...result.data, co_author_ids: coAuthorIds },
  };
}
