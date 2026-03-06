"use client";
import React, { useState, useEffect, useCallback } from "react";
import NavColumn from "@/components/shared/NavColumn";
import { supabase } from "@/lib/supabase";

const BRAND_ID = process.env.NEXT_PUBLIC_brandId || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";

interface ResearchSession {
  id: string;
  request_id: string;
  query: string;
  category: string | null;
  platform: string | null;
  status: string;
  response: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

interface DeepSession {
  id: string;
  brand_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  completed:   { bg: "#D1FAE5", text: "#065F46", label: "Selesai" },
  pending:     { bg: "#FEF9C3", text: "#854D0E", label: "Antri" },
  processing:  { bg: "#DBEAFE", text: "#1E40AF", label: "Proses" },
  failed:      { bg: "#FEE2E2", text: "#991B1B", label: "Gagal" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

export default function ResearchPage() {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [deepSessions, setDeepSessions] = useState<DeepSession[]>([]);
  const [selected, setSelected] = useState<ResearchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [tab, setTab] = useState<"perplexity" | "deep">("perplexity");

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: px }, { data: deep }] = await Promise.all([
      supabase
        .from("gv_perplexity_requests")
        .select("id, request_id, query, category, platform, status, response, created_at, completed_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("gv_deep_research_sessions")
        .select("id, brand_id, status, created_at, completed_at")
        .eq("brand_id", BRAND_ID)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    if (px) setSessions(px);
    if (deep) setDeepSessions(deep);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function triggerDeepResearch() {
    setTriggering(true);
    try {
      const res = await fetch(
        `https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/perplexity-research`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ brand_id: BRAND_ID, mode: "deep" }),
        }
      );
      if (res.ok) {
        setTimeout(() => load(), 2000);
      }
    } catch { /* ok */ }
    setTriggering(false);
  }

  const completedCount = sessions.filter(s => s.status === "completed").length;
  const pendingCount = sessions.filter(s => s.status === "pending" || s.status === "processing").length;

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--gv-color-bg-base)" }}>
      {/* Nav */}
      <div className="hidden lg:block flex-shrink-0 w-[88px]"><NavColumn /></div>
      <div className="hidden lg:block flex-shrink-0 w-4" />

