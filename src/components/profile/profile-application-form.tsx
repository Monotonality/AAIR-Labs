"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import {
  GRAD_SEMESTERS,
  type GradSemester,
  formatGradTerm,
  gradYearOptions,
  parseGradTerm,
} from "@/lib/profile";
import type { Profile } from "@/lib/types";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink/20";

interface ProfileApplicationFormProps {
  profile: Profile | null;
}

export function ProfileApplicationForm({ profile }: ProfileApplicationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    personalEmail: "",
    major: profile?.major || "",
    expectedGradDate: profile?.expected_grad_date || "",
    university: "The University of Texas at Dallas",
    bio: profile?.bio || "",
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error ?? "Could not submit application.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/portal");
    router.refresh();
  }

  const gradTerm = parseGradTerm(data.expectedGradDate);
  const years = gradYearOptions();

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-[2px] border border-line bg-surface p-6">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => setData((d) => ({ ...d, fullName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">UTD email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
            placeholder="you@utdallas.edu"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="personalEmail">Personal email</Label>
          <Input
            id="personalEmail"
            type="email"
            value={data.personalEmail}
            onChange={(e) => setData((d) => ({ ...d, personalEmail: e.target.value }))}
            placeholder="you@gmail.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="major">Major</Label>
          <Input
            id="major"
            value={data.major}
            onChange={(e) => setData((d) => ({ ...d, major: e.target.value }))}
            required
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
              required
            >
              <option value="" disabled>
                Year
              </option>
              {years.map((year) => (
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
            onChange={(e) => setData((d) => ({ ...d, university: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="bio">Short bio (optional)</Label>
          <Textarea
            id="bio"
            rows={3}
            value={data.bio}
            onChange={(e) => setData((d) => ({ ...d, bio: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
