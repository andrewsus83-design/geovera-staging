"use client";
import { useState, useEffect, useCallback } from "react";
import type { Task, ReplyComment } from "./TaskCard";
import ImpactFireIcons from "./ImpactFireIcons";
import FeedbackSection from "./FeedbackSection";

// ── TikTok helpers ────────────────────────────────────────────────────────────
const TIKTOK_CLIENT_KEY   = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY   || "";
const TIKTOK_REDIRECT_URI = process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI || "https://report.geovera.xyz/api/tiktok/callback";
const DEMO_BRAND_ID       = process.env.NEXT_PUBLIC_DEMO_BRAND_ID        || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";

async function buildTikTokOAuthUrl(): Promise<string> {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  const verifier = btoa(String.fromCharCode(...arr)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
  const digest   = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
  sessionStorage.setItem("tiktok_code_verifier", verifier);
  const p = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY || "aw_demo_key",
    response_type: "code",
    scope: "user.info.basic,video.publish,video.upload",
    redirect_uri: TIKTOK_REDIRECT_URI,
    state: `${DEMO_BRAND_ID}:calendar`,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${p}`;
}

const TikTokSVG = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className="flex-shrink-0">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
  </svg>
);

// Mini TikTok preview card
function TikTokPreviewCard({ caption, hashtags, accentColor = "#FE2C55" }: { caption?: string; hashtags?: string[]; accentColor?: string }) {
  if (!caption) return null;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* TikTok header */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-black">
        <TikTokSVG size={12} />
        <span className="text-white text-[11px] font-semibold">TikTok Preview</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#25F4EE" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
        </div>
      </div>
      {/* Content preview */}
      <div className="bg-gray-950 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-gray-600 flex-shrink-0" />
          <span className="text-gray-300 text-[11px] font-semibold">@geovera.id</span>
          <span className="ml-auto text-[10px] text-[#FE2C55] font-semibold border border-[#FE2C55] rounded px-1.5 py-0.5">Follow</span>
        </div>
        <p className="text-white text-[11px] leading-relaxed line-clamp-3">{caption}</p>
        {hashtags && hashtags.length > 0 && (
          <p className="text-[#25F4EE] text-[10px] mt-1 truncate">{hashtags.slice(0,4).join(" ")}</p>
        )}
      </div>
    </div>
  );
}

interface PublishOptions {
  publishNow?: boolean;
  scheduledFor?: string;
}

interface TaskDetailPanelProps {
  task: Task | null;
  isConnected?: boolean;
  onPublish?: (taskId: string, options?: PublishOptions) => Promise<void>;
  onReject?: (taskId: string, reason: string) => void;
  isRejected?: boolean;
  onPublishReplies?: (taskId: string, replies: ReplyComment[]) => Promise<{ queued: number }>;
}

// ── Late Reply Queue UI ──────────────────────────────────
function ReplyQueuePanel({
  queue,
  onPublish,
  onPublishReplies,
  taskId,
}: {
  queue: ReplyComment[];
  onPublish?: () => void;
  onPublishReplies?: (taskId: string, replies: ReplyComment[]) => Promise<{ queued: number }>;
  taskId?: string;
}) {
  const [replies, setReplies] = useState<ReplyComment[]>(queue);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [publishedAll, setPublishedAll] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const pending = replies.filter((r) => r.status === "pending").length;
  const approved = replies.filter((r) => r.status === "approved").length;
  const rejected = replies.filter((r) => r.status === "rejected").length;

  const approve = (id: string) =>
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));

  const reject = (id: string) =>
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));

  const submitFeedback = (id: string) => {
    // Regenerate draft with feedback note, keep as pending
    setReplies((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, draftReply: r.draftReply + ` [AI revised: ${feedbackText}]` }
          : r
      )
    );
    setFeedbackId(null);
    setFeedbackText("");
  };

  const startEdit = (r: ReplyComment) => {
    setEditingId(r.id);
    setEditText(r.draftReply);
  };

  const saveEdit = (id: string) => {
    setReplies((prev) =>
      prev.map((r) => (r.id === id ? { ...r, draftReply: editText, status: "approved" } : r))
    );
    setEditingId(null);
  };

  const approveAll = () =>
    setReplies((prev) => prev.map((r) => (r.status === "pending" ? { ...r, status: "approved" } : r)));

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    return "text-gray-400";
  };

  const platformColor: Record<string, string> = {
    Instagram: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
    TikTok: "bg-gray-900 text-white dark:bg-gray-700",
    "X (Twitter)": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    LinkedIn: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Pending", value: pending, color: "text-orange-500" },
          { label: "Approved", value: approved, color: "text-green-600" },
          { label: "AI Feedback", value: rejected, color: "text-purple-500" },
        ].map((s) => (
          <div key={s.label} className="text-center py-1">
            <p className={`text-base font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Approve all pending */}
      {pending > 0 && (
        <button
          onClick={approveAll}
          className="w-full mb-3 rounded-lg border border-green-200 bg-green-50 py-2 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
        >
          Approve All {pending} Pending Replies
        </button>
      )}

      {/* Reply list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
        {replies.map((r) => (
          <div
            key={r.id}
            className={`rounded-xl border p-3 transition-all ${
              r.status === "approved"
                ? "border-green-200 bg-green-50/40 dark:border-green-500/20 dark:bg-green-500/5"
                : r.status === "rejected"
                ? "border-gray-200 bg-gray-50/60 opacity-50 dark:border-gray-700 dark:bg-gray-800/30"
                : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            {/* Comment header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${platformColor[r.platform] ?? "bg-gray-100 text-gray-600"}`}>
                  {r.platformIcon} {r.platform}
                </span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">@{r.author}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-xs font-bold ${scoreColor(r.authorScore)}`}>#{r.authorScore}</span>
                {r.status === "approved" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>

            {/* Original comment */}
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2 italic">
              &ldquo;{r.comment}&rdquo;
            </p>

            {/* Draft reply */}
            {editingId === r.id ? (
              <div className="space-y-1.5">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-brand-600 dark:bg-gray-800 dark:text-gray-300 resize-none"
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => saveEdit(r.id)}
                    className="flex-1 rounded-lg bg-brand-500 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    Save & Approve
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-2 pl-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-gray-400">AI Draft Reply</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                    OpenAI Adapted
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.draftReply}</p>
              </div>
            )}

            {/* Actions — only if not editing */}
            {editingId !== r.id && r.status !== "rejected" && (
              <div className="flex gap-1.5">
                {r.status !== "approved" && (
                  <button
                    onClick={() => approve(r.id)}
                    className="flex-1 rounded-lg bg-green-500 py-1.5 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                  >
                    ✓ Approve
                  </button>
                )}
                <button
                  onClick={() => startEdit(r)}
                  className="flex-1 rounded-lg border border-brand-200 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors dark:border-brand-500/30 dark:text-brand-400"
                >
                  Edit
                </button>
                {r.status !== "approved" && (
                  <button
                    onClick={() => setFeedbackId(feedbackId === r.id ? null : r.id)}
                    className="rounded-lg border border-purple-200 px-2.5 py-1.5 text-sm text-purple-600 hover:bg-purple-50 transition-colors dark:border-purple-500/30 dark:text-purple-400"
                  >
                    AI Feedback
                  </button>
                )}
              </div>
            )}

            {/* AI Feedback box */}
            {feedbackId === r.id && (
              <div className="mt-2 pt-2 border-t border-purple-100 dark:border-purple-500/20">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1.5">
                  🧠 Tell AI what to improve
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. More friendly tone, shorter, add emoji..."
                  rows={2}
                  className="w-full rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-purple-400 dark:border-purple-500/30 dark:bg-gray-800 dark:text-gray-300 resize-none"
                />
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={() => submitFeedback(r.id)}
                    disabled={!feedbackText.trim()}
                    className="flex-1 rounded-lg bg-purple-500 py-1.5 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-40 transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => { setFeedbackId(null); setFeedbackText(""); }}
                    className="rounded-lg border border-purple-200 px-2.5 py-1.5 text-sm text-purple-500 hover:bg-purple-50 transition-colors dark:border-purple-500/30"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Publish approved */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-800 mt-3">
        {publishedAll ? (
          <div className="rounded-lg bg-green-50 dark:bg-green-500/10 py-3 text-center">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">🛡️ {queuedCount} {queuedCount === 1 ? "reply" : "replies"} queued</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Late will auto-send based on your delay settings</p>
          </div>
        ) : (
          <>
            {publishError && (
              <p className="text-xs text-red-500 mb-2 text-center">{publishError}</p>
            )}
            <button
              onClick={async () => {
                if (approved === 0) return;
                const approvedReplies = replies.filter((r) => r.status === "approved");
                if (onPublishReplies && taskId) {
                  setPublishLoading(true);
                  setPublishError(null);
                  try {
                    const result = await onPublishReplies(taskId, approvedReplies);
                    setQueuedCount(result.queued);
                    setPublishedAll(true);
                    onPublish?.();
                  } catch (e) {
                    setPublishError("Failed to queue replies. Try again.");
                  } finally {
                    setPublishLoading(false);
                  }
                } else {
                  // fallback demo
                  setQueuedCount(approved);
                  setPublishedAll(true);
                  onPublish?.();
                }
              }}
              disabled={approved === 0 || publishLoading}
              className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {publishLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Queueing...
                </>
              ) : (
                `Queue ${approved} Approved ${approved === 1 ? "Reply" : "Replies"}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Rejection reasons ──────────────────────────────────────────
const REJECT_REASONS = [
  { reason: "image", label: "🖼️ Image / Visual", desc: "Wrong style, low quality, or off-brand" },
  { reason: "video", label: "🎬 Video", desc: "Wrong format, length, or quality" },
  { reason: "text",  label: "📝 Caption / Text", desc: "Wrong tone, message, or accuracy" },
  { reason: "other", label: "🔄 Other", desc: "Content does not match brand guidelines" },
];

// ── Main TaskDetailPanel ─────────────────────────────────────────
export default function TaskDetailPanel({ task, isConnected = true, onPublish, onReject, isRejected, onPublishReplies }: TaskDetailPanelProps) {
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [published, setPublished] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejected, setRejected] = useState(false);

  // Media upload
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const isTikTok = task?.platform === "TikTok";
  const isVideoTask = ["TikTok", "Reels", "Shorts", "YouTube", "YouTube Shorts"].includes(task?.platform || "");
  const isInstagram = task?.platform === "Instagram";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const selected = isVideoTask ? [files[0]] : files;
    setMediaFiles(selected);
    const previews = selected.map((f) => URL.createObjectURL(f));
    setMediaPreviews(previews);
  };

  const removeMedia = (idx: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== idx);
    const newPreviews = mediaPreviews.filter((_, i) => i !== idx);
    URL.revokeObjectURL(mediaPreviews[idx]);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const doPublish = useCallback(async (options?: PublishOptions) => {
    if (!task) return;
    setPublishLoading(true);
    setPublishError(null);
    try {
      if (onPublish) {
        await onPublish(task.id, options);
      }
      setPublished(true);
      setShowScheduler(false);
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "Publish failed. Try again.");
    } finally {
      setPublishLoading(false);
    }
  }, [task, onPublish]);

  const handleRejectWithReason = (reason: string) => {
    setShowRejectDialog(false);
    setRejected(true);
    onReject?.(task!.id, reason);
  };

  const handleTikTokPublish = useCallback(async () => {
    setTiktokLoading(true);
    try {
      const url = await buildTikTokOAuthUrl();
      window.location.href = url;
    } catch {
      setTiktokLoading(false);
    }
  }, []);

  // Reset local state whenever the selected task changes
  useEffect(() => {
    setPublished(false);
    setPublishLoading(false);
    setPublishError(null);
    setShowScheduler(false);
    setScheduleDate("");
    setScheduleTime("");
    setShowRejectDialog(false);
    setRejected(false);
    setMediaFiles([]);
    setMediaPreviews([]);
  }, [task?.id]);

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Select a task to see details</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Click on any task in the center panel</p>
        </div>
      </div>
    );
  }

  // Late reply task — special layout
  if (task.taskType === "reply" && task.replyQueue) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
              🔗 Late
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
              {task.agent}
            </span>
            <ImpactFireIcons level={task.impact} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{task.title}</h3>
          <p className="text-xs text-gray-400 mt-1">{task.description}</p>
        </div>
        {/* Reply queue */}
        <div className="flex-1 overflow-hidden p-4">
          <ReplyQueuePanel
            queue={task.replyQueue}
            onPublish={() => onPublish?.(task.id)}
            onPublishReplies={onPublishReplies}
            taskId={task.id}
          />
        </div>
      </div>
    );
  }

  // Standard task layout
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              task.priority === "high" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" :
              task.priority === "medium" ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" :
              "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}>
              {task.priority}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              task.agent === "CEO"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
            }`}>
              {task.agent}
            </span>
            {task.platform && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {task.platform}
              </span>
            )}
          </div>
          <ImpactFireIcons level={task.impact} />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{task.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due: {task.dueDate}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(task.content?.imageUrl || task.imageUrl) && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={task.content?.imageUrl || task.imageUrl}
              alt={task.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-1.5">What to do</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{task.description}</p>
        </div>

        {task.content?.caption && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1.5">Caption</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {task.content.caption}
            </p>
          </div>
        )}

        {task.content?.hashtags && task.content.hashtags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1.5">Hashtags</h4>
            <div className="flex flex-wrap gap-1.5">
              {task.content.hashtags.map((tag, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Media Upload ── */}
        {task.platform && task.platform !== "Blog" && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <h4 className="text-sm font-medium text-gray-400">Upload Media</h4>
              {isInstagram && (
                <span className="inline-flex items-center rounded-full bg-pink-50 px-1.5 py-0.5 text-xs font-medium text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
                  Carousel up to 10
                </span>
              )}
              {isVideoTask && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  9:16 video only
                </span>
              )}
            </div>

            {mediaPreviews.length === 0 ? (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept={isVideoTask ? "video/mp4,video/*" : "image/*"}
                  multiple={isInstagram && !isVideoTask}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-center hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-gray-300">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-gray-400">
                    {isVideoTask
                      ? "Click to upload 9:16 video (MP4)"
                      : isInstagram
                      ? "Click to upload images (single or carousel)"
                      : "Click to upload image"}
                  </p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
                    {isVideoTask ? "Landscape video will be cropped to 9:16" : "PNG, JPG, WebP"}
                  </p>
                </div>
              </label>
            ) : (
              <div>
                {/* Instagram carousel grid */}
                {isInstagram && (
                  <div>
                    {mediaPreviews.length > 1 && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-medium text-pink-700 dark:bg-pink-500/10 dark:text-pink-400">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></svg>
                          Carousel · {mediaPreviews.length} images
                        </span>
                        <label className="cursor-pointer text-[10px] text-brand-500 hover:text-brand-600 underline">
                          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                          + Add more
                        </label>
                      </div>
                    )}
                    <div className={`grid gap-1 ${mediaPreviews.length === 1 ? "grid-cols-1" : mediaPreviews.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                      {mediaPreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          {i === 0 && mediaPreviews.length > 1 && (
                            <span className="absolute top-1 left-1 text-[8px] bg-black/70 text-white rounded px-1 py-0.5">Cover</span>
                          )}
                          <button
                            onClick={() => removeMedia(i)}
                            className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >×</button>
                        </div>
                      ))}
                      {mediaPreviews.length < 10 && (
                        <label className="cursor-pointer aspect-square rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-300 transition-colors">
                          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                          <span className="text-xl text-gray-300">+</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}
                {/* Video preview */}
                {isVideoTask && (
                  <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "9/16", maxHeight: 220 }}>
                    <video src={mediaPreviews[0]} className="w-full h-full object-contain" controls />
                    <button
                      onClick={() => removeMedia(0)}
                      className="absolute top-2 right-2 rounded-full bg-black/70 text-white text-xs px-2 py-0.5 hover:bg-black/90"
                    >
                      Remove
                    </button>
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/60 text-white text-[9px] px-1.5 py-0.5">
                      9:16
                    </div>
                  </div>
                )}
                {/* Non-instagram, non-video single image */}
                {!isInstagram && !isVideoTask && (
                  <div className="relative rounded-xl overflow-hidden group">
                    <img src={mediaPreviews[0]} alt="" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => removeMedia(0)}
                      className="absolute top-2 right-2 rounded-full bg-black/70 text-white text-xs px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <FeedbackSection taskId={task.id} />

        {/* ── Rejection dialog ── */}
        {showRejectDialog && (
          <div className="pt-1">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
              ❓ What&apos;s not suitable?
            </p>
            <div className="space-y-1.5">
              {REJECT_REASONS.map(({ reason, label, desc }) => (
                <button
                  key={reason}
                  onClick={() => handleRejectWithReason(reason)}
                  className="w-full text-left rounded-lg border border-red-200 dark:border-red-500/20 px-3 py-2 hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-500/5 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRejectDialog(false)}
              className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 py-1.5 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        )}

        {showScheduler && (
          <div className="pt-1">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Schedule Publish</h4>
            <div className="flex gap-2 mb-2">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const scheduledFor = `${scheduleDate}T${scheduleTime}:00`;
                  doPublish({ publishNow: false, scheduledFor });
                }}
                disabled={!scheduleDate || !scheduleTime || publishLoading}
                className="flex-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {publishLoading ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Scheduling…
                  </>
                ) : "Confirm"}
              </button>
              <button
                onClick={() => setShowScheduler(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        {rejected || isRejected ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-500/10 py-2.5 text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">✕ Content Rejected</p>
            <p className="text-xs text-red-500 dark:text-red-500/70 mt-0.5">Added to AI training data</p>
          </div>
        ) : published ? (
          <div className="rounded-lg bg-green-50 dark:bg-green-500/10 py-2.5 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">✓ Published successfully</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Moved to Done section</p>
          </div>
        ) : !isConnected ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {task.platform} belum terhubung
            </p>
            <p className="text-xs text-gray-400 mb-3">Hubungkan di halaman Home terlebih dahulu</p>
            <a href="/" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
              → Ke Halaman Home
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {publishError && (
              <p className="text-xs text-red-500 text-center">{publishError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => doPublish({ publishNow: true })}
                disabled={publishLoading}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${
                  isTikTok ? "bg-[#FE2C55] hover:bg-[#e0264c]" : "bg-brand-500 hover:bg-brand-600"
                }`}
              >
                {publishLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Publishing…
                  </>
                ) : isTikTok ? (
                  <><TikTokSVG size={14} /> Publish to TikTok</>
                ) : "Publish Now"}
              </button>
              <button
                onClick={() => doPublish({ publishNow: false })}
                disabled={publishLoading}
                className="rounded-xl border border-brand-200 px-3 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors dark:border-brand-500/30 dark:text-brand-400 disabled:opacity-50"
                title={`Auto publish at best time on ${task.dueDate}`}
              >
                Auto
              </button>
              <button
                onClick={() => setShowScheduler(!showScheduler)}
                className="rounded-xl border border-gray-200 px-3 py-3 text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
            </div>
            {/* Reject button */}
            <button
              onClick={() => setShowRejectDialog(!showRejectDialog)}
              className={`w-full rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                showRejectDialog
                  ? "border-red-400 bg-red-50 text-red-700 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-400"
                  : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:hover:border-red-500/30"
              }`}
            >
              {showRejectDialog ? "✕ Cancel Rejection" : "Reject Content"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
