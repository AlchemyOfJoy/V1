"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary } from "@/lib/ui";

interface Props {
  initial: {
    display_name: string | null;
    bio: string | null;
    specialties: string[];
    intro_video_url: string | null;
    time_zone: string | null;
    languages: string[];
  };
}

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-[15px] text-navy outline-none transition placeholder:text-navy/35 focus:border-cyan-deep focus:ring-2 focus:ring-cyan-deep/25";
const labelClass =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/55";

export default function ProfileEditor({ initial }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.display_name ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [specialties, setSpecialties] = useState(
    initial.specialties.join(", "),
  );
  const [introVideo, setIntroVideo] = useState(initial.intro_video_url ?? "");
  const [timeZone, setTimeZone] = useState(
    initial.time_zone ??
      (typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : ""),
  );
  const [languages, setLanguages] = useState(initial.languages.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/coach-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          specialties: specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          intro_video_url: introVideo,
          time_zone: timeZone,
          languages: languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save.");
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="display_name">
            Display name
          </label>
          <input
            id="display_name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name as clients see it"
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="time_zone">
            Time zone
          </label>
          <input
            id="time_zone"
            type="text"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            placeholder="America/Los_Angeles"
            className={`${inputClass} mt-2`}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder="A few paragraphs in your voice. Why this work, how you hold space, what clients can expect."
          className={`${inputClass} mt-2 resize-y`}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="specialties">
          Specialties (comma-separated)
        </label>
        <input
          id="specialties"
          type="text"
          value={specialties}
          onChange={(e) => setSpecialties(e.target.value)}
          placeholder="forgiveness, high-achiever burnout, midlife pivot"
          className={`${inputClass} mt-2`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="intro">
            Intro video URL (optional)
          </label>
          <input
            id="intro"
            type="url"
            value={introVideo}
            onChange={(e) => setIntroVideo(e.target.value)}
            placeholder="https://…"
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="languages">
            Languages (comma-separated)
          </label>
          <input
            id="languages"
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="en, es"
            className={`${inputClass} mt-2`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[13px] text-cyan-deep">{msg}</p>
        <p className="font-sans text-[13px] text-[#8a6d00]">{error}</p>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