      {/* Main */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden lg:rounded-[32px] my-0 lg:my-4"
        style={{
          background: "var(--gv-color-bg-surface)",
          border: "1px solid var(--gv-color-neutral-200)",
          boxShadow: "var(--gv-shadow-card)",
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--gv-color-neutral-100)" }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-bold" style={{ color: "var(--gv-color-neutral-900)", fontFamily: "Georgia, serif" }}>
                Very Deep Research
              </h1>
              <p className="text-[13px] mt-1" style={{ color: "var(--gv-color-neutral-500)" }}>
                Perplexity AI market intelligence · competitor analysis · trend discovery
              </p>
            </div>
            <button
              onClick={triggerDeepResearch}
              disabled={triggering}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all"
              style={{
                background: "var(--gv-color-primary-600)",
                color: "white",
                opacity: triggering ? 0.7 : 1,
              }}
            >
              {triggering ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
              {triggering ? "Menjalankan..." : "Jalankan Research"}
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4">
            {[
              { label: "Total Research", value: sessions.length },
              { label: "Selesai", value: completedCount, color: "#065F46" },
              { label: "Pending", value: pendingCount, color: "#854D0E" },
              { label: "Deep Sessions", value: deepSessions.length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-[20px] font-bold" style={{ color: s.color ?? "var(--gv-color-neutral-900)" }}>
                  {s.value}
                </div>
                <div className="text-[11px]" style={{ color: "var(--gv-color-neutral-400)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4">
            {(["perplexity", "deep"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all"
                style={{
                  background: tab === t ? "var(--gv-color-primary-600)" : "transparent",
                  color: tab === t ? "white" : "var(--gv-color-neutral-500)",
                }}
              >
                {t === "perplexity" ? `Perplexity Requests (${sessions.length})` : `Deep Sessions (${deepSessions.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* List */}
          <div className="flex flex-col flex-1 min-w-0 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "var(--gv-color-primary-400)" }} />
              </div>
            ) : tab === "perplexity" ? (
              sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <span className="text-[40px]">🔍</span>
                  <p className="text-[15px] font-semibold" style={{ color: "var(--gv-color-neutral-700)" }}>
                    Belum ada research
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--gv-color-neutral-400)" }}>
                    Klik "Jalankan Research" untuk memulai Perplexity analysis
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {sessions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelected(selected?.id === s.id ? null : s)}
                      className="flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--gv-color-neutral-50)]"
                      style={{
                        borderBottom: "1px solid var(--gv-color-neutral-100)",
                        background: selected?.id === s.id ? "var(--gv-color-primary-50, #EDF5F4)" : "transparent",
                      }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[14px]"
                          style={{ background: "var(--gv-color-primary-100, #C8E6E4)" }}>
                          🔬
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--gv-color-neutral-800)" }}>
                          {s.query || s.request_id}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={s.status} />
                          {s.category && (
                            <span className="text-[11px]" style={{ color: "var(--gv-color-neutral-400)" }}>
                              {s.category}
                            </span>
                          )}
                          {s.platform && (
                            <span className="text-[11px]" style={{ color: "var(--gv-color-neutral-400)" }}>
                              · {s.platform}
                            </span>
                          )}
                          <span className="text-[11px] ml-auto" style={{ color: "var(--gv-color-neutral-400)" }}>
                            {new Date(s.created_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              deepSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <span className="text-[40px]">🧠</span>
                  <p className="text-[15px] font-semibold" style={{ color: "var(--gv-color-neutral-700)" }}>
                    Belum ada deep session
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {deepSessions.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-4"
                      style={{ borderBottom: "1px solid var(--gv-color-neutral-100)" }}>
                      <span className="text-[20px]">🧠</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold" style={{ color: "var(--gv-color-neutral-800)" }}>
                          Deep Research Session
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--gv-color-neutral-400)" }}>
                          {new Date(s.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
              style={{
                width: "42%",
                borderLeft: "1px solid var(--gv-color-neutral-100)",
              }}
            >
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid var(--gv-color-neutral-100)" }}>
                <p className="text-[14px] font-semibold" style={{ color: "var(--gv-color-neutral-800)" }}>
                  Research Detail
                </p>
                <button onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center"
                  style={{ background: "var(--gv-color-neutral-100)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--gv-color-neutral-400)" }}>Query</p>
                    <p className="text-[13px]" style={{ color: "var(--gv-color-neutral-800)" }}>
                      {selected.query || selected.request_id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Status", value: <StatusBadge status={selected.status} /> },
                      { label: "Category", value: selected.category || "—" },
                      { label: "Platform", value: selected.platform || "—" },
                      { label: "Selesai", value: selected.completed_at ? new Date(selected.completed_at).toLocaleString("id-ID") : "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                          style={{ color: "var(--gv-color-neutral-400)" }}>{label}</p>
                        <div className="text-[13px]" style={{ color: "var(--gv-color-neutral-700)" }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selected.response && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                        style={{ color: "var(--gv-color-neutral-400)" }}>Response</p>
                      <div className="rounded-[12px] p-4 overflow-auto max-h-64"
                        style={{ background: "var(--gv-color-neutral-50)", border: "1px solid var(--gv-color-neutral-100)" }}>
                        <pre className="text-[11px] whitespace-pre-wrap"
                          style={{ color: "var(--gv-color-neutral-700)", fontFamily: "monospace" }}>
                          {typeof selected.response === "string"
                            ? selected.response
                            : JSON.stringify(selected.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:block flex-shrink-0 w-4" />
    </div>
  );
}
