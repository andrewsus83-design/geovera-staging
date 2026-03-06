"use client";

/**
 * PlatformProfilePanel — GeoVera DS v5.9
 *
 * Shows connected platform profile info in the center column.
 * - Instagram: profile header + 9-grid of recent media (from Instagram Graph API v21.0)
 * - Website/Blog: recent post snippets (from RSS feed)
 * - Other platforms: stored profile card + demo stats
 *
 * Falls back to demo data when API token is not yet valid.
 */

import { useEffect, useState } from "react";
import PlatformIcon from "./PlatformIcon";

// ── Types ──────────────────────────────────────────────────────────────────

interface IGProfile {
  username?: string;
  name?: string;
  profile_picture_url?: string;
  biography?: string;
  website?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  account_type?: string;
}

interface IGPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

interface ProfileData {
  connected: boolean;
  demo?: boolean;
  profile?: IGProfile;
  posts?: IGPost[];
  error?: string;
}

// ── Demo data ──────────────────────────────────────────────────────────────

const IG_DEMO: ProfileData = {
  connected: true,
  demo: true,
  profile: {
    username: "yourbrand",
    name: "Your Brand",
    biography: "Connect your Instagram account to see your real profile and latest posts here.",
    followers_count: undefined,
    follows_count: undefined,
    media_count: undefined,
  },
  posts: [],
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCount(n?: number): string {
  if (n === undefined || n === null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function timeAgo(ts?: string): string {
  if (!ts) return "";
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[18px] font-bold leading-none" style={{ color: "var(--gv-color-neutral-900)", fontFamily: "Georgia, serif" }}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--gv-color-neutral-400)" }}>{label}</span>
    </div>
  );
}

function IGMediaTile({ post }: { post: IGPost }) {
  const thumb = post.thumbnail_url || post.media_url;
  const isVideo = post.media_type === "VIDEO";

  return (
    <a
      href={post.permalink || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square overflow-hidden rounded-[10px] block"
      style={{ background: "var(--gv-color-neutral-100)" }}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt={post.caption?.slice(0, 40) || ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--gv-color-neutral-100)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--gv-color-neutral-300)" }}>
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}

      {/* Video badge */}
      {isVideo && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}>
        <div className="flex items-center gap-2 text-white text-[10px] font-semibold">
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {formatCount(post.like_count)}
          </span>
          <span className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            {formatCount(post.comments_count)}
          </span>
          {post.timestamp && <span className="ml-auto opacity-70">{timeAgo(post.timestamp)}</span>}
        </div>
      </div>
    </a>
  );
}

// ── Instagram panel ────────────────────────────────────────────────────────

