"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import ThreeColumnLayout from "@/components/shared/ThreeColumnLayout";
import NavColumn from "@/components/shared/NavColumn";
import { supabase } from "@/lib/supabase";

const FALLBACK_BRAND_ID =
  process.env.NEXT_PUBLIC_DEMO_BRAND_ID || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";

// ── Constants ─────────────────────────────────────────────────────────────────
const IMAGE_DAILY_LIMITS: Record<string, number> = { basic: 10, premium: 20, partner: 30 };
const VIDEO_DAILY_LIMITS: Record<string, number> = { basic: 1, premium: 2, partner: 3 };
const VIDEO_MAX_DURATION: Record<string, number> = { basic: 8, premium: 15, partner: 30 };
const TRAINING_LIMITS: Record<string, number> = { basic: 5, premium: 10, partner: 15 };

const VIDEO_TOPICS = [
  { id: "podcast",        label: "🎙️ Podcast",               desc: "Conversational, interview style" },
  { id: "product_review", label: "⭐ Product Review",        desc: "Honest, detailed showcase" },
  { id: "edu_product",    label: "📚 Edukasi Product",       desc: "How-to, tutorial format" },
  { id: "new_product",    label: "🆕 New Product Launch",    desc: "Exciting announcement" },
  { id: "soft_selling",   label: "💫 Soft Selling",          desc: "Subtle, lifestyle integrated" },
  { id: "lifestyle",      label: "🌟 Lifestyle",             desc: "Day-in-life, aspirational" },
  { id: "advertorial",    label: "📰 Advertorial Trend",     desc: "Trending format, viral hook" },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type StudioSection = "generate_image" | "generate_video" | "train_product" | "train_character" | "history";
type SubjectType = "character" | "product" | "both";
type ModelMode = "trained" | "random";
type VideoInputType = "text" | "image";
type PromptSource = "random" | "custom" | "task";

interface TrainedModel {
  id: string; dataset_name: string; theme: string; image_count: number;
  training_status: string; model_path: string | null;
  metadata: { trigger_word?: string; kie_training_id?: string; lora_model?: string } | null;
  created_at: string;
}
interface GeneratedImage {
  id: string; prompt_text: string; image_url: string | null; thumbnail_url: string | null;
  status: string; ai_model: string | null; target_platform: string | null;
  style_preset: string | null; created_at: string; feedback?: string | null;
}
interface GeneratedVideo {
  id: string; hook: string; video_url: string | null; video_thumbnail_url: string | null;
  video_status: string | null; ai_model: string | null; target_platform: string | null;
  video_aspect_ratio: string | null; created_at: string; feedback?: string | null;
}
interface TodayTask { id: string; title: string; description: string | null; target_platforms: string[] | null; }
interface SideImage { side: "front" | "left" | "back" | "right"; label: string; file: File | null; preview: string | null; storageUrl: string | null; }
type DetailItem = { type: "image"; data: GeneratedImage } | { type: "video"; data: GeneratedVideo } | { type: "model"; data: TrainedModel } | null;

// ── API helpers ───────────────────────────────────────────────────────────────
async function studioFetch(payload: Record<string, unknown>) {
  const res = await fetch("/api/content-studio", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new Error(`Server error (${res.status}) — please try again`);
  }
  return res.json();
}

async function uploadImage(file: File, brandId: string, folder: string, name: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${brandId}/${name}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("agent-profiles").upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("agent-profiles").getPublicUrl(path);
  return data.publicUrl;
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex border-b border-gray-100 dark:border-gray-800">
      {steps.map((label, i) => {
        const n = i + 1;
        return (
          <div key={label} className={`flex-1 text-center py-2.5 text-[10px] font-semibold transition-colors ${
            current === n ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500"
            : current > n ? "text-green-600 dark:text-green-400"
            : "text-gray-400"
          }`}>
            {current > n ? "✓ " : `${n}. `}{label}
          </div>
        );
      })}
    </div>
  );
}

