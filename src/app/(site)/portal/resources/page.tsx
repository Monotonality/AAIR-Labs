import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  Briefcase,
  Camera,
  Download,
  ExternalLink,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/section-heading";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import {
  LAB_LINKS,
  LINKEDIN_BANNERS,
  LINKEDIN_EXPERIENCE_EXAMPLE,
} from "@/lib/resources";

export const instant = false;

export const metadata: Metadata = {
  title: "Resources · Portal",
};

const LINK_ICONS: Record<(typeof LAB_LINKS)[number]["key"], LucideIcon> = {
  groupme: MessageCircle,
  instagram: Camera,
  linkedin: Briefcase,
};

const GROUP_ME = LAB_LINKS.find((link) => link.key === "groupme");

export default async function PortalResourcesPage() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login?next=/portal/resources");
  }

  return (
    <>
      <PageHeader
        kicker="Member resources"
        title="Resources"
        description="Everything you need to get connected, polish your LinkedIn, and represent AAIR Labs."
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/portal"
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-ink-70 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to portal
        </Link>

        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-2xl tracking-tight text-ink">
              Connect with the lab
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-70">
              Join the group chat and follow us so you never miss a meeting,
              event, or call for papers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {LAB_LINKS.map((link) => {
              const Icon = LINK_ICONS[link.key];
              return (
                <div
                  key={link.key}
                  className="flex flex-col gap-4 border border-line bg-surface p-6"
                >
                  <Icon className="size-5 text-ink" />
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      {link.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-70">
                      {link.description}
                    </p>
                  </div>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-green"
                  >
                    {link.cta}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 space-y-8">
          <div>
            <h2 className="font-serif text-2xl tracking-tight text-ink">
              LinkedIn profile tutorial
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-70">
              Add AAIR Labs to your profile so your research work follows you
              after graduation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 border border-line bg-surface p-6 md:grid-cols-2 md:p-8">
            <ol className="space-y-4 text-sm leading-relaxed text-ink-70">
              <li className="flex gap-3">
                <span className="font-serif text-lg leading-none text-line">
                  1
                </span>
                <span>
                  Open your LinkedIn profile and select{" "}
                  <span className="font-semibold text-ink">
                    Add profile section
                  </span>
                  .
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-serif text-lg leading-none text-line">
                  2
                </span>
                <span>
                  Add the{" "}
                  <span className="font-semibold text-ink">
                    Experience
                  </span>{" "}
                  section.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-serif text-lg leading-none text-line">
                  3
                </span>
                <span>
                  Enter{" "}
                  <span className="font-semibold text-ink">
                    Affiliate Researcher
                  </span>{" "}
                  as the title,{" "}
                  <span className="font-semibold text-ink">AAIR Labs</span> as
                  the organization, and add your start date.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-serif text-lg leading-none text-line">
                  4
                </span>
                <span>
                  Optionally add{" "}
                  <span className="font-semibold text-ink">
                    “Affiliate Researcher at AAIR Labs”
                  </span>{" "}
                  to your headline, then save.
                </span>
              </li>
            </ol>

            <div className="flex flex-col items-center justify-center gap-4 border-t border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <Image
                src={LINKEDIN_EXPERIENCE_EXAMPLE.src}
                alt={LINKEDIN_EXPERIENCE_EXAMPLE.alt}
                width={LINKEDIN_EXPERIENCE_EXAMPLE.width}
                height={LINKEDIN_EXPERIENCE_EXAMPLE.height}
                className="w-60 rounded-[2px] border border-line bg-paper"
              />
              <p className="text-center text-xs text-ink-45">
                Example Experience entry
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-8">
          <div>
            <h2 className="font-serif text-2xl tracking-tight text-ink">
              Get a headshot
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-70">
              Need a professional photo for your LinkedIn and researcher page?
              Message the Director of Outreach to request a headshot at the next
              GBM (General Body Meeting).
            </p>
          </div>

          <div className="flex flex-col gap-4 border border-line bg-surface p-6 sm:flex-row sm:items-start">
            <Camera className="size-5 shrink-0 text-ink" />
            <div className="space-y-3 text-sm leading-relaxed text-ink-70">
              <p>
                Reach out to the{" "}
                <span className="font-semibold text-ink">
                  Director of Outreach
                </span>{" "}
                in the GroupMe and ask to be added to the headshot list for the
                next GBM. We&rsquo;ll take a photo you can use on LinkedIn and
                your researcher page.
              </p>
              {GROUP_ME && (
                <a
                  href={GROUP_ME.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-green"
                >
                  Message the Director of Outreach
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-8">
          <div>
            <h2 className="font-serif text-2xl tracking-tight text-ink">
              LinkedIn banner options
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-70">
              Pick a banner and download it, then upload it from your LinkedIn
              profile. Open a banner on your profile, choose the edit icon, and
              select{" "}
              <span className="font-semibold text-ink">
                Change background photo
              </span>
              .
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {LINKEDIN_BANNERS.map((banner) => (
              <div
                key={banner.src}
                className="flex flex-col border border-line bg-surface"
              >
                <Image
                  src={banner.src}
                  alt={`AAIR Labs LinkedIn banner, ${banner.label}`}
                  width={banner.width}
                  height={banner.height}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full"
                />
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-line p-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {banner.label}
                    </p>
                    <p className="text-xs text-ink-45">
                      {banner.width} × {banner.height}
                    </p>
                  </div>
                  <a
                    href={banner.src}
                    download
                    className="inline-flex items-center gap-1.5 border-b-[1.5px] border-ink pb-0.5 text-[13px] font-semibold text-ink hover:border-green hover:text-green"
                  >
                    <Download className="size-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
