# Product Requirement Document (PRD)

**Product Name:** AAIR Labs Centralized Web Portal

**Organization:** Applied AI Research Labs at UTD (AAIR Labs)

**Document Version:** 1.0

---

## 1. Executive Summary & Vision

### 1.1 Overview

The AAIR Labs Centralized Web Portal serves as the primary digital home and operational hub for the Applied AI Research Labs at UT Dallas. It bridges student research showcasing with organizational operations, member onboarding, event scheduling, and compliance management.

### 1.2 Core Objectives

* **Student Research Engine:** Establish a formal submission, review, and library system for student-written whitepapers, technical frameworks, research papers, and project proposals.
* **Member Portfolio System:** Provide every onboarded student member with a personal profile page to highlight their custom bio, external links, research tags, and AAIR Labs project contributions.
* **Centralized Hub & Onboarding:** Streamline new member intake through an interactive 3-step onboarding pipeline (Application → Org Introduction → Affiliate Branding setup).
* **Events & Admin Operations:** Equip leadership with built-in admin dashboard capabilities to manage club events, member rosters, content slides, and organization metadata while adhering to mandatory UTD RSO compliance standards.

---

## 2. User Roles & Access Matrix

| Role | Auth Method | Permissions & Capabilities |
| --- | --- | --- |
| **Guest / Public** | Unauthenticated | Browses public event calendar, reads project/paper library, views public member portfolios, views org info, accesses compliance/accessibility disclaimers. |
| **Student Member** | Email + Password | Completes onboarding, creates/edits mini-portfolio, submits research proposals and PDF/LaTeX drafts, views assigned peer review papers, manages project status papers. |
| **Director / Admin** | Email + Password (Privileged) | Approves/denies project proposals, assigns peer reviewers, gives final paper approvals, manages onboarding content, manages event listings, edits officer roster, controls site content via built-in dashboard. |
| **Faculty Account** | Email + Password | Holds general access across public/library features (*dedicated faculty dashboards deferred to future releases*). |

---

## 3. End-to-End Paper & Project Approval Pipeline

The platform enforces a structured 5-step lifecycle for all research papers and project submissions.

```
[1. Proposal Submission] ──> [2. Director Approval] ──> [3. Status Paper & Draft Upload] ──> [4. Peer Review] ──> [5. Final Approval & Publication]
```

### 1. Proposal Submission

* Student submits initial proposal form (title, abstract, target domain, estimated timeline, co-authors).

### 2. Director Approval

* Director reviews proposal in admin dashboard. Action: **Approve**, **Request Revisions**, or **Reject**.

### 3. Project Status Paper & Draft Creation

* Upon proposal approval (or when registering an existing project transferred to AAIR Labs), the author submits a Project Status Paper.
* Author uploads initial PDF draft or LaTeX source link.

### 4. Peer Review

* Director assigns an assigned Student Member or Officer as Peer Reviewer.
* Peer Reviewer accesses draft, submits review notes and decision recommendation.
* Author can iteratively re-upload PDF/LaTeX revisions.

### 5. Final Approval & Public Library Publication

* Director performs final check and publishes paper.
* Published papers automatically display on the AAIR Labs Public Library and link directly to author portfolio pages.

---

## 4. Key Functional Modules & Features

### 4.1 Onboarding Pipeline

1. **Step 1: Application Form:** Collects qualifying data (Name, Email, Major, Expected Graduation Date, AI/Research Fields of Interest).
2. **Step 2: Org Introduction Slide-through:** Interactive multi-slide walkthrough introducing AAIR Labs' mission, research structure, portal usage, and event types.
3. **Step 3: Affiliate Branding & Setup:**
   * Social media follow prompt (Instagram & LinkedIn).
   * LinkedIn asset distribution (downloadable banner assets, headshot schedule details).
   * Guidance on adding "Affiliate Researcher at AAIR Labs" to personal LinkedIn.
   * Instructions for setting up and customizing the AAIR Labs member portfolio.

### 4.2 Member Portfolio Pages

Each onboarded student receives a dedicated public profile page (`/researchers/[username]`) with editable sections:

* **Custom Bio & Research Tags:** Area of study, focus tags (e.g., *NLP, Computer Vision, Reinforcement Learning*).
* **External Links:** Direct social links to GitHub and LinkedIn.
* **AAIR Labs Research & Projects:** Automatic feed of approved/published papers, project status papers, and current club roles.

### 4.3 Event & Announcement Hub

* **Public Calendar:** Interactive monthly/list view for upcoming workshops, guest speakers, SOC meetings, and headshot sessions.
* **Event Cards:** Displays time, location, speaker details, and registration links.

### 4.4 Built-in Admin Dashboard

* **Member & Roster Management:** Review onboarding applications, approve roles, update officer listings.
* **Research Pipeline Board:** Kanban/table view for managing paper proposals, reviewer assignments, and publishing status.
* **Content Management:** Edit Onboarding intro slides, upload banner/asset bundles, and manage event entries.

### 4.5 Public Library & Showcase

* Searchable directory of published whitepapers, projects, and technical frameworks.
* PDF viewer modal/download link for each paper with author attribution cards.

---

## 5. Non-Functional & Compliance Requirements

### 5.1 Mandatory Legal & University Compliance

**UTD RSO Disclaimer:** Footer must feature official student org disclaimer text:

> "AAIR Labs Portal is published by Applied AI Research Labs at UTD, a registered student organization. It is not an official publication of UT Dallas and does not represent the views of the university or its officers. The University of Texas at Dallas is an Equal Opportunity/Affirmative Action University."

**Accessibility & ADA Notice:** Footer must display standard contact line:

> "Students with disabilities needing special assistance to attend please call (972-883-6551). Texas Relay Operation: 1-800-RELAYTX."

**Trademark Compliance:** Strictly avoid forbidden UTD official trademarks in branding materials without explicit university sponsorship.

### 5.2 Design & Accessibility

* **Aesthetics:** Modern, clean, dark-mode technical aesthetic with distinct AAIR Labs branding accents.
* **Accessibility Standards:** WCAG 2.1 AA compliance for contrast, screen-reader markup, keyboard navigation, and responsive mobile rendering.
