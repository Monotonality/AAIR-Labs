import type { EventItem, PaperDraft, Profile, Project } from "@/lib/types";

export const SAMPLE_AUTHORS: Profile[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    username: "jordan-lee",
    email: "jordan.lee@utdallas.edu",
    full_name: "Jordan Lee",
    role: "student",
    major: "Computer Science",
    expected_grad_date: "2027",
    fields_of_interest: ["NLP", "LLM Agents"],
    bio: "Working on multimodal retrieval and evaluation harnesses for agentic systems.",
    github_url: "https://github.com",
    linkedin_url: "https://linkedin.com",
    website_url: "https://jordanlee.dev",
    avatar_url: null,
    links: [{ label: "Google Scholar", url: "https://scholar.google.com" }],
    research_tags: ["NLP", "LLM Agents", "Eval"],
    onboarding_completed: true,
    created_at: "2026-08-15T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    username: "marsha-alvarez",
    email: "marsha.alvarez@utdallas.edu",
    full_name: "Marsha Alvarez",
    role: "student",
    major: "Software Engineering",
    expected_grad_date: "2026",
    fields_of_interest: ["Efficient ML", "Fine-Tuning"],
    bio: "Practical systems research on training and serving small language models.",
    github_url: "https://github.com",
    linkedin_url: "https://linkedin.com",
    website_url: null,
    avatar_url: null,
    links: [],
    research_tags: ["Efficient ML", "LoRA", "Deployment"],
    onboarding_completed: true,
    created_at: "2026-08-15T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  },
];

const SAMPLE_DRAFT: PaperDraft = {
  id: "00000000-0000-0000-0000-000000000011",
  project_id: "00000000-0000-0000-0000-000000000101",
  version: 3,
  pdf_storage_path: "research-papers/sample/efficient-fine-tuning.pdf",
  latex_url: "",
  status: "published",
  published_at: "2026-10-01T00:00:00Z",
  created_at: "2026-09-02T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
};

export const SAMPLE_PAPERS: Project[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    author_id: SAMPLE_AUTHORS[1].id,
    title: "Efficient Fine-Tuning on Consumer GPUs",
    abstract:
      "A practical comparison of LoRA adapters across three 7B-parameter models, measuring VRAM, throughput, and task accuracy on a single consumer GPU.",
    target_domain: "Efficient ML",
    status: "approved",
    director_feedback: "",
    status_reviewed_at: "2026-09-02T00:00:00Z",
    created_at: "2026-09-02T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    draft: SAMPLE_DRAFT,
    author: SAMPLE_AUTHORS[1],
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    author_id: SAMPLE_AUTHORS[0].id,
    title: "Retrieval-Augmented Tutoring Agents",
    abstract:
      "Design and evaluation of a retrieval-augmented tutoring agent for introductory CS courses, with human-graded response quality results.",
    target_domain: "NLP",
    status: "approved",
    director_feedback: "",
    status_reviewed_at: "2026-09-10T00:00:00Z",
    created_at: "2026-09-10T00:00:00Z",
    updated_at: "2026-10-03T00:00:00Z",
    draft: {
      ...SAMPLE_DRAFT,
      id: "00000000-0000-0000-0000-000000000012",
      project_id: "00000000-0000-0000-0000-000000000102",
      pdf_storage_path: "research-papers/sample/rag-tutoring.pdf",
    },
    author: SAMPLE_AUTHORS[0],
  },
];

export const SAMPLE_EVENTS: EventItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000201",
    title: "Intro to RAG Systems",
    description:
      "Hands-on workshop on retrieval pipelines: chunking strategies, embedding stores, and evaluation.",
    event_date: "2026-10-17T19:00:00Z",
    location: "JO 4.122",
    category: "workshop",
    registration_link: "",
    created_by: null,
    created_at: "2026-10-05T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000202",
    title: "Research Roundtable: Agentic Eval",
    description:
      "Open SOC meeting to discuss evaluation harnesses for agentic systems and plan the Spring paper slate.",
    event_date: "2026-10-24T18:30:00Z",
    location: "ECSS 3.503",
    category: "soc_meeting",
    registration_link: "",
    created_by: null,
    created_at: "2026-10-05T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000203",
    title: "Headshot Session & LinkedIn Studio",
    description:
      "Drop-in professional headshots and LinkedIn asset distribution for affiliate branding setup.",
    event_date: "2026-11-05T12:00:00Z",
    location: "Founders North Commons",
    category: "headshot_session",
    registration_link: "https://example.com",
    created_by: null,
    created_at: "2026-10-05T00:00:00Z",
  },
];