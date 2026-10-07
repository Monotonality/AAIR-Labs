"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STEPS = ["Application", "Org Intro", "Get Connected"];

const SLIDES = [
  {
    title: "Who we are",
    body: "AAIR Labs is a UT Dallas organization built around hands-on AI research: students learn the process of research, write papers, peer review, and publish.",
  },
  {
    title: "How research flows",
    body: "Every project starts as a proposal, passes director approval, gets a status paper and drafts, then moves through peer review to final publication.",
  },
  {
    title: "Using the portal",
    body: "This site manages primary activity: submit proposals, upload PDF drafts, respond to reviewer notes, and manage your portfolio from one place.",
  },
  {
    title: "Events & community",
    body: "Workshops, guest speakers, open research meetings, and headshot sessions: watch the calendar for what's next and register when seats are limited.",
  },
];

const BRANDING_TASKS: {
  label: string;
  href?: string;
  image?: { src: string; alt: string };
}[] = [
  {
    label: "Join the GroupMe",
    href: "https://groupme.com/join_group/118022711/ikjpBZA9",
  },
  {
    label: "Follow AAIR Labs on Instagram",
    href: "https://www.instagram.com/aair.labs",
  },
  {
    label: "Follow AAIR Labs on LinkedIn",
    href: "https://www.linkedin.com/company/aair-labs",
  },
  { label: "Download your LinkedIn banner assets" },
  {
    label: "Add \u201cAffiliate Researcher at AAIR Labs\u201d to your LinkedIn headline/experience",
    image: {
      src: "/linkedin-experience-example.png",
      alt: "Example LinkedIn Experience entry for Affiliate Researcher at AAIR Labs",
    },
  },
  {
    label: "Reach out to Director of Marketing to get a headshot at the next event",
  },
];

