export type UserRole = "guest" | "student" | "director" | "faculty";

export type ProposalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

export type PaperStatus =
  | "draft"
  | "under_review"
  | "revision_required"
  | "published";

export type EventCategory =
  | "workshop"
  | "soc_meeting"
  | "headshot_session"
  | "speaker";

export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  major: string;
  expected_grad_date: string;
  fields_of_interest: string[];
  bio: string;
  github_url: string;
  linkedin_url: string;
  website_url: string | null;
  avatar_url: string | null;
  links: ProfileLink[];
  research_tags: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  author_id: string;
  title: string;
  abstract: string;
  target_domain: string;
  status: ProposalStatus;
  director_feedback: string | null;
  status_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
  draft?: PaperDraft | null;
}

export interface PaperDraft {
  id: string;
  project_id: string;
  version: number;
  pdf_storage_path: string | null;
  latex_url: string | null;
  status: PaperStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  project?: Project | null;
}

export interface PeerReview {
  id: string;
  paper_draft_id: string;
  reviewer_id: string;
  feedback_notes: string;
  recommended_status: PaperStatus | null;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  category: EventCategory;
  registration_link: string;
  created_by: string | null;
  created_at: string;
}

export type ProposalReviewAction = "approved" | "rejected" | "revision_requested";

export interface ProfileLink {
  label: string;
  url: string;
}