function DailyQuota({ used, limit, label }: { used: number; limit: number; label: string }) {
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, (used / limit) * 100);
  const color = remaining === 0 ? "bg-red-500" : remaining <= 2 ? "bg-amber-500" : "bg-brand-500";
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{label} today</span>
          <span className={`text-[10px] font-bold ${remaining === 0 ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
            {remaining} left / {limit}
          </span>
        </div>
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function SmartPromptBtn({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold hover:bg-purple-100 dark:hover:bg-purple-500/20 disabled:opacity-50 transition-colors"
    >
      {loading ? <span className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" /> : "✨"}
      {loading ? "AI thinking..." : "Smart Prompt (OpenAI)"}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CENTER — Studio Section Picker
// ══════════════════════════════════════════════════════════════════════════════
const SECTIONS: { id: StudioSection; icon: string; label: string; sub: string }[] = [
  { id: "generate_image",  icon: "🖼️", label: "Generate Image",     sub: "KIE Flux · daily quota" },
  { id: "generate_video",  icon: "🎬", label: "Generate Video",     sub: "KIE Kling · daily quota" },
  { id: "train_product",   icon: "🏭", label: "Product Training",   sub: "LoRA · 4-side upload" },
  { id: "train_character", icon: "👤", label: "Character Training", sub: "LoRA · persona model" },
  { id: "history",         icon: "📋", label: "History",            sub: "All generations" },
];

function StudioSectionPicker({ active, onSelect }: { active: StudioSection; onSelect: (s: StudioSection) => void }) {
  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
          Content Studio
        </h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Powered by KIE + OpenAI</p>
      </div>
      <div className="space-y-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all border ${
              active === s.id
                ? "bg-brand-50 dark:bg-brand-500/10 border-brand-300 dark:border-brand-500 shadow-sm"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:shadow-sm"
            }`}
          >
            <span className="text-3xl flex-shrink-0">{s.icon}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${active === s.id ? "text-brand-700 dark:text-brand-400" : "text-gray-800 dark:text-gray-200"}`}>
                {s.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
            {active === s.id && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 space-y-1.5 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">KIE API Connected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
          <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">OpenAI Smart Prompts</span>
        </div>
        <p className="text-[10px] text-gray-400">Flux · Kling V1/V2 · LoRA</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERATING POPUP
// ══════════════════════════════════════════════════════════════════════════════
function GeneratingPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border border-gray-200 dark:border-gray-700">
        <div className="text-5xl mb-3 animate-bounce">⏳</div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Sedang Diproses</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Generate sedang berlangsung di background. Hasilnya akan otomatis muncul di{" "}
          <strong className="text-brand-600 dark:text-brand-400">History</strong> ketika sudah selesai.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          OK, Mengerti
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TRAINING WIZARD
// ══════════════════════════════════════════════════════════════════════════════
function TrainingWizard({
  brandId, trainingType, currentTier, totalModelCount, pastDatasets, onDone,
}: {
  brandId: string; trainingType: "product" | "character";
  currentTier: string; totalModelCount: number;
  pastDatasets: TrainedModel[];
  onDone: (m: TrainedModel) => void;
}) {
  const limit = TRAINING_LIMITS[currentTier] ?? 5;
  const atLimit = totalModelCount >= limit;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [datasetName, setDatasetName] = useState("");
  const [triggerWord, setTriggerWord] = useState("");
  const [sides, setSides] = useState<SideImage[]>([
    { side: "front", label: "Front",  file: null, preview: null, storageUrl: null },
    { side: "left",  label: "Left",   file: null, preview: null, storageUrl: null },
    { side: "back",  label: "Back",   file: null, preview: null, storageUrl: null },
    { side: "right", label: "Right",  file: null, preview: null, storageUrl: null },
  ]);
  const [totalSizeMB, setTotalSizeMB] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  // Step 2
  const [synthUrls, setSynthUrls] = useState<string[]>([]);
  const [synthCount, setSynthCount] = useState(0);
  const [synthLoading, setSynthLoading] = useState(false);
  // Step 3
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [trainingStatus, setTrainingStatus] = useState("training");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const handleFileChange = useCallback((side: SideImage["side"], files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const preview = URL.createObjectURL(file);
    setSides((prev) => {
      // Revoke old blob URL to prevent memory leak
      const old = prev.find((s) => s.side === side);
      if (old?.preview?.startsWith("blob:")) URL.revokeObjectURL(old.preview);
      const updated = prev.map((s) => s.side === side ? { ...s, file, preview } : s);
      const total = updated.reduce((a, s) => a + (s.file?.size ?? 0), 0) / 1024 / 1024;
      setTotalSizeMB(parseFloat(total.toFixed(2)));
      setSizeError(total > 10);
      return updated;
    });
  }, []);

  const allUploaded = sides.every((s) => s.file !== null);

  const proceedToStep2 = async () => {
    if (!datasetName.trim() || !allUploaded || sizeError) return;
    setStep(2);
    setSynthLoading(true);
    setError(null);
    setSynthUrls([]);
    setSynthCount(0);

    // Upload all 4 images to Supabase Storage in parallel
    const folder = `training-${trainingType}`;
    const safeName = datasetName.replace(/\s+/g, "-").toLowerCase();
    let uploadedUrls: string[] = [];
    try {
      uploadedUrls = await Promise.all(
        sides.map((s) => uploadImage(s.file!, brandId, folder, `${safeName}-${s.side}`))
      );
    } catch (e) {
      setError(`Upload failed: ${e instanceof Error ? e.message : "unknown"}`);
      setStep(1);
      setSynthLoading(false);
      return;
    }

    // Generate 8 synthetic training images via Llama (prompt engineering) + KIE Flux-2 Pro
    let syntheticUrls: string[] = [];
    try {
      const res = await studioFetch({
        action: "generate_synthetics",
        brand_id: brandId,
        name: datasetName,
        training_type: trainingType,
        count: 8,
        past_datasets: pastDatasets.map((d) => ({ dataset_name: d.dataset_name, theme: d.theme })),
      });
      if (res.success && Array.isArray(res.synthetic_urls)) {
        syntheticUrls = res.synthetic_urls;
        setSynthUrls(syntheticUrls);
        setSynthCount(res.count ?? syntheticUrls.length);
      }
    } catch {
      // Non-fatal — continue with originals only
    }

    setSynthLoading(false);

    // Start training — pass syntheticUrls directly (avoid stale React state)
    await startTraining(uploadedUrls, syntheticUrls);
  };

  const startTraining = async (originalUrls: string[], synUrls: string[]) => {
    setStep(3);
    setError(null);
    const allUrls = [...originalUrls, ...synUrls];
    const tw = triggerWord.trim() || datasetName.toLowerCase().replace(/\s+/g, "_");

    try {
      const res = await studioFetch({
        action: trainingType === "product" ? "train_product" : "train_character",
        brand_id: brandId,
        name: datasetName,
        trigger_word: tw,
        image_urls: allUrls,
        steps: 1000,
      });
      if (res.success) {
        setTrainingId(res.training_id);
        setTrainingStatus("training");
        // Clear any existing interval before starting a new one
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          if (!res.training_id) return;
          const s = await studioFetch({ action: "check_training", brand_id: brandId, training_id: res.training_id });
          if (s.success) {
            setTrainingStatus(s.status ?? "training");
            setTrainingProgress(s.progress ?? 0);
            if (["completed", "succeeded", "success"].includes(s.status)) {
              if (pollRef.current) clearInterval(pollRef.current);
              onDone({
                id: Date.now().toString(), dataset_name: datasetName, theme: trainingType,
                image_count: allUrls.length, training_status: "completed",
                model_path: s.model_url ?? null,
                metadata: { trigger_word: tw, kie_training_id: res.training_id },
                created_at: new Date().toISOString(),
              });
            }
          }
        }, 15000);
      } else {
        setError(res.error ?? "Training failed to start");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Training error");
    }
  };

  const resetWizard = () => {
    setStep(1); setDatasetName(""); setTriggerWord(""); setSynthUrls([]); setSynthCount(0);
    setTrainingId(null); setTrainingStatus("training"); setTrainingProgress(0); setError(null);
    setSides(sides.map((s) => ({ ...s, file: null, preview: null, storageUrl: null })));
    if (pollRef.current) clearInterval(pollRef.current);
  };

  if (atLimit) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-6 text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Training Quota Reached</p>
        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
          {currentTier} plan: max {limit} trained models. Upgrade to train more.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <StepBar steps={["Upload 4 Sides", "8 Synthetics", "Training"]} current={step} />
      <div className="p-4 space-y-4">

        {/* ── STEP 1: Upload ── */}
        {step === 1 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
                {trainingType === "product" ? "🏭 Product Training" : "👤 Character Training"}
              </h3>
              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">
                {totalModelCount} / {limit} models
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Dataset Name *</label>
                <input
                  value={datasetName}
                  onChange={(e) => { setDatasetName(e.target.value); if (!triggerWord) setTriggerWord(e.target.value.toLowerCase().replace(/\s+/g, "_")); }}
                  placeholder={trainingType === "product" ? "Summer Bag 2026" : "Brand Ambassador"}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Trigger Word</label>
                <input
                  value={triggerWord}
                  onChange={(e) => setTriggerWord(e.target.value)}
                  placeholder="summer_bag_2026"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs outline-none focus:border-brand-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                Upload 4 Sides{" "}
                <span className={`font-normal text-[10px] ${sizeError ? "text-red-500" : "text-gray-400"}`}>
                  (total: {totalSizeMB} MB / 10 MB max)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sides.map((s) => (
                  <label
                    key={s.side}
                    className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors overflow-hidden flex items-center justify-center"
                    style={{ aspectRatio: "1", minHeight: 90 }}
                  >
                    {s.preview ? (
                      <>
                        <img src={s.preview} alt={s.side} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                          <span className="text-[10px] font-bold text-white">{s.label} ✓</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 p-2 text-center">
                        <span className="text-xl">📸</span>
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{s.label}</p>
                        <p className="text-[9px] text-gray-400">Click to upload</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(s.side, e.target.files)} />
                  </label>
                ))}
              </div>
            </div>

            {sizeError && <p className="text-xs text-red-500">Total size exceeds 10 MB. Use smaller images.</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={proceedToStep2}
              disabled={!datasetName.trim() || !allUploaded || sizeError}
              className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Generate Synthetic Dataset →
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              GeoVera will generate 8 synthetic training variations using Llama + KIE Flux-2 Pro
            </p>
          </>
        )}

        {/* ── STEP 2: Synthetics ── */}
        {step === 2 && (
          <>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">🎨 Generating Synthetic Dataset</h3>
              <p className="text-xs text-gray-500 mt-1">
                {synthLoading ? `Building ${Math.min(synthCount + 1, 8)} of 8 AI variations...` : `${synthCount} AI variations ready · 4 originals + synthetics`}
              </p>
              <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full bg-brand-500 transition-all duration-700 ${synthLoading ? "" : "bg-green-500"}`}
                  style={{ width: `${synthLoading ? (synthCount / 8) * 100 : 100}%` }} />
              </div>
            </div>

            {/* 8 uploaded originals + synthetics in a 4x4 grid preview */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* 4 original uploads */}
              {sides.map((s) => s.preview && (
                <div key={s.side} className="aspect-square rounded-lg overflow-hidden relative">
                  <img src={s.preview} alt={s.side} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-brand-500/80 text-white text-[8px] font-bold text-center py-0.5">{s.label}</div>
                </div>
              ))}
              {/* Synthetics */}
              {Array.from({ length: 12 }).map((_, i) => {
                const url = synthUrls[i];
                return (
                  <div key={`s${i}`} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {url ? (
                      <img src={url} alt={`synthetic-${i}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-2 ${synthLoading && i === synthCount ? "border-brand-500 animate-spin border-t-transparent" : "border-gray-300 dark:border-gray-600"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {synthLoading && (
              <p className="text-center text-xs text-purple-600 dark:text-purple-400 animate-pulse">
                ✨ OpenAI generating training prompts → KIE Flux creating images...
              </p>
            )}
            {!synthLoading && !error && (
              <div className="text-center text-xs text-green-600 dark:text-green-400 font-semibold">
                ✅ Synthetic dataset ready. Starting LoRA training...
              </div>
            )}
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          </>
        )}

        {/* ── STEP 3: Training ── */}
        {step === 3 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mx-auto">
              {["completed", "succeeded", "success"].includes(trainingStatus)
                ? <span className="text-3xl">✅</span>
                : <div className="w-7 h-7 rounded-full border-[3px] border-brand-500 border-t-transparent animate-spin" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {["completed", "succeeded", "success"].includes(trainingStatus) ? "Training Complete! 🎉" : "LoRA Training in Progress"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {["completed", "succeeded", "success"].includes(trainingStatus)
                  ? `"${datasetName}" is ready. Use it in Generate Image & Video.`
                  : "Training takes 10–30 mins. You can leave this page safely."}
              </p>
            </div>
            {trainingId && (
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-400">Training ID</span>
                  <span className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate max-w-[60%]">{trainingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-400">Trigger Word</span>
                  <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400">{triggerWord || datasetName.toLowerCase().replace(/\s+/g, "_")}</span>
                </div>
                {trainingProgress > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-400">Progress</span>
                      <span className="text-[10px] font-semibold text-brand-600">{trainingProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 transition-all" style={{ width: `${trainingProgress}%` }} />
                    </div>
                  </>
                )}
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={resetWizard} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              + Train Another Model
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERATE IMAGE WIZARD
// ══════════════════════════════════════════════════════════════════════════════
function GenerateImageWizard({
  brandId, currentTier, imagesUsedToday, trainedModels, onResult, onUsed, onGenerateStart,
}: {
  brandId: string; currentTier: string; imagesUsedToday: number;
  trainedModels: TrainedModel[]; onResult: (img: GeneratedImage) => void; onUsed: () => void;
  onGenerateStart?: () => void;
}) {
  const limit = IMAGE_DAILY_LIMITS[currentTier] ?? 3;
  const atLimit = imagesUsedToday >= limit;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [subjectType, setSubjectType] = useState<SubjectType>("product");
  const [modelMode, setModelMode] = useState<ModelMode>("random");
  const [selectedModel, setSelectedModel] = useState<TrainedModel | null>(null);
  const [promptSource, setPromptSource] = useState<PromptSource>("custom");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [selectedTask, setSelectedTask] = useState<TodayTask | null>(null);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [smartLoading, setSmartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const relevantModels = trainedModels.filter((m) =>
    m.training_status === "completed" && (subjectType === "both" || m.theme === subjectType)
  );

  useEffect(() => {
    if (promptSource !== "task") return;
    const today = new Date().toISOString().split("T")[0];
    supabase.from("gv_task_board")
      .select("id, title, description, target_platforms")
      .eq("brand_id", brandId).eq("due_date", today).neq("status", "completed").limit(10)
      .then(({ data }) => setTodayTasks(data ?? []));
  }, [promptSource, brandId]);

  const handleSmartPrompt = async () => {
    setSmartLoading(true);
    try {
      const res = await studioFetch({
        action: "generate_smart_prompt",
        brand_id: brandId,
        prompt_type: "image",
        subject_type: subjectType,
        model_name: selectedModel?.dataset_name ?? "",
        topic_style: "commercial product photography",
        task_context: selectedTask ? selectedTask.title : "",
      });
      if (res.success && res.prompt) {
        setCustomPrompt(res.prompt);
        setPromptSource("custom");
      }
    } catch { /* ignore */ }
    setSmartLoading(false);
  };

  const handleGenerate = async () => {
    if (atLimit) return;
    setLoading(true); setError(null);
    onGenerateStart?.();
    let prompt = customPrompt.trim();
    if (!prompt && promptSource === "task" && selectedTask) {
      prompt = `Create a compelling visual for: ${selectedTask.title}. ${selectedTask.description ?? ""}. Platform: ${selectedTask.target_platforms?.join(", ") ?? "social media"}. Commercial quality, professional photography.`;
    }
    if (!prompt) { setError("Please enter or generate a prompt"); setLoading(false); return; }

    try {
      const res = await studioFetch({
        action: "generate_image", brand_id: brandId, prompt, aspect_ratio: aspectRatio,
        model: modelMode === "trained" ? "kie-flux" : "flux-2-pro",
        ...(modelMode === "trained" && selectedModel?.metadata?.lora_model ? { lora_model: selectedModel.metadata.lora_model } : {}),
      });
      if (res.success) {
        // Poll for image URL if KIE is processing asynchronously (task_id present but no image yet)
        let finalImageUrl: string | null = res.image_url;
        let finalStatus: string = res.status ?? "completed";
        if (res.task_id && !finalImageUrl && !["failed", "error"].includes(finalStatus)) {
          for (let i = 0; i < 12; i++) { // max 60s (12 × 5s)
            await new Promise((r) => setTimeout(r, 5000));
            try {
              const poll = await studioFetch({
                action: "check_task", brand_id: brandId,
                task_id: res.task_id, db_id: res.db_id, task_type: "image",
              });
              finalStatus = poll.status ?? finalStatus;
              if (poll.image_url) { finalImageUrl = poll.image_url; break; }
              if (["failed", "error", "cancelled"].includes(finalStatus)) break;
            } catch { break; }
          }
        }
        onResult({
          id: res.db_id ?? Date.now().toString(), prompt_text: prompt,
          image_url: finalImageUrl, thumbnail_url: finalImageUrl,
          status: finalStatus, ai_model: "kie-flux",
          target_platform: null, style_preset: selectedModel?.metadata?.lora_model ?? null,
          created_at: new Date().toISOString(),
        });
        onUsed();
        // Task link: update cover image when generated from a task
        if (promptSource === "task" && selectedTask && res.image_url) {
          await supabase.from("gv_task_board").update({ cover_image_url: res.image_url }).eq("id", selectedTask.id);
        }
        setStep(1); setCustomPrompt(""); setSelectedTask(null);
      } else { setError(res.error ?? "Generation failed"); }
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const SUBJECT_OPTS = [
    { id: "character" as SubjectType, icon: "👤", label: "Character Only",       desc: "Person or persona" },
    { id: "product"   as SubjectType, icon: "📦", label: "Product Only",         desc: "Item or product" },
    { id: "both"      as SubjectType, icon: "✨", label: "Character + Product",  desc: "Combined scene" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <StepBar steps={["Subject", "Model", "Prompt & Generate"]} current={step} />
      <div className="p-4 space-y-3">
        <DailyQuota used={imagesUsedToday} limit={limit} label="Images" />

        {atLimit && (
          <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-center">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">Daily limit reached ({limit} images)</p>
            <p className="text-[10px] text-red-500 mt-0.5">Resets tomorrow at midnight. Upgrade for more.</p>
          </div>
        )}

        {/* STEP 1: Subject */}
        {step === 1 && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">🖼️ What to feature?</h3>
            <div className="space-y-2">
              {SUBJECT_OPTS.map((opt) => (
                <button key={opt.id} onClick={() => { setSubjectType(opt.id); setStep(2); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-left transition-colors">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{opt.label}</p>
                    <p className="text-[10px] text-gray-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2: Model */}
        {step === 2 && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              🤖 Model
              <span className="ml-2 text-xs font-normal text-brand-600 dark:text-brand-400 capitalize">
                — {subjectType === "both" ? "Character + Product" : subjectType}
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(["trained", "random"] as ModelMode[]).map((mode) => (
                <button key={mode} onClick={() => setModelMode(mode)}
                  className={`p-3 rounded-xl border text-center transition-colors ${modelMode === mode ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                  <p className="text-xl">{mode === "trained" ? "🎓" : "🎲"}</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 capitalize">{mode}</p>
                  <p className="text-[10px] text-gray-400">{mode === "trained" ? "Your LoRA model" : "Base Flux AI"}</p>
                </button>
              ))}
            </div>
            {modelMode === "trained" && (
              relevantModels.length === 0 ? (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400">No completed {subjectType} models. Train one first!</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {relevantModels.map((m) => (
                    <button key={m.id} onClick={() => setSelectedModel(m)}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors ${selectedModel?.id === m.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                      <span className="text-lg">{m.theme === "character" ? "👤" : "📦"}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{m.dataset_name}</p>
                        <p className="text-[10px] text-gray-400">{m.metadata?.trigger_word}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}
            <button onClick={() => setStep(3)} disabled={modelMode === "trained" && !selectedModel && relevantModels.length > 0}
              className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 disabled:opacity-40 transition-colors">
              Next: Prompt →
            </button>
          </>
        )}

        {/* STEP 3: Prompt & Generate */}
        {step === 3 && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">✍️ Prompt</h3>
            <div className="flex gap-2 flex-wrap">
              {([["1:1","Square"],["9:16","Portrait"],["16:9","Landscape"],["4:5","Feed"]] as [string,string][]).map(([v,l]) => (
                <button key={v} onClick={() => setAspectRatio(v)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${aspectRatio === v ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-brand-400"}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([["random","🎲","Random"],["custom","✍️","Custom"],["task","📋","From Task"]] as [PromptSource,string,string][]).map(([id,icon,lbl]) => (
                <button key={id} onClick={() => setPromptSource(id)}
                  className={`py-2 rounded-xl border text-center text-xs font-semibold transition-colors ${promptSource === id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400" : "border-gray-200 dark:border-gray-700 text-gray-600 hover:border-brand-400"}`}>
                  <span className="block text-base mb-0.5">{icon}</span>{lbl}
                </button>
              ))}
            </div>

            {/* OpenAI smart prompt button (shown for random + custom) */}
            {(promptSource === "random" || promptSource === "custom") && (
              <div className="flex items-center gap-2">
                <SmartPromptBtn onClick={handleSmartPrompt} loading={smartLoading} />
                {promptSource === "random" && !customPrompt && (
                  <span className="text-[10px] text-gray-400">Click to generate AI prompt</span>
                )}
              </div>
            )}

            {(promptSource === "custom" || (promptSource === "random" && customPrompt)) && (
              <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs outline-none focus:border-brand-400 resize-none" />
            )}

            {promptSource === "task" && (
              <>
                <SmartPromptBtn onClick={handleSmartPrompt} loading={smartLoading} />
                {todayTasks.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">No tasks for today</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {todayTasks.map((t) => (
                      <button key={t.id} onClick={() => setSelectedTask(t)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${selectedTask?.id === t.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{t.title}</p>
                        {t.target_platforms && <p className="text-[10px] text-gray-400 mt-0.5">{t.target_platforms.join(", ")}</p>}
                      </button>
                    ))}
                  </div>
                )}
                {selectedTask && customPrompt && (
                  <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={2} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs outline-none resize-none" />
                )}
              </>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleGenerate} disabled={loading || atLimit}
              className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              {loading ? <><span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />Generating...</> : "✨ Generate Image"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERATE VIDEO WIZARD
// ══════════════════════════════════════════════════════════════════════════════
function GenerateVideoWizard({
  brandId, currentTier, videosUsedToday, trainedModels, historyImages, onResult, onUsed, onGenerateStart,
}: {
  brandId: string; currentTier: string; videosUsedToday: number;
  trainedModels: TrainedModel[]; historyImages: GeneratedImage[];
  onResult: (v: GeneratedVideo) => void; onUsed: () => void;
  onGenerateStart?: () => void;
}) {
  const limit = VIDEO_DAILY_LIMITS[currentTier] ?? 1;
  const maxDuration = VIDEO_MAX_DURATION[currentTier] ?? 8;
  const atLimit = videosUsedToday >= limit;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [subjectType, setSubjectType] = useState<SubjectType>("product");
  const [modelMode, setModelMode] = useState<ModelMode>("random");
  const [selectedModel, setSelectedModel] = useState<TrainedModel | null>(null);
  const [klingModel, setKlingModel] = useState("kling-v1");
  const [videoInputType, setVideoInputType] = useState<VideoInputType>("text");
  const [promptSource, setPromptSource] = useState<PromptSource>("custom");
  const [textPrompt, setTextPrompt] = useState("");
  const [selectedTask, setSelectedTask] = useState<TodayTask | null>(null);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState<GeneratedImage | null>(null);
  const [uploadedRefUrl, setUploadedRefUrl] = useState<string | null>(null);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [duration, setDuration] = useState(8);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [loading, setLoading] = useState(false);
  const [smartLoading, setSmartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const relevantModels = trainedModels.filter((m) =>
    m.training_status === "completed" && (subjectType === "both" || m.theme === subjectType)
  );

  useEffect(() => {
    if (promptSource !== "task") return;
    const today = new Date().toISOString().split("T")[0];
    supabase.from("gv_task_board")
      .select("id, title, description, target_platforms")
      .eq("brand_id", brandId).eq("due_date", today).neq("status", "completed").limit(10)
      .then(({ data }) => setTodayTasks(data ?? []));
  }, [promptSource, brandId]);

  const handleSmartPrompt = async () => {
    setSmartLoading(true);
    const topic = VIDEO_TOPICS.find((t) => t.id === selectedTopic);
    try {
      const res = await studioFetch({
        action: "generate_smart_prompt",
        brand_id: brandId,
        prompt_type: "video",
        subject_type: subjectType,
        model_name: selectedModel?.dataset_name ?? "",
        topic_style: topic?.label ?? "commercial video",
        task_context: selectedTask ? selectedTask.title : "",
      });
      if (res.success && res.prompt) {
        setTextPrompt(res.prompt);
        setPromptSource("custom");
      }
    } catch { /* ignore */ }
    setSmartLoading(false);
  };

  const handleRefUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingRef(true);
    try {
      const url = await uploadImage(files[0], brandId, "video-refs", `ref-${Date.now()}`);
      setUploadedRefUrl(url);
    } catch { setError("Reference upload failed"); }
    finally { setUploadingRef(false); }
  };

  const handleGenerate = async () => {
    if (!selectedTopic) { setError("Please select a topic style"); return; }
    if (atLimit) return;
    setLoading(true); setError(null);
    onGenerateStart?.();

    const topicLabel = VIDEO_TOPICS.find((t) => t.id === selectedTopic)?.label ?? selectedTopic;

    let prompt = "";
    if (videoInputType === "text") {
      if (textPrompt.trim()) {
        prompt = `${topicLabel}: ${textPrompt.trim()}`;
      } else if (selectedTask) {
        prompt = `${topicLabel} style: ${selectedTask.title}. ${selectedTask.description ?? ""}. Platform: ${selectedTask.target_platforms?.join(", ") ?? "social media"}.`;
      } else {
        const type = subjectType === "both" ? "product and character" : subjectType;
        prompt = `${topicLabel} video for ${type}${selectedModel ? ` — ${selectedModel.dataset_name}` : ""}. Engaging, professional, social media optimized.`;
      }
    } else {
      const imageUrl = selectedHistoryImage?.image_url ?? uploadedRefUrl;
      if (!imageUrl) { setError("Select or upload a reference image"); setLoading(false); return; }
      prompt = `${topicLabel} style video showcasing the ${subjectType} in this image. Dynamic movement, professional, ${aspectRatio === "9:16" ? "vertical" : "horizontal"} format.`;
    }

    try {
      const payload: Record<string, unknown> = {
        action: "generate_video", brand_id: brandId, prompt,
        duration, aspect_ratio: aspectRatio, model: klingModel, mode: "standard",
      };
      if (videoInputType === "image") {
        const imgUrl = selectedHistoryImage?.image_url ?? uploadedRefUrl;
        if (imgUrl) payload.image_url = imgUrl;
      }

      const res = await studioFetch(payload);
      if (res.success) {
        onResult({
          id: res.db_id ?? Date.now().toString(), hook: prompt,
          video_url: res.video_url, video_thumbnail_url: null,
          video_status: res.status ?? "processing", ai_model: klingModel,
          target_platform: "tiktok", video_aspect_ratio: aspectRatio,
          created_at: new Date().toISOString(),
        });
        onUsed();
        setStep(1); setTextPrompt(""); setSelectedTask(null); setSelectedTopic(null);
      } else { setError(res.error ?? "Generation failed"); }
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const SUBJECT_OPTS = [
    { id: "character" as SubjectType, icon: "👤", label: "Character Only",      desc: "Person or persona" },
    { id: "product"   as SubjectType, icon: "📦", label: "Product Only",        desc: "Item or product" },
    { id: "both"      as SubjectType, icon: "✨", label: "Character + Product", desc: "Combined scene" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <StepBar steps={["Subject", "Model", "Content", "Topic & Generate"]} current={step} />
      <div className="p-4 space-y-3">
        <DailyQuota used={videosUsedToday} limit={limit} label="Videos" />

        {atLimit && (
          <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-center">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">Daily limit reached ({limit} videos)</p>
            <p className="text-[10px] text-red-500 mt-0.5">Resets tomorrow at midnight. Upgrade for more.</p>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">🎬 What to feature?</h3>
            <div className="space-y-2">
              {SUBJECT_OPTS.map((opt) => (
                <button key={opt.id} onClick={() => { setSubjectType(opt.id); setStep(2); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-left transition-colors">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{opt.label}</p>
                    <p className="text-[10px] text-gray-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2: Model */}
        {step === 2 && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              🤖 Model — <span className="text-xs font-normal text-brand-600 dark:text-brand-400 capitalize">{subjectType === "both" ? "Char + Prod" : subjectType}</span>
            </h3>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Kling AI Version</label>
              <div className="grid grid-cols-2 gap-2">
                {[["kling-v1","Kling V1","Fast"],["kling-v1.5","Kling V1.5","Enhanced"],["kling-v2","Kling V2","Best quality"],["kling-v1-pro","Kling V1 Pro","Pro grade"]].map(([id,lbl,desc]) => (
                  <button key={id} onClick={() => setKlingModel(id)}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${klingModel === id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{lbl}</p>
                    <p className="text-[10px] text-gray-400">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["trained","random"] as ModelMode[]).map((mode) => (
                <button key={mode} onClick={() => setModelMode(mode)}
                  className={`p-3 rounded-xl border text-center transition-colors ${modelMode === mode ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                  <p className="text-xl">{mode === "trained" ? "🎓" : "🎲"}</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1 capitalize">{mode}</p>
                </button>
              ))}
            </div>
            {modelMode === "trained" && (
              relevantModels.length === 0 ? (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400">No completed {subjectType} models. Train one first!</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {relevantModels.map((m) => (
                    <button key={m.id} onClick={() => setSelectedModel(m)}
                      className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors ${selectedModel?.id === m.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                      <span className="text-lg">{m.theme === "character" ? "👤" : "📦"}</span>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{m.dataset_name}</p>
                    </button>
                  ))}
                </div>
              )
            )}
            <button onClick={() => setStep(3)} className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors">
              Next: Content →
            </button>
          </>
        )}

        {/* STEP 3: Content */}
        {step === 3 && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">📹 Content Source</h3>
            <div className="grid grid-cols-2 gap-2">
              {([["text","✍️","Text to Video","AI generates from prompt"],["image","🖼️","Image to Video","Animate an image"]] as [VideoInputType,string,string,string][]).map(([id,icon,lbl,desc]) => (
                <button key={id} onClick={() => setVideoInputType(id)}
                  className={`p-3 rounded-xl border text-center transition-colors ${videoInputType === id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                  <p className="text-xl">{icon}</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">{lbl}</p>
                  <p className="text-[10px] text-gray-400">{desc}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">Duration</span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{duration}s</span>
                </div>
                <input
                  type="range" min={1} max={maxDuration} value={Math.min(duration, maxDuration)}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-gray-400">1s</span>
                  <span className="text-[9px] text-gray-400">{maxDuration}s max</span>
                </div>
                {currentTier !== "partner" && <p className="text-[9px] text-gray-400 mt-0.5">{currentTier === "basic" ? "Upgrade for up to 25s" : "Partner: up to 25s"}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Aspect Ratio</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs outline-none">
                  <option value="9:16">9:16 Portrait (TikTok)</option>
                  <option value="16:9">16:9 Landscape (YouTube)</option>
                  <option value="1:1">1:1 Square</option>
                </select>
              </div>
            </div>

            {videoInputType === "text" && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {([["random","🎲","Random"],["custom","✍️","Custom"],["task","📋","From Task"]] as [PromptSource,string,string][]).map(([id,icon,lbl]) => (
                    <button key={id} onClick={() => setPromptSource(id)}
                      className={`py-2 rounded-xl border text-center text-xs font-semibold transition-colors ${promptSource === id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400" : "border-gray-200 dark:border-gray-700 text-gray-600 hover:border-brand-400"}`}>
                      <span className="block text-base mb-0.5">{icon}</span>{lbl}
                    </button>
                  ))}
                </div>
                {(promptSource === "random" || promptSource === "custom") && (
                  <SmartPromptBtn onClick={handleSmartPrompt} loading={smartLoading} />
                )}
                {(promptSource === "custom" || (promptSource === "random" && textPrompt)) && (
                  <textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="Describe the video scene..." rows={3}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs outline-none focus:border-brand-400 resize-none" />
                )}
                {promptSource === "task" && (
                  <>
                    <SmartPromptBtn onClick={handleSmartPrompt} loading={smartLoading} />
                    {todayTasks.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">No tasks for today</p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {todayTasks.map((t) => (
                          <button key={t.id} onClick={() => setSelectedTask(t)}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${selectedTask?.id === t.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{t.title}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {videoInputType === "image" && (
              <>
                {historyImages.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">From History</label>
                    <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto">
                      {historyImages.map((img) => (
                        <button key={img.id} onClick={() => { setSelectedHistoryImage(img); setUploadedRefUrl(null); }}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedHistoryImage?.id === img.id ? "border-brand-500" : "border-transparent hover:border-brand-300"}`}>
                          {img.image_url
                            ? <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><span className="text-xs text-gray-400">No img</span></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 cursor-pointer transition-colors">
                  {uploadedRefUrl
                    ? <img src={uploadedRefUrl} alt="ref" className="h-20 object-contain rounded" />
                    : <><span className="text-2xl">{uploadingRef ? "⏳" : "📎"}</span><p className="text-xs text-gray-400">{uploadingRef ? "Uploading..." : "Upload reference image"}</p></>}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleRefUpload(e.target.files)} disabled={uploadingRef} />
                </label>
              </>
            )}

            <button onClick={() => setStep(4)} className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors">
              Next: Topic Style →
            </button>
          </>
        )}

        {/* STEP 4: Topic & Generate */}
        {step === 4 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">🎯 Topic Style</h3>
              <SmartPromptBtn onClick={handleSmartPrompt} loading={smartLoading} />
            </div>
            <div className="space-y-1.5">
              {VIDEO_TOPICS.map((t) => (
                <button key={t.id} onClick={() => setSelectedTopic(t.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors ${selectedTopic === t.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 hover:border-brand-400"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t.label}</p>
                    <p className="text-[10px] text-gray-400">{t.desc}</p>
                  </div>
                  {selectedTopic === t.id && <span className="text-brand-500 flex-shrink-0 text-sm">●</span>}
                </button>
              ))}
            </div>

            {textPrompt && (
              <div className="rounded-lg bg-purple-50 dark:bg-purple-500/10 p-2">
                <p className="text-[10px] text-purple-500 font-semibold mb-0.5">✨ OpenAI Prompt</p>
                <p className="text-[10px] text-purple-700 dark:text-purple-300 line-clamp-2">{textPrompt}</p>
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleGenerate} disabled={loading || atLimit || !selectedTopic}
              className="w-full py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
              {loading ? <><span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />Generating Video...</> : "🎬 Generate Video"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HISTORY CENTER
// ══════════════════════════════════════════════════════════════════════════════
function HistoryCenter({ brandId, onSelectImage, onSelectVideo }: {
  brandId: string;
  onSelectImage: (img: GeneratedImage) => void;
  onSelectVideo: (vid: GeneratedVideo) => void;
}) {
  const [tab, setTab] = useState<"images" | "videos" | "models">("images");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [models, setModels] = useState<TrainedModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    studioFetch({ action: "get_history", brand_id: brandId, type: "all", limit: 24 })
      .then((r) => { if (r.success) { setImages(r.images ?? []); setVideos(r.videos ?? []); setModels(r.trainings ?? []); } })
      .finally(() => setLoading(false));
  }, [brandId]);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        {(["images", "videos", "models"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${tab === t ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "images" ? `🖼️ Images (${images.length})` : t === "videos" ? `🎬 Videos (${videos.length})` : `🤖 Models (${models.length})`}
          </button>
        ))}
      </div>
      <div className="p-4">
        {loading && <div className="text-center py-8"><div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" /></div>}
        {!loading && tab === "images" && (
          images.length === 0 ? <p className="text-center text-xs text-gray-400 py-8">No generated images yet</p> : (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <button key={img.id} onClick={() => onSelectImage(img)}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 hover:ring-2 ring-brand-500 transition-all">
                  {img.image_url
                    ? <img src={img.image_url} alt={img.prompt_text} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">{img.status === "processing" ? "⏳" : "❌"}</div>}
                </button>
              ))}
            </div>
          )
        )}
        {!loading && tab === "videos" && (
          videos.length === 0 ? <p className="text-center text-xs text-gray-400 py-8">No generated videos yet</p> : (
            <div className="space-y-2">
              {videos.map((vid) => (
                <button key={vid.id} onClick={() => onSelectVideo(vid)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-400 text-left transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    {vid.video_thumbnail_url ? <img src={vid.video_thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-lg">🎬</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{vid.hook}</p>
                    <p className="text-[10px] text-gray-400">{vid.ai_model} · {vid.video_aspect_ratio} · {vid.video_status}</p>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
        {!loading && tab === "models" && (
          models.length === 0 ? <p className="text-center text-xs text-gray-400 py-8">No trained models yet</p> : (
            <div className="space-y-2">
              {models.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-2xl">{m.theme === "character" ? "👤" : "📦"}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{m.dataset_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium ${m.training_status === "completed" ? "text-green-600" : "text-amber-600"}`}>{m.training_status}</span>
                      <span className="text-[10px] text-gray-400">· {m.image_count} images</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL PANEL (Right Column)
// ══════════════════════════════════════════════════════════════════════════════
const TOPIC_SOUNDS: Record<string, string[]> = {
  podcast:        ["Lo-fi beats", "Ambient chill", "Soft instrumental"],
  product_review: ["Upbeat pop", "Corporate upbeat", "Energetic positive"],
  edu_product:    ["Calm background", "Tutorial music", "Focus beats"],
  new_product:    ["Exciting reveal", "Hype beat", "Countdown music"],
  soft_selling:   ["Chill lifestyle", "Indie acoustic", "Morning vibes"],
  lifestyle:      ["Trendy pop", "Aesthetic lo-fi", "Summer vibes"],
  advertorial:    ["Viral trend audio", "TikTok trending sound", "Catchy hook"],
};

function DetailPanel({ item, brandId }: { item: DetailItem; brandId: string }) {
  const [feedback, setFeedback] = useState<"liked" | "disliked" | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Restore feedback state from DB when item changes (handles history items)
  useEffect(() => {
    if (!item || item.type === "model") {
      setFeedback(null);
      setFeedbackSubmitted(false);
      setFeedbackLoading(false);
      return;
    }
    const existing = (item.data as GeneratedImage & GeneratedVideo).feedback;
    if (existing === "liked" || existing === "disliked") {
      setFeedback(existing);
      setFeedbackSubmitted(true);
    } else {
      setFeedback(null);
      setFeedbackSubmitted(false);
    }
    setFeedbackLoading(false);
  }, [item?.data?.id, item?.type]);

  const submitFeedback = async (type: "liked" | "disliked") => {
    if (!item || item.type === "model" || feedbackLoading || feedbackSubmitted) return;
    setFeedback(type);
    setFeedbackLoading(true);
    try {
      await studioFetch({
        action: "submit_feedback",
        brand_id: brandId,
        db_id: item.data.id,
        content_type: item.type,
        feedback: type,
      });
      setFeedbackSubmitted(true);
    } catch (e) {
      console.error("Feedback submit error:", e);
      setFeedback(null);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const FeedbackSection = () => (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
      <p className="text-[10px] font-semibold text-gray-500 mb-2">🧠 TRAIN THE AI — Rate this result</p>
      {feedbackSubmitted ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-500/10 px-3 py-2">
          <span className="text-base">{feedback === "liked" ? "👍" : "👎"}</span>
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
            Thanks! AI is learning from your feedback.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => submitFeedback("liked")}
              disabled={feedbackLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                feedback === "liked"
                  ? "border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-600"
              } disabled:opacity-50`}
            >
              {feedbackLoading && feedback === "liked"
                ? <span className="w-3 h-3 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
                : "👍"
              }
              <span>Like</span>
            </button>
            <button
              onClick={() => submitFeedback("disliked")}
              disabled={feedbackLoading}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                feedback === "disliked"
                  ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-600"
              } disabled:opacity-50`}
            >
              {feedbackLoading && feedback === "disliked"
                ? <span className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                : "👎"
              }
              <span>Dislike</span>
            </button>
          </div>
          <p className="text-[9px] text-gray-400 mt-1.5 text-center">
            Your ratings train the AI to generate better content for your brand
          </p>
        </>
      )}
    </div>
  );

  if (!item) {
    return (
      <div className="h-full min-h-64 flex flex-col items-center justify-center gap-3 text-center px-6 py-12">
        <span className="text-5xl opacity-20">✨</span>
        <p className="text-sm font-semibold text-gray-400" style={{ fontFamily: "Georgia, serif" }}>Select a result</p>
        <p className="text-xs text-gray-400">Generate images, videos or train models — click any result to see details here.</p>
      </div>
    );
  }

  if (item.type === "image") {
    const img = item.data;
    return (
      <div className="space-y-3">
        <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
          {img.image_url
            ? <img src={img.image_url} alt={img.prompt_text} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-4xl">{img.status === "processing" ? "⏳" : "🖼️"}</div>}
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${["completed","succeeded"].includes(img.status) ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>{img.status}</span>
            {img.ai_model && <span className="text-[10px] text-gray-400">{img.ai_model}</span>}
            {img.style_preset && <span className="text-[10px] bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">LoRA: {img.style_preset}</span>}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1">PROMPT</p>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">{img.prompt_text}</p>
          </div>
          {img.image_url && (
            <a href={img.image_url} target="_blank" rel="noopener noreferrer"
              className="block w-full text-center py-2 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors">
              ↓ Download Image
            </a>
          )}
        </div>
        <FeedbackSection />
      </div>
    );
  }

  if (item.type === "video") {
    const vid = item.data;
    const topicKey = Object.keys(TOPIC_SOUNDS).find((k) => vid.hook?.toLowerCase().includes(k)) ?? "lifestyle";
    const sounds = TOPIC_SOUNDS[topicKey] ?? TOPIC_SOUNDS.lifestyle;
    return (
      <div className="space-y-3">
        <div className="rounded-xl overflow-hidden bg-gray-900 aspect-video">
          {vid.video_url
            ? <video src={vid.video_url} controls className="w-full h-full" poster={vid.video_thumbnail_url ?? undefined} />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><span className="text-4xl animate-pulse">⏳</span><p className="text-xs text-gray-400">{vid.video_status ?? "Processing..."}</p></div>}
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 space-y-2.5">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${vid.video_status === "completed" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>{vid.video_status ?? "processing"}</span>
            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">{vid.ai_model}</span>
            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">{vid.video_aspect_ratio}</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1">PROMPT</p>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">{vid.hook}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1.5">🎵 RECOMMENDED SOUNDS</p>
            <div className="space-y-1">
              {sounds.map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-brand-500 text-sm">♪</span> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
        <FeedbackSection />
      </div>
    );
  }

  if (item.type === "model") {
    const m = item.data;
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{m.theme === "character" ? "👤" : "📦"}</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>{m.dataset_name}</h3>
            <p className="text-xs text-gray-400 capitalize">{m.theme} model · {m.image_count} images</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between"><span className="text-[10px] text-gray-400">Status</span><span className={`text-[10px] font-semibold ${m.training_status === "completed" ? "text-green-600" : "text-amber-600"}`}>{m.training_status}</span></div>
          {m.metadata?.trigger_word && <div className="flex justify-between"><span className="text-[10px] text-gray-400">Trigger Word</span><span className="text-[10px] font-mono text-brand-600 dark:text-brand-400">{m.metadata.trigger_word}</span></div>}
          {m.image_count && <div className="flex justify-between"><span className="text-[10px] text-gray-400">Training Images</span><span className="text-[10px] text-gray-600 dark:text-gray-400">{m.image_count}</span></div>}
        </div>
        {m.training_status === "completed" && (
          <div className="rounded-lg bg-green-50 dark:bg-green-500/10 p-3">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">✅ Ready to Use</p>
            <p className="text-[10px] text-green-600 dark:text-green-500">Select this model in Generate Image or Video → choose "Trained" mode.</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// BOTTOM FLOATING STUDIO TAB — same pill style as NavColumn
// ══════════════════════════════════════════════════════════════════════════════
const ImageTabIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const VideoTabIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);
const ProductTabIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const CharTabIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const STUDIO_TABS: { id: StudioSection; icon: React.ReactNode; label: string }[] = [
  { id: "generate_image",  icon: <ImageTabIcon />,   label: "Image" },
  { id: "generate_video",  icon: <VideoTabIcon />,   label: "Video" },
  { id: "train_product",   icon: <ProductTabIcon />, label: "Product" },
  { id: "train_character", icon: <CharTabIcon />,    label: "Character" },
];

function BottomStudioTab({ active, onSelect }: { active: StudioSection; onSelect: (s: StudioSection) => void }) {
  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-[48px] border border-white/60 overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(31,36,40,0.06)",
      }}
    >
      <div className="flex items-center px-3 py-2 gap-1">
        {STUDIO_TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={[
                "flex items-center gap-2 h-10 px-4 rounded-[36px] transition-all duration-200",
                isActive
                  ? "bg-[#EDF5F4] text-[#5F8F8B]"
                  : "text-[#4A545B] hover:bg-[#F3F4F6] hover:text-[#1F2428]",
              ].join(" ")}
              style={isActive ? {
                border: "1px solid rgba(95,143,139,0.3)",
                boxShadow: "0 0 0 3px rgba(95,143,139,0.10)",
              } : {}}
            >
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {tab.icon}
              </span>
              <span className="text-[13px] font-[550] whitespace-nowrap leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HISTORY RIGHT PANEL — right column showing generated images & videos
// ══════════════════════════════════════════════════════════════════════════════
function HistoryRight({ brandId, historyKey, onSelect }: {
  brandId: string;
  historyKey: number;
  onSelect: (item: DetailItem) => void;
}) {
  const [tab, setTab] = useState<"images" | "videos" | "models">("images");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [models, setModels] = useState<TrainedModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    studioFetch({ action: "get_history", brand_id: brandId, type: "all", limit: 30 })
      .then((r) => {
        if (r.success) {
          setImages(r.images ?? []);
          setVideos(r.videos ?? []);
          setModels(r.trainings ?? []);
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, historyKey]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-[#F3F4F6]">
        <h3 className="text-[16px] font-bold text-[#1F2428]" style={{ fontFamily: "Georgia, serif" }}>
          History
        </h3>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">Generated images, videos & models</p>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-[#F3F4F6]">
        {(["images", "videos", "models"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors ${
              tab === t
                ? "text-[#5F8F8B] border-b-2 border-[#5F8F8B]"
                : "text-[#9CA3AF] hover:text-[#4A545B]"
            }`}
          >
            {t === "images" ? `🖼️ ${images.length}` : t === "videos" ? `🎬 ${videos.length}` : `🤖 ${models.length}`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 rounded-full border-2 border-[#5F8F8B] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Images grid */}
        {!loading && tab === "images" && (
          images.length === 0
            ? <p className="text-center text-[12px] text-[#9CA3AF] py-8">No generated images yet</p>
            : (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => onSelect({ type: "image", data: img })}
                    className="aspect-square rounded-[12px] overflow-hidden bg-[#F3F4F6] hover:ring-2 ring-[#5F8F8B] transition-all"
                  >
                    {img.image_url
                      ? <img src={img.image_url} alt={img.prompt_text} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">{img.status === "processing" ? "⏳" : "❌"}</div>}
                  </button>
                ))}
              </div>
            )
        )}

        {/* Videos list */}
        {!loading && tab === "videos" && (
          videos.length === 0
            ? <p className="text-center text-[12px] text-[#9CA3AF] py-8">No generated videos yet</p>
            : (
              <div className="space-y-2">
                {videos.map((vid) => (
                  <button
                    key={vid.id}
                    onClick={() => onSelect({ type: "video", data: vid })}
                    className="w-full flex items-center gap-3 p-3 rounded-[12px] border border-[#E5E7EB] hover:border-[#5F8F8B] text-left transition-colors"
                    style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                      {vid.video_thumbnail_url
                        ? <img src={vid.video_thumbnail_url} alt="" className="w-full h-full object-cover rounded-[10px]" />
                        : <span className="text-base">🎬</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[#1F2428] truncate">{vid.hook}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">{vid.ai_model} · {vid.video_aspect_ratio} · {vid.video_status}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
        )}

        {/* Models list */}
        {!loading && tab === "models" && (
          models.length === 0
            ? <p className="text-center text-[12px] text-[#9CA3AF] py-8">No trained models yet</p>
            : (
              <div className="space-y-2">
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onSelect({ type: "model", data: m })}
                    className="w-full flex items-center gap-3 p-3 rounded-[12px] border border-[#E5E7EB] hover:border-[#5F8F8B] text-left transition-colors"
                    style={{ boxShadow: "0 1px 4px rgba(31,36,40,0.04)" }}
                  >
                    <span className="text-xl">{m.theme === "character" ? "👤" : "📦"}</span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[#1F2428] truncate">{m.dataset_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium ${m.training_status === "completed" ? "text-[#16a34a]" : "text-[#d97706]"}`}>{m.training_status}</span>
                        <span className="text-[10px] text-[#9CA3AF]">· {m.image_count} images</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function ContentStudioPage() {
  const [brandId, setBrandId] = useState(FALLBACK_BRAND_ID);
  const [currentTier, setCurrentTier] = useState("basic");
  const [activeSection, setActiveSection] = useState<StudioSection>("generate_image");
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([]);
  const [historyImages, setHistoryImages] = useState<GeneratedImage[]>([]);
  const [imagesUsedToday, setImagesUsedToday] = useState(0);
  const [videosUsedToday, setVideosUsedToday] = useState(0);
  const [detailItem, setDetailItem] = useState<DetailItem>(null);
  const [showGeneratingPopup, setShowGeneratingPopup] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  // Auth + brand
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: ub } = await supabase.from("user_brands").select("brand_id").eq("user_id", user.id).limit(1).single();
      if (ub?.brand_id) setBrandId(ub.brand_id);
    });
  }, []);

  // Subscription tier
  useEffect(() => {
    if (!brandId) return;
    fetch("/api/payment", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_subscription", brand_id: brandId }),
    }).then((r) => r.json()).then((d) => { if (d?.subscription?.plan) setCurrentTier(d.subscription.plan); });
  }, [brandId]);

  // Daily usage
  const refreshUsage = useCallback(() => {
    if (!brandId) return;
    studioFetch({ action: "check_daily_usage", brand_id: brandId })
      .then((r) => { if (r.success) { setImagesUsedToday(r.images_today ?? 0); setVideosUsedToday(r.videos_today ?? 0); } })
      .catch(() => { /* quota display fails silently — non-critical */ });
  }, [brandId]);

  useEffect(() => { refreshUsage(); }, [refreshUsage]);

  // Trained models
  useEffect(() => {
    if (!brandId) return;
    studioFetch({ action: "get_history", brand_id: brandId, type: "training", limit: 50 })
      .then((r) => { if (r.success) setTrainedModels(r.trainings ?? []); })
      .catch(() => { /* non-critical */ });
  }, [brandId]);

  // History images (for video reference)
  useEffect(() => {
    if (!brandId) return;
    studioFetch({ action: "get_history", brand_id: brandId, type: "image", limit: 20 })
      .then((r) => { if (r.success) setHistoryImages(r.images ?? []); })
      .catch(() => { /* non-critical */ });
  }, [brandId]);

  const completedModels = trainedModels.filter((m) => m.training_status === "completed");
  const totalModelCount = trainedModels.length;

  const handleGenerateStart = () => setShowGeneratingPopup(true);

  const wizardContent = () => {
    switch (activeSection) {
      case "generate_image":
        return (
          <GenerateImageWizard
            brandId={brandId} currentTier={currentTier} imagesUsedToday={imagesUsedToday}
            trainedModels={completedModels}
            onResult={(img) => { setHistoryImages((p) => [img, ...p]); setHistoryKey((k) => k + 1); }}
            onUsed={() => setImagesUsedToday((c) => c + 1)}
            onGenerateStart={handleGenerateStart}
          />
        );
      case "generate_video":
        return (
          <GenerateVideoWizard
            brandId={brandId} currentTier={currentTier} videosUsedToday={videosUsedToday}
            trainedModels={completedModels} historyImages={historyImages}
            onResult={() => setHistoryKey((k) => k + 1)}
            onUsed={() => setVideosUsedToday((c) => c + 1)}
            onGenerateStart={handleGenerateStart}
          />
        );
      case "train_product":
        return (
          <TrainingWizard
            brandId={brandId} trainingType="product" currentTier={currentTier} totalModelCount={totalModelCount}
            pastDatasets={trainedModels}
            onDone={(m) => { setTrainedModels((p) => [...p, m]); setHistoryKey((k) => k + 1); }}
          />
        );
      case "train_character":
        return (
          <TrainingWizard
            brandId={brandId} trainingType="character" currentTier={currentTier} totalModelCount={totalModelCount}
            pastDatasets={trainedModels}
            onDone={(m) => { setTrainedModels((p) => [...p, m]); setHistoryKey((k) => k + 1); }}
          />
        );
      default:
        return null;
    }
  };

  /* ── Active tab label for center header ── */
  const activeTabLabel = STUDIO_TABS.find((t) => t.id === activeSection)?.label ?? "Studio";

  return (
    <>
      <ThreeColumnLayout
        left={<NavColumn />}
        center={
          <div className="h-full flex flex-col overflow-hidden">
            {detailItem ? (
              /* ── DETAIL VIEW ── */
              <>
                {/* Back bar */}
                <div
                  className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b border-[#F3F4F6]"
                >
                  <button
                    onClick={() => setDetailItem(null)}
                    className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
                    style={{ color: "var(--gv-color-primary-500, #5F8F8B)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to {activeTabLabel}
                  </button>
                </div>
                {/* Detail content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24">
                  <DetailPanel item={detailItem} brandId={brandId} />
                </div>
              </>
            ) : (
              /* ── WIZARD VIEW ── */
              <>
                {/* Header */}
                <div className="flex-shrink-0 px-5 py-4 border-b border-[#F3F4F6]">
                  <h3
                    className="text-[16px] font-bold text-[#1F2428]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {activeTabLabel} {activeSection === "generate_image" ? "Generation" : activeSection === "generate_video" ? "Generation" : "Training"}
                  </h3>
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                    {activeSection === "generate_image" && "Powered by KIE Flux AI"}
                    {activeSection === "generate_video" && "Powered by KIE Kling AI"}
                    {activeSection === "train_product" && "LoRA model training — 4-side product upload"}
                    {activeSection === "train_character" && "LoRA model training — persona character"}
                  </p>
                </div>
                {/* Wizard scrollable content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24">
                  {wizardContent()}
                </div>
              </>
            )}
          </div>
        }
        right={
          <HistoryRight
            brandId={brandId}
            historyKey={historyKey}
            onSelect={(item) => setDetailItem(item)}
          />
        }
      />

      {/* Generating popup */}
      {showGeneratingPopup && <GeneratingPopup onClose={() => setShowGeneratingPopup(false)} />}

      {/* Bottom floating studio tab bar — same pill style as NavColumn */}
      <BottomStudioTab active={activeSection} onSelect={(s) => { setActiveSection(s); setDetailItem(null); }} />
    </>
  );
}