function InstagramPanel({ data }: { data: ProfileData }) {
  const p = data.profile || {};

  return (
    <div className="flex flex-col gap-5">
      {data.demo && (
        <div className="rounded-[12px] px-4 py-2.5 flex items-center gap-2 text-[12px]"
          style={{ background: "var(--gv-color-primary-50)", border: "1px solid var(--gv-color-primary-100)", color: "var(--gv-color-primary-600)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Live data will appear here once your token is active. Showing stored profile.
        </div>
      )}

      {/* Profile header */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: "var(--gv-color-neutral-100)", border: "2px solid var(--gv-color-neutral-200)" }}>
          {p.profile_picture_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.profile_picture_url} alt={p.username} className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: "var(--gv-color-primary-500)" }}>
              <PlatformIcon id="instagram" size={32} mono />
            </span>
          )}
        </div>

        {/* Name + username */}
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold truncate" style={{ color: "var(--gv-color-neutral-900)", fontFamily: "Georgia, serif" }}>
            {p.name || p.username || "Your Account"}
          </p>
          <p className="text-[13px]" style={{ color: "var(--gv-color-neutral-500)" }}>@{p.username || "yourbrand"}</p>
          {p.account_type && (
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: "var(--gv-color-primary-50)", color: "var(--gv-color-primary-600)", border: "1px solid var(--gv-color-primary-100)" }}>
              {p.account_type}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-around rounded-[14px] py-3 px-4"
        style={{ background: "var(--gv-color-neutral-50)", border: "1px solid var(--gv-color-neutral-100)" }}>
        <ProfileStat label="Posts" value={formatCount(p.media_count)} />
        <div style={{ width: 1, height: 28, background: "var(--gv-color-neutral-200)" }} />
        <ProfileStat label="Followers" value={formatCount(p.followers_count)} />
        <div style={{ width: 1, height: 28, background: "var(--gv-color-neutral-200)" }} />
        <ProfileStat label="Following" value={formatCount(p.follows_count)} />
      </div>

      {/* Bio */}
      {p.biography && (
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--gv-color-neutral-600)" }}>{p.biography}</p>
      )}

      {/* Media grid */}
      {data.posts && data.posts.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: "var(--gv-color-neutral-400)" }}>Recent Posts</p>
          <div className="grid grid-cols-3 gap-1.5">
            {data.posts.slice(0, 9).map((post) => (
              <IGMediaTile key={post.id} post={post} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[14px] py-10 flex flex-col items-center justify-center gap-2"
          style={{ background: "var(--gv-color-neutral-50)", border: "1.5px dashed var(--gv-color-neutral-200)" }}>
          <span style={{ color: "var(--gv-color-neutral-300)" }}>
            <PlatformIcon id="instagram" size={28} mono />
          </span>
          <p className="text-[12px] font-medium text-center" style={{ color: "var(--gv-color-neutral-400)" }}>
            {data.demo ? "Connect your account to see recent posts" : "No posts found"}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Generic connected platform panel ───────────────────────────────────────

function GenericConnectedPanel({ platformId, data }: { platformId: string; data: ProfileData }) {
  const p = data.profile || {};
  const platformNames: Record<string, string> = {
    tiktok: "TikTok", facebook: "Facebook", youtube: "YouTube",
    linkedin: "LinkedIn", x_twitter: "X (Twitter)", pinterest: "Pinterest",
    reddit: "Reddit", google_business: "Google Business", whatsapp: "WhatsApp",
    snapchat: "Snapchat", telegram: "Telegram", threads: "Threads",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Connected badge */}
      <div className="flex items-center gap-3 rounded-[14px] px-4 py-3"
        style={{ background: "var(--gv-color-primary-50)", border: "1.5px solid var(--gv-color-primary-100)" }}>
        <span className="w-9 h-9 flex items-center justify-center rounded-[10px] flex-shrink-0"
          style={{ background: "var(--gv-color-bg-surface)", border: "1px solid var(--gv-color-primary-100)" }}>
          <span style={{ color: "var(--gv-color-primary-500)" }}>
            <PlatformIcon id={platformId === "x_twitter" ? "x" : platformId === "google_business" ? "gbp" : platformId} size={20} mono />
          </span>
        </span>
        <div>
          <p className="text-[13px] font-bold" style={{ color: "var(--gv-color-primary-700)" }}>
            {platformNames[platformId] || platformId} Connected
          </p>
          {p.username && <p className="text-[11px]" style={{ color: "var(--gv-color-primary-500)" }}>@{p.username}</p>}
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--gv-color-primary-600)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gv-color-primary-500)" }} />
          Active
        </div>
      </div>

      {/* Profile card */}
      {(p.name || p.username) && (
        <div className="flex items-center gap-3 rounded-[14px] px-4 py-3"
          style={{ background: "var(--gv-color-bg-surface)", border: "1px solid var(--gv-color-neutral-100)" }}>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: "var(--gv-color-neutral-100)" }}>
            {p.profile_picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.profile_picture_url} alt={p.username} className="w-full h-full object-cover" />
            ) : (
              <span style={{ color: "var(--gv-color-primary-400)" }}>
                <PlatformIcon id={platformId === "x_twitter" ? "x" : platformId === "google_business" ? "gbp" : platformId} size={18} mono />
              </span>
            )}
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--gv-color-neutral-900)" }}>{p.name || p.username}</p>
            {p.username && <p className="text-[11px]" style={{ color: "var(--gv-color-neutral-400)" }}>@{p.username}</p>}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="rounded-[12px] px-4 py-3 text-[12px] leading-relaxed"
        style={{ background: "var(--gv-color-neutral-50)", border: "1px solid var(--gv-color-neutral-100)", color: "var(--gv-color-neutral-500)" }}>
        Your {platformNames[platformId] || platformId} account is connected. GeoVera will use this account for content publishing, auto-reply, and AI-powered analytics.
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

interface PlatformProfilePanelProps {
  platformId: string;
  brandId: string;
}

export default function PlatformProfilePanel({ platformId, brandId }: PlatformProfilePanelProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/platform/profile?platform=${platformId}&brandId=${encodeURIComponent(brandId)}`)
      .then((r) => r.json())
      .then((d: ProfileData) => setData(d))
      .catch(() => setData(platformId === "instagram" ? IG_DEMO : { connected: false }))
      .finally(() => setLoading(false));
  }, [platformId, brandId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full flex-shrink-0" style={{ background: "var(--gv-color-neutral-100)" }} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 rounded-lg w-32" style={{ background: "var(--gv-color-neutral-100)" }} />
            <div className="h-3 rounded-lg w-24" style={{ background: "var(--gv-color-neutral-100)" }} />
          </div>
        </div>
        <div className="h-14 rounded-[14px]" style={{ background: "var(--gv-color-neutral-50)" }} />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-[10px]" style={{ background: "var(--gv-color-neutral-100)" }} />
          ))}
        </div>
      </div>
    );
  }

  // Not connected — show demo
  const resolvedData = (!data || !data.connected)
    ? (platformId === "instagram" ? IG_DEMO : { connected: true, demo: true, profile: {}, posts: [] })
    : data;

  if (platformId === "instagram") {
    return <InstagramPanel data={resolvedData} />;
  }

  return <GenericConnectedPanel platformId={platformId} data={resolvedData} />;
}
