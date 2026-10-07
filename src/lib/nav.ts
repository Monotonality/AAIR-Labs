export type NavItem = {
  href: string;
  label: string;
};

export const mainNav: NavItem[] = [
  { href: "/library", label: "Library" },
  { href: "/events", label: "Events" },
  { href: "/researchers", label: "Researchers" },
];

export const footerNav: Record<string, NavItem[]> = {
  explore: [
    { href: "/library", label: "Public Library" },
    { href: "/events", label: "Event Calendar" },
    { href: "/researchers", label: "Researchers" },
  ],
  members: [
    { href: "/onboarding", label: "Onboarding" },
    { href: "/auth/login", label: "Sign In" },
    { href: "/settings/account", label: "Account Settings" },
  ],
  legal: [
    { href: "/accessibility", label: "Accessibility" },
    { href: "/privacy", label: "Privacy" },
    { href: "/rso-disclaimer", label: "RSO Disclaimer" },
  ],
};