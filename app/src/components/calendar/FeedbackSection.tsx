"use client";
import { useState } from "react";

interface FeedbackSectionProps {
  taskId: string;
}

export default function FeedbackSection({ taskId }: FeedbackSectionProps) {
  const [feedback, setFeedback] = useState<"like" | "dislike" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      <h4 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">AI Feedback</h4>
      <p className="text-[10px] text-gray-400 mb-2">Rate this task to help improve AI quality</p>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment for the AI to learn from..."
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 resize-none mb-2"
        rows={2}
      />

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setFeedback(feedback === "like" ? null : "like")}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
            feedback === "like"
              ? "bg-brand-500 text-white"
              : "border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <span className="text-[11px]">👍</span>
        </button>
        <button
          onClick={() => setFeedback(feedback === "dislike" ? null : "dislike")}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
            feedback === "dislike"
              ? "bg-orange-400 text-white"
              : "border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <span className="text-[11px]">👎</span>
        </button>
        <button
          onClick={() => setFeedback(feedback === "reject" ? null : "reject")}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
            feedback === "reject"
              ? "bg-red-500 text-white"
              : "border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
          }`}
        >
          Reject
        </button>
        {feedback && (
          <span className="ml-auto text-[10px] text-gray-400">
            {feedback === "like" ? "👍 Liked" : feedback === "dislike" ? "👎 Disliked" : "✕ Rejected"}
          </span>
        )}
      </div>
    </div>
  );
}
