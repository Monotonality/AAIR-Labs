import { z } from "zod";

import { PROPOSAL_CATEGORY_CONFIG, PROPOSAL_CATEGORY_VALUES } from "@/lib/proposal-categories";
import { normalizeHttpUrl } from "@/lib/profile";
import type { ProposalCategory, ProposalDetails } from "@/lib/types";

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .max(200, "Title must be 200 characters or fewer.");

const summarySchema = z
  .string()
  .trim()
  .min(1, "Summary is required.")
  .max(2000, "Summary must be 2,000 characters or fewer.");

const referenceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Every reference needs a title.")
    .max(200, "Reference titles must be 200 characters or fewer."),
  url: z
    .string()
    .trim()
    .min(1, "Every reference needs a URL.")
    .max(2000, "Reference URLs must be 2,000 characters or fewer.")
    .refine((value) => normalizeHttpUrl(value) !== null, {
      message: "Reference URLs must be valid http or https URLs.",
    })
    .transform((value) => normalizeHttpUrl(value) as string),
});

const proposalBaseSchema = z.object({
  category: z.enum(PROPOSAL_CATEGORY_VALUES),
  title: titleSchema,
  summary: summarySchema,
});

export function proposalDetailsSchema(category: ProposalCategory) {
  const shape: Record<string, z.ZodType> = {
    priorWorks: z.array(referenceSchema).default([]),
  };

  for (const field of PROPOSAL_CATEGORY_CONFIG[category].fields) {
    shape[field.key] = z
      .string()
      .trim()
      .min(1, `${field.label} is required.`)
      .max(4000, `${field.label} must be 4,000 characters or fewer.`);
  }

  return z.object(shape);
}

export type ProposalInput = {
  category: ProposalCategory;
  title: string;
  summary: string;
  details: ProposalDetails;
};

type ParseProposalInputResult =
  | { ok: true; data: ProposalInput }
  | { ok: false; error: string };

export function parseProposalInput(input: unknown): ParseProposalInputResult {
  const base = proposalBaseSchema.safeParse(input);
  if (!base.success) {
    return {
      ok: false,
      error: base.error.issues[0]?.message ?? "Check the proposal fields.",
    };
  }

  const raw = input as { details?: unknown };
  const details = proposalDetailsSchema(base.data.category).safeParse(
    raw.details ?? {},
  );
  if (!details.success) {
    return {
      ok: false,
      error: details.error.issues[0]?.message ?? "Check the proposal details.",
    };
  }

  return {
    ok: true,
    data: {
      ...base.data,
      details: details.data as ProposalDetails,
    },
  };
}

export function parseDirectorFeedback(input: unknown): string | null {
  const value = String(input ?? "").trim();
  if (!value) return null;
  return value.slice(0, 2000);
}
