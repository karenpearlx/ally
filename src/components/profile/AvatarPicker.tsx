"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_BUCKET, PROFILE_LIMITS } from "@/lib/profile";

const TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function extFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (/^(png|jpe?g|webp|gif)$/.test(fromName)) return fromName;
  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
}

/**
 * Photo upload straight to Supabase storage.
 *
 * The file goes to avatars/<uid>/<random>.<ext>, which is exactly the path the
 * storage policy allows the caller to write, so no API route sits in the middle
 * holding a multipart body in memory. A new random filename each time dodges
 * the CDN cache that would otherwise keep serving the old face for an hour.
 *
 * The URL is handed back to the parent as a draft value — nothing is saved to
 * the profile row until the form's own Save.
 */
export default function AvatarPicker({
  userId,
  value,
  name,
  initials,
  onChange,
}: {
  userId: string;
  value: string | null;
  name: string;
  initials: string;
  onChange: (url: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  async function upload(file: File) {
    setError(null);

    if (!TYPES.includes(file.type)) {
      setError("Use a PNG, JPG, WEBP or GIF.");
      return;
    }
    if (file.size > PROFILE_LIMITS.maxAvatarBytes) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Keep it under 2MB.`);
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const path = `${userId}/${crypto.randomUUID()}.${extFor(file)}`;
      const { error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });

      if (upErr) {
        setError(
          /bucket/i.test(upErr.message)
            ? "The avatars bucket doesn't exist yet. Run the profiles migration in Supabase."
            : upErr.message,
        );
        return;
      }

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      setBroken(false);
      onChange(data.publicUrl);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const showImage = Boolean(value) && !broken;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {showImage ? (
          // Supabase storage serves these; next/image would need a remote pattern
          // per project URL, and this is one 112px square.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value ?? ""}
            alt={name ? `${name}'s profile photo` : "Profile photo"}
            width={112}
            height={112}
            onError={() => setBroken(true)}
            className="h-28 w-28 rounded-full object-cover"
            style={{ border: "3px solid var(--color-surface)", boxShadow: "var(--shadow-tile)" }}
          />
        ) : (
          <span
            aria-hidden
            className="font-display grid h-28 w-28 place-items-center rounded-full text-3xl font-extrabold"
            style={{
              background: "var(--color-accent-soft)",
              color: "var(--color-accent-deep)",
              border: "3px solid var(--color-surface)",
              boxShadow: "var(--shadow-tile)",
            }}
          >
            {initials}
          </span>
        )}

        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          aria-label={value ? "Change profile photo" : "Upload a profile photo"}
          className="absolute -bottom-1 -right-1 grid h-11 w-11 place-items-center rounded-full transition-transform hover:scale-105"
          style={{
            background: "var(--color-ink)",
            color: "#fff",
            border: "3px solid var(--color-paper)",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? (
            <span
              aria-hidden
              className="block h-4 w-4 rounded-full"
              style={{
                border: "2px solid rgba(255,255,255,.35)",
                borderTopColor: "#fff",
                animation: "ally-spin .7s linear infinite",
              }}
            />
          ) : (
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M2.5 13.8V5.9c0-.5.4-.9.9-.9h2l1-1.7h5.2l1 1.7h2c.5 0 .9.4.9.9v7.9c0 .5-.4.9-.9.9H3.4a.9.9 0 0 1-.9-.9Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="9.6" r="2.6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept={TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />

      {value && !busy && (
        <button
          type="button"
          onClick={() => {
            setBroken(false);
            onChange(null);
          }}
          className="tap mt-3 text-[0.8125rem] font-medium underline underline-offset-2"
          style={{ color: "var(--color-muted)" }}
        >
          Remove photo
        </button>
      )}

      {error && (
        <p className="mt-3 max-w-[15rem] text-center text-[0.8125rem] leading-relaxed" style={{ color: "#b4462f" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
