import type { ProposalCategory } from "@/lib/types";

export interface ProposalCategoryField {
  key: string;
  label: string;
  prompt: string;
  placeholder: string;
  rows?: number;
}

export interface ProposalCategoryConfig {
  label: string;
  shortLabel: string;
  description: string;
  fields: ProposalCategoryField[];
}

export const PROPOSAL_CATEGORY_VALUES = [
  "research",
  "whitepaper",
  "analysis",
] as const satisfies readonly ProposalCategory[];

export const PROPOSAL_CATEGORY_CONFIG: Record<
  ProposalCategory,
  ProposalCategoryConfig
> = {
  research: {
    label: "Research Project",
    shortLabel: "Research",
    description:
      "An empirical or theoretical investigation with a testable claim, a defined method, and a paper at the end.",
    fields: [
      {
        key: "thesis",
        label: "Thesis",
        prompt: "What is the central claim or question the project will test?",
        placeholder:
          "We expect that retrieval-augmented models will outperform fine-tuning on narrow policy questions when the source corpus changes frequently.",
        rows: 4,
      },
      {
        key: "background",
        label: "Background",
        prompt:
          "What existing work or lab context motivates this project? What gap does it address?",
        placeholder:
          "Summarize the relevant literature, prior lab work, or practical problem and explain why the gap matters.",
        rows: 5,
      },
      {
        key: "method",
        label: "Method",
        prompt:
          "How will you investigate the claim? Describe the data, experiments, or formal approach.",
        placeholder:
          "Describe the datasets, baselines, evaluation metrics, and the steps you will take.",
        rows: 5,
      },
      {
        key: "successCriteria",
        label: "Success criteria",
        prompt:
          "What result would make the project a success, and what would count as a negative but useful finding?",
        placeholder:
          "A successful project produces a reproducible evaluation and a paper with a clear conclusion, even if the hypothesis is not supported.",
        rows: 4,
      },
      {
        key: "resources",
        label: "Resources",
        prompt:
          "What data, compute, software, participants, or mentorship will the project need?",
        placeholder:
          "Public datasets, lab GPU access, survey participants, interviews, or a faculty advisor.",
        rows: 4,
      },
      {
        key: "deliverables",
        label: "Deliverables",
        prompt:
          "What will the team produce by the end of the semester?",
        placeholder:
          "A working paper, a reproducible code repository, a dataset, and a short lab presentation.",
        rows: 4,
      },
    ],
  },
  whitepaper: {
    label: "Whitepaper",
    shortLabel: "Whitepaper",
    description:
      "A structured, evidence-based position paper that frames a problem and proposes a practical direction.",
    fields: [
      {
        key: "problem",
        label: "Problem",
        prompt: "What problem does the whitepaper address, and why now?",
        placeholder:
          "Describe the problem, who it affects, and what makes it urgent or underexplored.",
        rows: 4,
      },
      {
        key: "audience",
        label: "Audience",
        prompt: "Who is the intended reader, and what should they do differently?",
        placeholder:
          "Student researchers, lab directors, university administrators, or technical practitioners.",
        rows: 3,
      },
      {
        key: "approach",
        label: "Approach",
        prompt:
          "What evidence, cases, or frameworks will support the argument?",
        placeholder:
          "Describe the sources, interviews, case studies, or technical analysis you will use.",
        rows: 5,
      },
      {
        key: "differentiation",
        label: "Differentiation",
        prompt:
          "What existing writing or guidance does this whitepaper improve on?",
        placeholder:
          "Explain how the paper differs from existing reports and what new synthesis it provides.",
        rows: 4,
      },
      {
        key: "outline",
        label: "Proposed outline",
        prompt: "What sections will the whitepaper contain?",
        placeholder:
          "1. Problem framing\n2. Background\n3. Evidence\n4. Recommendations\n5. Limitations\n6. Conclusion",
        rows: 5,
      },
      {
        key: "deliverables",
        label: "Deliverables",
        prompt:
          "What will the team produce by the end of the semester?",
        placeholder:
          "A formatted whitepaper, a public summary, and a short lab presentation.",
        rows: 4,
      },
    ],
  },
  analysis: {
    label: "Analysis Project",
    shortLabel: "Analysis",
    description:
      "A data-driven project that answers a focused question through cleaning, analysis, and a written deliverable.",
    fields: [
      {
        key: "question",
        label: "Guiding question",
        prompt: "What specific question will the analysis answer?",
        placeholder:
          "How do course enrollment patterns differ between first-generation and continuing-generation students in the college?",
        rows: 4,
      },
      {
        key: "dataSources",
        label: "Data sources",
        prompt:
          "What data will you use? Include access status, licensing, and privacy considerations.",
        placeholder:
          "Public datasets, university records, scraped data, or lab-owned data, plus any access or privacy constraints.",
        rows: 5,
      },
      {
        key: "method",
        label: "Analysis method",
        prompt:
          "How will you clean, analyze, and validate the data?",
        placeholder:
          "Describe the analysis plan, statistical or machine-learning methods, and how you will check robustness.",
        rows: 5,
      },
      {
        key: "audience",
        label: "Intended audience",
        prompt: "Who should act on the findings?",
        placeholder:
          "Lab members, university administrators, students, or external researchers.",
        rows: 3,
      },
      {
        key: "deliverables",
        label: "Deliverables",
        prompt:
          "What will the team produce by the end of the semester?",
        placeholder:
          "A written analysis, a reproducible notebook, visualizations, and a short lab presentation.",
        rows: 4,
      },
    ],
  },
};

export function isProposalCategory(
  value: string | null | undefined,
): value is ProposalCategory {
  return PROPOSAL_CATEGORY_VALUES.includes(value as ProposalCategory);
}

export function proposalCategoryLabel(
  category: ProposalCategory | null | undefined,
) {
  return category ? PROPOSAL_CATEGORY_CONFIG[category].label : "Proposal";
}
