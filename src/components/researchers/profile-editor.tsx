"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfilePortrait } from "@/components/researchers/profile-portrait";
import { compressProfilePhoto, formatBytes } from "@/lib/compress-image";
import type { Profile, ProfileLink } from "@/lib/types";

type ExtraLink = ProfileLink & { id: string };

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrl = useRef<string | null>(null);

  const [bio, setBio] = useState(profile.bio ?? "");
  const [githubUrl, setGithubUrl] = useState(profile.github_url ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? "");
  const [extraLinks, setExtraLinks] = useState<ExtraLink[]>(() =>
    (Array.isArray(profile.links) ? profile.links : []).map((link) => ({
      ...link,
      id: crypto.randomUUID(),
    })),
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    profile.avatar_url,
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const [compressionNote, setCompressionNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, []);

  async function onPickPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    setIsCompressing(true);
    try {
      const compressed = await compressProfilePhoto(file);
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      const url = URL.createObjectURL(compressed.file);
      previewUrl.current = url;
      setPhotoFile(compressed.file);
      setPhotoPreview(url);
      setRemovePhoto(false);
      setCompressionNote(
        compressed.before === compressed.after
          ? `Saved as JPEG (${formatBytes(compressed.after)}).`
          : `${formatBytes(compressed.before)} compressed to ${formatBytes(compressed.after)}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compress that photo.");
    } finally {
      setIsCompressing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearPhoto() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
    setCompressionNote(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (photoFile) {
        const body = new FormData();
        body.set("file", photoFile);
        const photoRes = await fetch("/api/portfolio/photo", {
          method: "POST",
          body,
        });
        const photoData = await photoRes.json();
        if (!photoRes.ok) {
          throw new Error(photoData.error ?? "Could not save your photo.");
        }
      } else if (removePhoto && profile.avatar_url) {
        const photoRes = await fetch("/api/portfolio/photo", { method: "DELETE" });
        const photoData = await photoRes.json();
        if (!photoRes.ok) {
          throw new Error(photoData.error ?? "Could not remove your photo.");
        }
      }

      const res = await fetch("/api/portfolio/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          githubUrl,
          linkedinUrl,
          websiteUrl,
          links: extraLinks.map(({ label, url }) => ({ label, url })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save your page.");
      }

      router.push(`/researchers/${profile.username}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your page.");
      setIsSaving(false);
    }
  }

  const busy = isSaving || isCompressing;

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[320px_1fr]"
    >
      <aside className="space-y-4">
        <div className="space-y-4 rounded-[2px] border border-line bg-surface p-6">
          <ProfilePortrait name={profile.full_name} src={photoPreview} />
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {isCompressing ? "Compressing..." : "Change photo"}
            </Button>
            {(photoPreview || profile.avatar_url) && !removePhoto && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={busy}
                onClick={clearPhoto}
              >
                Remove photo
              </Button>
            )}
          </div>
          <p className="text-xs leading-relaxed text-ink-45">
            Photos are resized to fit within 1024px and saved as JPEG before
            they upload.
          </p>
          {compressionNote && (
            <p className="text-xs font-medium text-green">{compressionNote}</p>
          )}
        </div>
      </aside>

      <div className="space-y-10">
        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="What you work on, in a few sentences."
            className="min-h-36"
          />
          <p className="text-xs text-ink-45">{bio.length} / 2,000</p>
        </div>

        <fieldset className="space-y-4">
          <legend className="font-serif text-2xl">Links</legend>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
              inputMode="url"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              inputMode="url"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Personal website</Label>
            <Input
              id="website"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://"
              inputMode="url"
            />
          </div>

          {extraLinks.length > 0 && (
            <ul className="space-y-3 pt-2">
              {extraLinks.map((link) => (
                <li key={link.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                  <div className="space-y-1.5">
                    <Label htmlFor={`label-${link.id}`}>Label</Label>
                    <Input
                      id={`label-${link.id}`}
                      value={link.label}
                      maxLength={40}
                      placeholder="Google Scholar"
                      onChange={(e) =>
                        setExtraLinks((rows) =>
                          rows.map((row) =>
                            row.id === link.id ? { ...row, label: e.target.value } : row,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`url-${link.id}`}>URL</Label>
                    <Input
                      id={`url-${link.id}`}
                      value={link.url}
                      inputMode="url"
                      placeholder="https://"
                      onChange={(e) =>
                        setExtraLinks((rows) =>
                          rows.map((row) =>
                            row.id === link.id ? { ...row, url: e.target.value } : row,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${link.label || "link"}`}
                      onClick={() =>
                        setExtraLinks((rows) => rows.filter((row) => row.id !== link.id))
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={extraLinks.length >= 8}
            onClick={() =>
              setExtraLinks((rows) => [
                ...rows,
                { id: crypto.randomUUID(), label: "", url: "" },
              ])
            }
          >
            <Plus />
            Add a link
          </Button>
        </fieldset>

        <div className="flex items-center gap-3 border-t border-line pt-6">
          <Button type="submit" disabled={busy}>
            {isSaving ? "Saving..." : "Save page"}
          </Button>
          <Button asChild variant="ghost" disabled={busy}>
            <Link href={`/researchers/${profile.username}`}>Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
