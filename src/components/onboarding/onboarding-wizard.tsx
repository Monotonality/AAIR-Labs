"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import {
  GRAD_SEMESTERS,
  type GradSemester,
  formatGradTerm,
  gradYearOptions,
  parseGradTerm,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20";

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
    label: "Add “Affiliate Researcher at AAIR Labs” to your LinkedIn headline/experience",
    image: {
      src: "/linkedin-experience-example.png",
      alt: "Example LinkedIn Experience entry for Affiliate Researcher at AAIR Labs",
    },
  },
];

interface OnboardingData {
  fullName: string;
  email: string;
  personalEmail: string;
  major: string;
  expectedGradDate: string;
  university: string;
  bio: string;
}

export function OnboardingWizard({ signedIn = false }: { signedIn?: boolean }) {
  const router = useRouter();
  // Keep the account step for this visit even after the session cookie lands.
  const [includeAccount] = useState(() => !signedIn);
  const [hasAccount, setHasAccount] = useState(signedIn);
  const [password, setPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [step, setStep] = useState(0);
  const steps = includeAccount ? ["Account", "Application", "Get Connected"] : ["Application", "Get Connected"];
  const applicationStep = includeAccount ? 1 : 0;
  const connectStep = includeAccount ? 2 : 1;

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
    university: "The University of Texas at Dallas",
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

  async function createAccount() {
    setError(null);
    setIsCreatingAccount(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password,
      }),
    });

    const result = await res.json();

    if (!res.ok || !result.session) {
      setError(
        result.error ??
          "Unable to create your account. If you already have one, sign in and come back.",
      );
      setIsCreatingAccount(false);
      return;
    }

    setPassword("");
    setHasAccount(true);
    setIsCreatingAccount(false);
    setStep(applicationStep);
  }

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

  const gradTerm = parseGradTerm(data.expectedGradDate);
  const gradYears = gradYearOptions();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol
        className={cn(
          "mb-10 grid border border-ink",
          steps.length === 4 ? "grid-cols-4" : "grid-cols-3",
        )}
      >
        {steps.map((label, i) => {
          const done = i < step;
          return (
            <li
              key={label}
              className={cn(
                "border-r border-line p-3 last:border-r-0 sm:p-4",
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

      {includeAccount && step === 0 && (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-ink-70">
            Create your account first. You&apos;ll use this email and password
            to sign in, then finish the rest of onboarding here.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="accountName">Full name</Label>
              <Input
                id="accountName"
                autoComplete="name"
                value={data.fullName}
                onChange={(e) =>
                  setData((d) => ({ ...d, fullName: e.target.value }))
                }
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountEmail">UTD email</Label>
              <Input
                id="accountEmail"
                type="email"
                autoComplete="email"
                value={data.email}
                onChange={(e) =>
                  setData((d) => ({ ...d, email: e.target.value }))
                }
                placeholder="you@utdallas.edu"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountPassword">Password</Label>
              <Input
                id="accountPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
          </div>
          <p className="text-sm text-ink-70">
            Already have an account?{" "}
            <Link
              href="/auth/login?next=/onboarding"
              className="font-semibold underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* Application */}
      {step === applicationStep && (
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
                readOnly={includeAccount && hasAccount}
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
              <Label htmlFor="gradSemester">Expected graduation</Label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  id="gradSemester"
                  value={gradTerm.semester}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      expectedGradDate: formatGradTerm(
                        e.target.value as GradSemester,
                        parseGradTerm(d.expectedGradDate).year,
                      ),
                    }))
                  }
                  className={SELECT_CLASS}
                >
                  {GRAD_SEMESTERS.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Graduation year"
                  value={gradTerm.year}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      expectedGradDate: formatGradTerm(
                        parseGradTerm(d.expectedGradDate).semester,
                        e.target.value,
                      ),
                    }))
                  }
                  className={SELECT_CLASS}
                >
                  <option value="" disabled>
                    Year
                  </option>
                  {gradYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={data.university}
                onChange={(e) =>
                  setData((d) => ({ ...d, university: e.target.value }))
                }
                placeholder="The University of Texas at Dallas"
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



      {/* Get connected */}
      {step === connectStep && (
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
        {step > (includeAccount && hasAccount ? 1 : 0) ? (
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

        {includeAccount && step === 0 && (
          <Button
            onClick={createAccount}
            disabled={
              isCreatingAccount ||
              !data.fullName.trim() ||
              !data.email.trim() ||
              password.length < 8
            }
          >
            {isCreatingAccount ? "Creating account…" : "Continue"}{" "}
            {!isCreatingAccount && <ArrowRight className="size-4" />}
          </Button>
        )}

        {step === applicationStep && (
          <Button
            onClick={() => setStep(connectStep)}
            disabled={
              !data.fullName.trim() ||
              !data.email.trim() ||
              !data.personalEmail.trim() ||
              !data.major.trim() ||
              !data.university.trim()
            }
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        )}

        {step === connectStep && (
          <Button onClick={completeOnboarding} disabled={!allTasksChecked || isSubmitting}>
            {isSubmitting ? "Finishing…" : "Complete onboarding"}
          </Button>
        )}
      </div>
    </div>
  );
}