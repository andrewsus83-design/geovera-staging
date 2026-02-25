"use client";
import type { Platform } from "./PlatformList";

interface PlatformFeaturesProps {
  platform: Platform;
  onConnect?: (id: string) => void;
}

const featuresByPlatform: Record<string, { name: string; description: string; available: boolean }[]> = {
  facebook: [
    { name: "Auto-publish Posts", description: "Schedule and auto-publish posts to your Facebook Page", available: true },
    { name: "Auto-reply Comments", description: "Late AI responds to Page comments based on priority scoring", available: true },
    { name: "Schedule Content", description: "Queue content with optimal posting times for your audience", available: true },
    { name: "Comment Analysis", description: "Score comments by sentiment, engagement potential, and relevance", available: true },
  ],
  instagram: [
    { name: "Auto-publish Posts", description: "Schedule and auto-publish images and carousels to your feed", available: true },
    { name: "Auto-reply Comments", description: "Late AI responds to comments based on priority scoring", available: true },
    { name: "Schedule Content", description: "Queue content with optimal posting times", available: true },
    { name: "Comment Analysis", description: "Score comments by profile quality, sentiment, and relevance", available: true },
  ],
  reels: [
    { name: "Auto-publish Reels", description: "Schedule and auto-publish short-form video Reels", available: true },
    { name: "Auto-reply Comments", description: "Late AI responds to Reels comments automatically", available: true },
    { name: "Schedule Content", description: "Queue Reels with trending time slots", available: true },
    { name: "Engagement Analytics", description: "Track Reels reach, plays, and engagement rates", available: true },
  ],
  tiktok: [
    { name: "Auto-publish Videos", description: "Schedule and auto-publish short-form TikTok videos", available: true },
    { name: "Auto-reply Comments", description: "Late AI responds to top comments automatically", available: true },
    { name: "Schedule Content", description: "Queue videos with trending time slots", available: true },
    { name: "Comment Analysis", description: "Prioritize replies based on engagement potential", available: true },
  ],
  x: [
    { name: "Auto-publish Tweets", description: "Schedule and auto-publish tweets and threads", available: true },
    { name: "Auto-reply Mentions", description: "Late AI responds to mentions and replies", available: true },
    { name: "Schedule Content", description: "Queue tweets with optimal engagement windows", available: true },
    { name: "Engagement Tracking", description: "Track impressions, likes, retweets, and replies", available: true },
  ],
  blog: [
    { name: "Auto-publish Articles", description: "Schedule and publish blog posts and long-form articles", available: true },
    { name: "Short Article Posts", description: "Create and publish quick updates and micro-posts", available: true },
    { name: "SEO Optimization", description: "Auto-optimize meta tags, headings, and keywords", available: true },
    { name: "Internal Linking", description: "Automatically suggest and add internal links", available: true },
  ],
  linkedin: [
    { name: "Auto-publish Posts", description: "Schedule professional content and company updates", available: true },
    { name: "Auto-reply Comments", description: "Respond to professional engagement intelligently", available: true },
    { name: "Schedule Content", description: "Queue B2B content with business hours optimization", available: true },
    { name: "Network Analytics", description: "Track professional reach and engagement metrics", available: true },
  ],
  "youtube-shorts": [
    { name: "Auto-publish Shorts", description: "Schedule and upload YouTube Shorts automatically", available: true },
    { name: "Auto-reply Comments", description: "Late AI manages Shorts comment responses", available: true },
    { name: "Schedule Content", description: "Queue Shorts with optimal posting times", available: true },
    { name: "Performance Analytics", description: "Track views, watch time, and engagement rates", available: true },
  ],
  "youtube-video": [
    { name: "Auto-publish Videos", description: "Schedule and upload long-form YouTube videos", available: true },
    { name: "Auto-reply Comments", description: "Late AI manages video comment responses", available: true },
    { name: "Schedule Content", description: "Queue videos with optimal upload times", available: true },
    { name: "Advanced Analytics", description: "Track watch time, retention, CTR, and subscriber growth", available: true },
  ],
};

const planLabel: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise",
};

// Plans accessible on current plan (Premium)
const ACCESSIBLE_PLANS = new Set(["basic", "premium"]);

const connectHint: Record<string, string> = {
  instagram: "Not connected — toggle Connect to link via Meta",
  facebook:  "Not connected — toggle Connect to link via Meta",
  tiktok:    "Not connected — toggle Connect to link TikTok",
  reels:     "Not connected — toggle Connect to link via Meta",
  x:         "Not connected — toggle Connect to link X (Twitter)",
  blog:      "Not connected — toggle Connect to configure Blog",
  linkedin:  "Not connected — toggle Connect to link LinkedIn",
  "youtube-shorts": "Not connected — toggle Connect to link YouTube",
  "youtube-video":  "Not connected — toggle Connect to link YouTube",
};

export default function PlatformFeatures({ platform, onConnect }: PlatformFeaturesProps) {
  const features = featuresByPlatform[platform.id] || [];
  const isAccessible = ACCESSIBLE_PLANS.has(platform.plan);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{platform.icon}</span>
        <div>
          <h2
            className="text-lg font-semibold text-gray-900 dark:text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {platform.name}
          </h2>
          <p className="text-xs text-gray-400">
            {platform.connected
              ? `Connected${platform.handle ? ` as @${platform.handle}` : ""}`
              : isAccessible
              ? connectHint[platform.id] || "Not connected — toggle Connect to link"
              : `Upgrade to ${planLabel[platform.plan]} plan to unlock`}
          </p>
        </div>
      </div>

      {/* Connect / Connected CTA */}
      {isAccessible && !platform.connected && onConnect && (
        <button
          onClick={() => onConnect(platform.id)}
          className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          Connect {platform.name}
        </button>
      )}
      {isAccessible && platform.connected && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-200 px-4 py-2.5 dark:bg-brand-500/10 dark:border-brand-500/30">
          <span className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
          <span className="text-sm font-medium text-brand-700 dark:text-brand-400">
            {platform.name} is connected{platform.handle ? ` as @${platform.handle}` : ""}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</h4>
              <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full dark:bg-brand-500/10 dark:text-brand-400">
                Available
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Auto-reply info */}
      <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
        <h4 className="text-sm font-medium text-brand-800 dark:text-brand-300 mb-1">Late Auto-Reply</h4>
        <p className="text-xs text-brand-600 dark:text-brand-400 leading-relaxed">
          AI-powered comment replies prioritize must-reply comments based on: profile score, comment sentiment, and comment quality. Limits: Basic 50/day, Premium 100/day, Enterprise 150/day.
        </p>
      </div>
    </div>
  );
}
