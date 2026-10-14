export interface LabLink {
  key: "groupme" | "instagram" | "linkedin";
  label: string;
  description: string;
  href: string;
  cta: string;
}

export const LAB_LINKS: LabLink[] = [
  {
    key: "groupme",
    label: "GroupMe",
    description:
      "Join the AAIR Labs group chat for meeting reminders, event plans, and day-to-day conversation.",
    href: "https://groupme.com/join_group/118022711/ikjpBZA9",
    cta: "Join the GroupMe",
  },
  {
    key: "instagram",
    label: "Instagram",
    description:
      "Follow @aair.labs for event photos, member spotlights, and updates from the lab.",
    href: "https://www.instagram.com/aair.labs",
    cta: "Follow on Instagram",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    description:
      "Follow AAIR Labs and list your affiliation so your research follows you after graduation.",
    href: "https://www.linkedin.com/company/aair-labs",
    cta: "Follow on LinkedIn",
  },
];

export const LINKEDIN_EXPERIENCE_EXAMPLE = {
  src: "/linkedin-experience-example.png",
  width: 243,
  height: 145,
  alt: "Example LinkedIn Experience entry for Affiliate Researcher at AAIR Labs",
};

export interface LinkedInBanner {
  src: string;
  label: string;
  width: number;
  height: number;
}

export const LINKEDIN_BANNERS: LinkedInBanner[] = [
  {
    src: "/resources/linkedin-banners/banner-01.jpg",
    label: "Option 1",
    width: 3325,
    height: 834,
  },
  {
    src: "/resources/linkedin-banners/banner-02.jpg",
    label: "Option 2",
    width: 3330,
    height: 830,
  },
  {
    src: "/resources/linkedin-banners/banner-03.jpg",
    label: "Option 3",
    width: 3333,
    height: 833,
  },
  {
    src: "/resources/linkedin-banners/banner-04.jpg",
    label: "Option 4",
    width: 3333,
    height: 833,
  },
  {
    src: "/resources/linkedin-banners/banner-05.jpg",
    label: "Option 5",
    width: 3333,
    height: 832,
  },
  {
    src: "/resources/linkedin-banners/banner-06.jpg",
    label: "Option 6",
    width: 3333,
    height: 833,
  },
  {
    src: "/resources/linkedin-banners/banner-07.jpg",
    label: "Option 7",
    width: 3330,
    height: 830,
  },
  {
    src: "/resources/linkedin-banners/banner-wide.jpg",
    label: "Wide banner",
    width: 4700,
    height: 796,
  },
  {
    src: "/resources/linkedin-banners/banner-wide-alt.jpg",
    label: "Wide banner (alt)",
    width: 4700,
    height: 796,
  },
  {
    src: "/resources/linkedin-banners/banner-small.jpg",
    label: "Compact banner",
    width: 1128,
    height: 191,
  },
];
