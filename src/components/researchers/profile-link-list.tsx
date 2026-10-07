import { Globe, Link2 } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/social-icons";
import type { DisplayLink } from "@/lib/profile";

function LinkIcon({ icon }: { icon: DisplayLink["icon"] }) {
  if (icon === "github") return <GitHubIcon className="size-4" />;
  if (icon === "linkedin") return <LinkedInIcon className="size-4" />;
  if (icon === "website") return <Globe className="size-4" />;
  return <Link2 className="size-4" />;
}

export function ProfileLinkList({ links }: { links: DisplayLink[] }) {
  if (links.length === 0) return null;

  return (
    <ul className="divide-y divide-line border-y border-line">
      {links.map((link) => (
        <li key={`${link.icon}-${link.href}`}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-2.5 text-sm text-ink transition-colors hover:text-green"
          >
            <span className="text-ink-70">
              <LinkIcon icon={link.icon} />
            </span>
            <span className="font-medium">{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