interface OnboardingData {
  fullName: string;
  email: string;
  personalEmail: string;
  major: string;
  expectedGradDate: string;
  bio: string;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [slide, setSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasksChecked, setTasksChecked] = useState<Record<number, boolean>>({});
  const [showLinkedInExample, setShowLinkedInExample] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    email: "",
    personalEmail: "",
    major: "",
    expectedGradDate: "",
    bio: "",
  });

  useEffect(() => {
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data: sessionData }) => {
        if (!active) return;
        const meta = sessionData.user?.user_metadata;
        setData((d) => ({
          ...d,
          fullName: d.fullName || (meta?.full_name as string) || "",
          email: d.email || sessionData.user?.email || "",
        }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function completeOnboarding() {
    setError(null);
    setIsSubmitting(true);

    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error ?? "Could not finish onboarding.");
      setIsSubmitting(false);
      return;
    }

    router.replace(
      result.username
        ? `/researchers/${result.username}`
        : "/dashboard",
    );
    router.refresh();
  }

  const allTasksChecked =
    Object.keys(tasksChecked).length === BRANDING_TASKS.length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol className="mb-10 grid grid-cols-3 border border-ink">
        {STEPS.map((label, i) => {
          const done = i < step || (i === 2 && step === 2);
          return (
            <li
              key={label}
              className={cn(
                "border-r border-line p-4 last:border-r-0",
                i === step ? "bg-ink text-paper" : done ? "bg-paper-deep" : "",
              )}
            >
              <span className="font-serif text-2xl leading-none opacity-55">
                {i + 1}
              </span>
              <p className="mt-2 text-xs font-semibold leading-snug">{label}</p>
            </li>
          );
        })}
      </ol>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Step 1 - Application */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(e) =>
                  setData((d) => ({ ...d, fullName: e.target.value }))
                }
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">UTD email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) =>
                  setData((d) => ({ ...d, email: e.target.value }))
                }
                placeholder="you@utdallas.edu"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="personalEmail">Personal email</Label>
              <Input
                id="personalEmail"
                type="email"
                value={data.personalEmail}
                onChange={(e) =>
                  setData((d) => ({ ...d, personalEmail: e.target.value }))
                }
                placeholder="you@gmail.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                value={data.major}
                onChange={(e) =>
                  setData((d) => ({ ...d, major: e.target.value }))
                }
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grad">Expected graduation</Label>
              <Input
                id="grad"
                value={data.expectedGradDate}
                onChange={(e) =>
                  setData((d) => ({ ...d, expectedGradDate: e.target.value }))
                }
                placeholder="2027"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Short bio (optional)</Label>
            <Textarea
              id="bio"
              rows={3}
              value={data.bio}
              onChange={(e) =>
                setData((d) => ({ ...d, bio: e.target.value }))
              }
              placeholder="What are you working on?"
            />
          </div>
        </div>
      )}

      {/* Step 2 - Org intro slides */}
      {step === 1 && (
        <div className="border-2 border-ink bg-surface p-8 sm:p-10">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-45">
            Org introduction {slide + 1} / {SLIDES.length}
          </p>
          <h2 className="mb-4 font-serif text-3xl leading-tight">
            {SLIDES[slide].title}
          </h2>
          <p className="leading-relaxed text-ink-70">{SLIDES[slide].body}</p>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            {slide === SLIDES.length - 1 ? (
              <Button onClick={() => setStep(2)}>Continue</Button>
            ) : (
              <Button onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}>
                Next <ArrowRight className="size-4" />
              </Button>
            )}
          </div>

          <div
            className="mt-6 flex gap-1.5"
            role="tablist"
            aria-label="Intro slides"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-1 flex-1 transition-colors",
                  i === slide ? "bg-ink" : "bg-line",
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3 - Get connected */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-ink-70">
            Get connected with the lab community: join the group chat, follow
            us online, and update your profiles so your research work follows
            you after graduation.
          </p>

          <div className="space-y-3">
            {BRANDING_TASKS.map((task, i) => {
              const checked = Boolean(tasksChecked[i]);
              return (
                <label
                  key={task.label}
                  className="flex cursor-pointer flex-col gap-3 rounded-[2px] border border-line bg-surface px-4 py-3 transition-colors hover:border-ink"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-[2px] border transition-colors",
                        checked
                          ? "border-green bg-green"
                          : "border-ink/40 bg-surface",
                      )}
                    >
                      {checked && <Check className="size-3 text-paper" />}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setTasksChecked((prev) => ({
                          ...prev,
                          [i]: !checked,
                        }))
                      }
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        checked ? "text-ink-45 line-through" : "text-ink",
                      )}
                    >
                      {task.href ? (
                        <a
                          href={task.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="border-b-[1.5px] border-ink/40 transition-colors hover:border-green hover:text-green"
                        >
                          {task.label}
                        </a>
                      ) : (
                        task.label
                      )}
                    </span>
                  </div>
                  {task.image && (
                    <div className="border-t border-line pt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowLinkedInExample((v) => !v);
                        }}
                        aria-expanded={showLinkedInExample}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-70 transition-colors hover:text-green"
                      >
                        <ChevronDown
                          className={cn(
                            "size-3.5 transition-transform",
                            showLinkedInExample && "rotate-180",
                          )}
                        />
                        {showLinkedInExample ? "Hide example" : "See an example"}
                      </button>
                      {showLinkedInExample && (
                        <Image
                          src={task.image.src}
                          alt={task.image.alt}
                          width={243}
                          height={145}
                          loading="lazy"
                          onClick={(e) => e.stopPropagation()}
                          className="mx-auto mt-3 w-60 rounded-[2px] border border-line bg-surface"
                        />
                      )}
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          {allTasksChecked ? (
            <Alert className="border-green bg-green-tint text-green">
              {"Everything checked: you\u2019re ready to publish your portfolio."}
            </Alert>
          ) : (
            <p className="text-xs text-ink-45">
              Check every item to finish onboarding.
            </p>
          )}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        {step > 0 ? (
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={isSubmitting}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}

        {step === 0 && (
          <Button
            onClick={() => setStep(1)}
            disabled={
              !data.fullName.trim() ||
              !data.email.trim() ||
              !data.personalEmail.trim() ||
              !data.major.trim()
            }
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        )}

        {step === 1 && (
          <Button onClick={() => setStep(2)}>Continue</Button>
        )}

        {step === 2 && (
          <Button onClick={completeOnboarding} disabled={!allTasksChecked || isSubmitting}>
            {isSubmitting ? "Finishing…" : "Complete onboarding"}
          </Button>
        )}
      </div>
    </div>
  );
}