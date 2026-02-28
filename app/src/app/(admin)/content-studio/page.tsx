"use client";
import { useState, useEffect, useRef } from "react";
import ThreeColumnLayout from "@/components/shared/ThreeColumnLayout";
import NavColumn from "@/components/shared/NavColumn";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const FALLBACK_BRAND_ID =
  process.env.NEXT_PUBLIC_DEMO_BRAND_ID || "a37dee82-5ed5-4ba4-991a-4d93dde9ff7a";

// ── Types ─────────────────────────────────────────────────────────────────────
type StudioSection = "generate_image" | "generate_video" | "train_product" | "train_character" | "history";

interface TrainedModel {
  id: string;
  dataset_name: string;
  theme: string;
  image_count: number;
  training_status: string;
  model_path: string | null;
  metadata: { trigger_word?: string; kie_training_id?: string } | null;
  created_at: string;
}
interface GeneratedImage {
  id: string;
  prompt_text: string;
  image_url: string | null;
  thumbnail_url: string | null;
  status: string;
  ai_model: string | null;
  target_platform: string | null;
  style_preset: string | null;
  created_at: string;
}
interface GeneratedVideo {
  id: string;
  hook: string;
  video_url: string | null;
  video_thumbnail_url: string | null;
  video_status: string | null;
  ai_model: string | null;
  target_platform: string | null;
  video_aspect_ratio: string | null;
  created_at: string;
}

// ── API helper ────────────────────────────────────────────────────────────────
async function studioFetch(payload: Record<string, unknown>) {
  const res = await fetch("/api/content-studio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ── Section icons & labels ────────────────────────────────────────────────────
const SECTIONS: { id: StudioSection; icon: string; label: string; sub: string }[] = [
  { id: "generate_image", icon: "🖼️",  label: "Generate Image",     sub: "KIE · Text to Image" },
  { id: "generate_video", icon: "🎬",  label: "Generate Video",     sub: "KIE · Kling AI" },
  { id: "train_product",  icon: "🏭",  label: "Product Training",   sub: "LoRA · product model" },
  { id: "train_character",icon: "👤",  label: "Character Training", sub: "LoRA · persona model" },
  { id: "history",        icon: "📋",  label: "History",            sub: "All generations" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LEFT COLUMN — Studio navigation
// ═══════════════════════════════════════════════════════════════════════════════
function StudioNav({
  active, onSelect,
}: { active: StudioSection; onSelect: (s: StudioSection) => void }) {
  return (
    <NavColumn>
      <div className="px-1">
        <div className="mb-4">
          <h2
            className="text-base font-semibold text-gray-900 dark:text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Content Studio
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">Powered by KIE API</p>
        </div>

        <ul className="space-y-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  active === s.id
                    ? "bg-brand-50 dark:bg-brand-500/10"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${
                    active === s.id
                      ? "text-brand-700 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {s.label}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{s.sub}</p>
                </div>
                {active === s.id && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* KIE API badge */}
        <div className="mt-6 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </span>
            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">KIE API Connected</span>
          </div>
          <p className="text-[10px] text-gray-400">
            Flux · Kling V1 · LoRA Training
          </p>
        </div>
      </div>
    </NavColumn>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CENTER — Generate Image
// ═══════════════════════════════════════════════════════════════════════════════
function GenerateImageCenter({
  brandId, trainedModels, onResult,
}: {
  brandId: string;
  trainedModels: TrainedModel[];
  onResult: (img: GeneratedImage) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loraModel, setLoraModel] = useState("");
  const [model, setModel] = useState("kie-flux");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);

  // Load recent images
  useEffect(() => {
    studioFetch({ action: "get_history", brand_id: brandId, type: "image", limit: 8 })
      .then((r) => { if (r.success) setRecentImages(r.images ?? []); });
  }, [brandId]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await studioFetch({
        action: "generate_image",
        brand_id: brandId,
        prompt: prompt.trim(),
        negative_prompt: negative,
        aspect_ratio: aspectRatio,
        model,
        lora_model: loraModel || undefined,
      });
      if (res.success) {
        const newImg: GeneratedImage = {
          id: res.db_id ?? Date.now().toString(),
          prompt_text: prompt,
          image_url: res.image_url,
          thumbnail_url: res.image_url,
          status: res.status ?? "completed",
          ai_model: model,
          target_platform: null,
          style_preset: loraModel || null,
          created_at: new Date().toISOString(),
        };
        setRecentImages((prev) => [newImg, ...prev.slice(0, 7)]);
        onResult(newImg);
        setPrompt("");
      } else {
        setError(res.error ?? "Generation failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const productModels = trainedModels.filter((m) => m.theme === "product" && m.training_status === "completed");
  const charModels = trainedModels.filter((m) => m.theme === "character" && m.training_status === "completed");
  const allModels = [...productModels, ...charModels];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
          🖼️ Generate Image
        </h3>

        {/* Prompt */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A premium lifestyle shot of the product on a white marble surface, golden hour lighting..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-brand-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Negative Prompt</label>
            <input
              value={negative}
              onChange={(e) => setNegative(e.target.value)}
              placeholder="blur, low quality, watermark..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-brand-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              >
                <option value="1:1">1:1 Square (Instagram)</option>
                <option value="9:16">9:16 Portrait (Story/Reel)</option>
                <option value="16:9">16:9 Landscape (YouTube)</option>
                <option value="4:5">4:5 Portrait (Instagram Feed)</option>
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              >
                <option value="kie-flux">KIE Flux (Recommended)</option>
                <option value="kie-sd3">KIE SD3</option>
                <option value="kie-xl">KIE XL</option>
              </select>
            </div>
          </div>

          {/* LoRA Model */}
          {allModels.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                LoRA Model (Optional)
              </label>
              <select
                value={loraModel}
                onChange={(e) => setLoraModel(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              >
                <option value="">None — base model only</option>
                {productModels.map((m) => (
                  <option key={m.id} value={m.metadata?.kie_training_id ?? m.id}>
                    🏭 {m.dataset_name} (trigger: {m.metadata?.trigger_word})
                  </option>
                ))}
                {charModels.map((m) => (
                  <option key={m.id} value={m.metadata?.kie_training_id ?? m.id}>
                    👤 {m.dataset_name} (trigger: {m.metadata?.trigger_word})
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          )}

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating…
              </span>
            ) : "✨ Generate Image"}
          </button>
        </div>
      </div>

      {/* Recent images grid */}
      {recentImages.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">Recent</h4>
          <div className="grid grid-cols-4 gap-2">
            {recentImages.map((img) => (
              <button
                key={img.id}
                onClick={() => onResult(img)}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 hover:ring-2 ring-brand-400 transition-all"
              >
                {img.image_url ? (
                  <Image src={img.image_url} alt={img.prompt_text} width={100} height={100} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🖼️</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CENTER — Generate Video
// ═══════════════════════════════════════════════════════════════════════════════
function GenerateVideoCenter({
  brandId, onResult,
}: {
  brandId: string;
  onResult: (v: GeneratedVideo) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [model, setModel] = useState("kling-v1");
  const [mode, setMode] = useState("standard");
  const [platform, setPlatform] = useState("tiktok");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<GeneratedVideo[]>([]);

  useEffect(() => {
    studioFetch({ action: "get_history", brand_id: brandId, type: "video", limit: 6 })
      .then((r) => { if (r.success) setRecent(r.videos ?? []); });
  }, [brandId]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await studioFetch({
        action: "generate_video",
        brand_id: brandId,
        prompt: prompt.trim(),
        duration,
        aspect_ratio: aspectRatio,
        model,
        mode,
        platform,
        image_url: imageUrl.trim() || undefined,
      });
      if (res.success) {
        const newVid: GeneratedVideo = {
          id: res.db_id ?? Date.now().toString(),
          hook: prompt,
          video_url: res.video_url,
          video_thumbnail_url: null,
          video_status: res.status ?? "processing",
          ai_model: model,
          target_platform: platform,
          video_aspect_ratio: aspectRatio,
          created_at: new Date().toISOString(),
        };
        setRecent((prev) => [newVid, ...prev.slice(0, 5)]);
        onResult(newVid);
        setPrompt("");
      } else {
        setError(res.error ?? "Generation failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
          🎬 Generate Video
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Product floating on water with dramatic slow-motion waves, cinematic lighting..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-brand-400 resize-none"
            />
          </div>

          {/* Image-to-video */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
              Reference Image URL <span className="text-gray-400 font-normal">(optional — image-to-video)</span>
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (paste generated image URL)"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-brand-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Model */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              >
                <option value="kling-v1">Kling V1</option>
                <option value="kling-v1.5">Kling V1.5</option>
                <option value="kling-v2">Kling V2</option>
              </select>
            </div>
            {/* Mode */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              >
                <option value="standard">Standard</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            {/* Duration */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              >
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
              </select>
            </div>
            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              >
                <option value="9:16">9:16 TikTok/Reel</option>
                <option value="16:9">16:9 YouTube</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Target Platform</label>
            <div className="flex gap-2">
              {["tiktok","instagram","youtube","linkedin"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    platform === p
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {p === "tiktok" ? "🎵" : p === "instagram" ? "📸" : p === "youtube" ? "🎬" : "💼"} {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating…
              </span>
            ) : "🎬 Generate Video"}
          </button>
        </div>
      </div>

      {/* Recent videos */}
      {recent.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">Recent</h4>
          <div className="space-y-2">
            {recent.map((v) => (
              <button
                key={v.id}
                onClick={() => onResult(v)}
                className="w-full flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-lg overflow-hidden">
                  {v.video_thumbnail_url ? (
                    <Image src={v.video_thumbnail_url} alt="thumb" width={40} height={40} className="w-full h-full object-cover rounded-lg" />
                  ) : "🎬"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{v.hook}</p>
                  <p className="text-[10px] text-gray-400">{v.target_platform} · {v.video_aspect_ratio} · {v.video_status}</p>
                </div>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  v.video_status === "completed" ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400" :
                  "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                }`}>
                  {v.video_status === "completed" ? "Done" : "Processing"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Training limits per tier (total product + character combined)
const TRAINING_LIMITS: Record<string, number> = { basic: 5, premium: 10, partner: 15 };

// ═══════════════════════════════════════════════════════════════════════════════
// CENTER — Training (Product / Character)
// ═══════════════════════════════════════════════════════════════════════════════
function TrainingCenter({
  brandId,
  type,
  onModelReady,
  currentTier,
  totalModelCount,
}: {
  brandId: string;
  type: "product" | "character";
  onModelReady: (model: TrainedModel) => void;
  currentTier: "basic" | "premium" | "partner";
  totalModelCount: number;
}) {
  const limit = TRAINING_LIMITS[currentTier] ?? 5;
  const limitReached = totalModelCount >= limit;
  const [name, setName] = useState("");
  const [triggerWord, setTriggerWord] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [steps, setSteps] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<TrainedModel[]>([]);
  const [polling, setPolling] = useState<{ id: string; dbId: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadModels = async () => {
    const res = await studioFetch({ action: "get_history", brand_id: brandId, type: "training", limit: 20 });
    if (res.success) {
      setModels((res.trainings as TrainedModel[]).filter((m) => m.theme === type));
    }
  };

  useEffect(() => { loadModels(); }, [brandId, type]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll training status
  useEffect(() => {
    if (!polling) return;
    const poll = async () => {
      const res = await studioFetch({
        action: "check_training",
        brand_id: brandId,
        training_id: polling.id,
      });
      if (res.status === "completed" || res.status === "succeeded") {
        setPolling(null);
        loadModels();
      } else {
        pollRef.current = setTimeout(poll, 10000);
      }
    };
    poll();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [polling]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTraining = async () => {
    if (limitReached) {
      setError(`You've reached the ${limit}-model limit for the ${currentTier} plan. Upgrade to train more models.`);
      return;
    }
    const urls = imageUrls.split("\n").map((u) => u.trim()).filter(Boolean);
    if (!name.trim() || urls.length < 5) {
      setError("Name required and at least 5 image URLs needed");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await studioFetch({
        action: type === "product" ? "train_product" : "train_character",
        brand_id: brandId,
        name: name.trim(),
        trigger_word: triggerWord.trim() || name.trim().toLowerCase().replace(/\s+/g, "_"),
        image_urls: urls,
        steps,
      });
      if (res.success) {
        setPolling({ id: res.training_id, dbId: res.db_id ?? "" });
        setName("");
        setTriggerWord("");
        setImageUrls("");
        loadModels();
      } else {
        setError(res.error ?? "Training failed to start");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const icon = type === "product" ? "🏭" : "👤";
  const label = type === "product" ? "Product" : "Character";

  return (
    <div className="space-y-4">
      {/* Training form */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
          {icon} {label} Training
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Upload {type === "product" ? "product" : "character"} images to create a custom LoRA model via KIE API.
          Min. 10 images recommended for best results.
        </p>

        {/* Tier limit banner */}
        <div className={`rounded-lg px-3 py-2 mb-4 flex items-center justify-between ${
          limitReached
            ? "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"
            : "bg-gray-50 dark:bg-gray-800/60"
        }`}>
          <div>
            <p className={`text-[10px] font-semibold ${limitReached ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
              {limitReached ? "⚠️ Training limit reached" : `Training quota`}
            </p>
            <p className="text-[10px] text-gray-400">
              {totalModelCount} / {limit} models used · {currentTier} plan
            </p>
          </div>
          {limitReached && (
            <span className="text-[9px] font-semibold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
              Upgrade
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Model Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "product" ? "My Product v1" : "Brand Character v1"}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
              Trigger Word <span className="text-gray-400 font-normal">(use in prompts to apply model)</span>
            </label>
            <input
              value={triggerWord}
              onChange={(e) => setTriggerWord(e.target.value)}
              placeholder={type === "product" ? "myproduct" : "mycharacter"}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
              Image URLs <span className="text-gray-400 font-normal">(one per line, min. 5)</span>
            </label>
            <textarea
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder={"https://cdn.example.com/product-angle-1.jpg\nhttps://cdn.example.com/product-angle-2.jpg\n..."}
              rows={5}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-brand-400 resize-none font-mono"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {imageUrls.split("\n").filter((u) => u.trim()).length} URLs entered
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Training Steps</label>
            <select
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
            >
              <option value={500}>500 steps — Fast</option>
              <option value={1000}>1000 steps — Balanced (Recommended)</option>
              <option value={2000}>2000 steps — High Quality</option>
            </select>
          </div>

          {polling && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-amber-600 animate-spin" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Training in progress… (checking every 10s)</p>
              </div>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1">
                Training ID: {polling.id}
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={startTraining}
            disabled={loading || !!polling}
            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Starting…
              </span>
            ) : `${icon} Start ${label} Training`}
          </button>
        </div>
      </div>

      {/* Existing models */}
      {models.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h4 className="text-xs font-semibold uppercase text-gray-400 mb-3">{label} Models</h4>
          <div className="space-y-2">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => onModelReady(m)}
                className="w-full flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{m.dataset_name}</p>
                  <p className="text-[10px] text-gray-400">
                    trigger: <code className="font-mono text-brand-500">{m.metadata?.trigger_word ?? "—"}</code>
                    {" · "}{m.image_count} images · {m.training_status}
                  </p>
                </div>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  m.training_status === "completed"
                    ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                }`}>
                  {m.training_status === "completed" ? "Ready" : "Training"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CENTER — History
// ═══════════════════════════════════════════════════════════════════════════════
function HistoryCenter({
  brandId,
  onSelectImage,
  onSelectVideo,
}: {
  brandId: string;
  onSelectImage: (img: GeneratedImage) => void;
  onSelectVideo: (v: GeneratedVideo) => void;
}) {
  const [tab, setTab] = useState<"image" | "video" | "training">("image");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [trainings, setTrainings] = useState<TrainedModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    studioFetch({ action: "get_history", brand_id: brandId, type: "all", limit: 50 })
      .then((r) => {
        if (r.success) {
          setImages(r.images ?? []);
          setVideos(r.videos ?? []);
          setTrainings(r.trainings ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, [brandId]);

  const tabs: { id: "image" | "video" | "training"; label: string; count: number }[] = [
    { id: "image", label: "Images", count: images.length },
    { id: "video", label: "Videos", count: videos.length },
    { id: "training", label: "Models", count: trainings.length },
  ];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
        📋 Generation History
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <span className="w-6 h-6 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Images grid */}
          {tab === "image" && (
            images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => onSelectImage(img)}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 hover:ring-2 ring-brand-400 transition-all group relative"
                  >
                    {img.image_url ? (
                      <Image src={img.image_url} alt={img.prompt_text} width={120} height={120} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <p className="text-[9px] text-white line-clamp-2">{img.prompt_text}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No images generated yet</p>
            )
          )}

          {/* Videos list */}
          {tab === "video" && (
            videos.length > 0 ? (
              <div className="space-y-2">
                {videos.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onSelectVideo(v)}
                    className="w-full flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {v.video_thumbnail_url ? (
                        <Image src={v.video_thumbnail_url} alt="thumb" width={48} height={48} className="w-full h-full object-cover" />
                      ) : <span className="text-xl">🎬</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{v.hook}</p>
                      <p className="text-[10px] text-gray-400">{v.target_platform} · {v.video_aspect_ratio} · {v.ai_model}</p>
                      <p className="text-[10px] text-gray-400">{new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      v.video_status === "completed"
                        ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      {v.video_status === "completed" ? "Done" : "Processing"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No videos generated yet</p>
            )
          )}

          {/* Trainings list */}
          {tab === "training" && (
            trainings.length > 0 ? (
              <div className="space-y-2">
                {trainings.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
                    <span className="text-xl flex-shrink-0">{t.theme === "product" ? "🏭" : "👤"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{t.dataset_name}</p>
                      <p className="text-[10px] text-gray-400">
                        trigger: <code className="font-mono text-brand-500">{t.metadata?.trigger_word ?? "—"}</code>
                        {" · "}{t.image_count} images
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      t.training_status === "completed"
                        ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      {t.training_status === "completed" ? "Ready" : "Training"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No models trained yet</p>
            )
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIGHT — Detail panels
// ═══════════════════════════════════════════════════════════════════════════════
type DetailState =
  | { type: "none" }
  | { type: "image"; data: GeneratedImage }
  | { type: "video"; data: GeneratedVideo }
  | { type: "training"; data: TrainedModel };

function DetailPanel({ detail }: { detail: DetailState }) {
  if (detail.type === "none") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <span className="text-4xl mb-3">✨</span>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Select an item to see details</p>
        <p className="text-xs text-gray-400 mt-1">Generated images, videos, and trained models will appear here</p>
      </div>
    );
  }

  if (detail.type === "image") {
    const img = detail.data;
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {/* Image preview */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
            {img.image_url ? (
              <Image src={img.image_url} alt={img.prompt_text} fill className="object-contain" />
            ) : (
              <div className="flex items-center justify-center h-full text-5xl">🖼️</div>
            )}
          </div>
          {/* Info */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Prompt</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{img.prompt_text}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="text-gray-400 font-medium">Model</p>
                <p className="text-gray-700 dark:text-gray-300 font-mono">{img.ai_model ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Platform</p>
                <p className="text-gray-700 dark:text-gray-300">{img.target_platform ?? "—"}</p>
              </div>
              {img.style_preset && (
                <div className="col-span-2">
                  <p className="text-gray-400 font-medium">LoRA</p>
                  <p className="text-gray-700 dark:text-gray-300 font-mono text-[10px]">{img.style_preset}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 font-medium">Status</p>
                <p className={`font-semibold ${img.status === "completed" ? "text-green-500" : "text-amber-500"}`}>
                  {img.status}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Created</p>
                <p className="text-gray-700 dark:text-gray-300">{new Date(img.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {img.image_url && (
              <a
                href={img.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors text-center"
              >
                ↗ Open Full Image
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (detail.type === "video") {
    const v = detail.data;
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {/* Video preview */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center">
            {v.video_url ? (
              <video
                src={v.video_url}
                controls
                className="w-full h-full object-contain"
                poster={v.video_thumbnail_url ?? undefined}
              />
            ) : (
              <div className="text-center">
                <span className="text-4xl">🎬</span>
                <p className="text-xs text-gray-400 mt-2">
                  {v.video_status === "processing" ? "Video is generating…" : "No video yet"}
                </p>
              </div>
            )}
          </div>
          {/* Info */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">Prompt</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{v.hook}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="text-gray-400 font-medium">Model</p>
                <p className="text-gray-700 dark:text-gray-300 font-mono">{v.ai_model ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Aspect Ratio</p>
                <p className="text-gray-700 dark:text-gray-300">{v.video_aspect_ratio ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Platform</p>
                <p className="text-gray-700 dark:text-gray-300">{v.target_platform ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Status</p>
                <p className={`font-semibold ${v.video_status === "completed" ? "text-green-500" : "text-amber-500"}`}>
                  {v.video_status ?? "—"}
                </p>
              </div>
            </div>

            {/* Sound recommendations */}
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
              <p className="text-[10px] font-semibold uppercase text-gray-400 mb-2">🎵 Suggested Sound</p>
              <ul className="space-y-1">
                {["Trending background music for " + (v.target_platform ?? "TikTok"),
                  "Upbeat corporate/brand anthem",
                  "Ambient product showcase music"].map((s, i) => (
                  <li key={i} className="text-[10px] text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                    <span className="text-gray-300 mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            {v.video_url && (
              <a
                href={v.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors text-center"
              >
                ↗ Download Video
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (detail.type === "training") {
    const t = detail.data;
    const isReady = t.training_status === "completed";
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{t.theme === "product" ? "🏭" : "👤"}</span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.dataset_name}</h3>
            <p className="text-xs text-gray-400 capitalize">{t.theme} Model · {t.image_count} images</p>
          </div>
          <span className={`ml-auto text-[10px] font-semibold px-2 py-1 rounded-full ${
            isReady ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          }`}>
            {isReady ? "✓ Ready" : "Training…"}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Trigger Word</span>
            <code className="font-mono text-brand-500 text-[11px]">{t.metadata?.trigger_word ?? "—"}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">KIE Training ID</span>
            <span className="font-mono text-gray-600 dark:text-gray-400 text-[10px] truncate max-w-[120px]">
              {t.metadata?.kie_training_id ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Images Used</span>
            <span className="text-gray-700 dark:text-gray-300">{t.image_count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Created</span>
            <span className="text-gray-700 dark:text-gray-300">{new Date(t.created_at).toLocaleDateString()}</span>
          </div>
          {t.model_path && (
            <div className="flex justify-between">
              <span className="text-gray-400">Model Path</span>
              <span className="font-mono text-gray-600 dark:text-gray-400 text-[10px] truncate max-w-[120px]">{t.model_path}</span>
            </div>
          )}
        </div>

        {isReady && (
          <div className="rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 p-3">
            <p className="text-xs font-medium text-brand-700 dark:text-brand-400 mb-1">✓ Model Ready</p>
            <p className="text-[10px] text-brand-600/70 dark:text-brand-400/70">
              Use trigger word <code className="font-mono font-bold">{t.metadata?.trigger_word}</code> in your image prompts to apply this model.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ContentStudioPage() {
  const [brandId, setBrandId] = useState(FALLBACK_BRAND_ID);
  const [currentTier, setCurrentTier] = useState<"basic" | "premium" | "partner">("basic");
  const [activeSection, setActiveSection] = useState<StudioSection>("generate_image");
  const [detail, setDetail] = useState<DetailState>({ type: "none" });
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([]);

  // Load brandId + subscription tier from auth
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: ub } = await supabase
          .from("user_brands")
          .select("brand_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();
        if (!ub?.brand_id) return;
        setBrandId(ub.brand_id);
        // Fetch subscription tier
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_subscription", brand_id: ub.brand_id }),
        });
        const sub = await res.json();
        if (sub.success) {
          const tier = (sub.brand_payment?.subscription_tier as string) ?? "basic";
          const mapped = tier === "partner" ? "partner" : tier === "premium" ? "premium" : "basic";
          setCurrentTier(mapped as "basic" | "premium" | "partner");
        }
      } catch { /* keep fallback */ }
    };
    load();
  }, []);

  // Load trained models for use in image generation LoRA selector
  useEffect(() => {
    studioFetch({ action: "get_history", brand_id: brandId, type: "training", limit: 50 })
      .then((r) => { if (r.success) setTrainedModels(r.trainings ?? []); });
  }, [brandId]);

  // Center column content
  const center = (
    <div>
      {activeSection === "generate_image" && (
        <GenerateImageCenter
          brandId={brandId}
          trainedModels={trainedModels}
          onResult={(img) => setDetail({ type: "image", data: img })}
        />
      )}
      {activeSection === "generate_video" && (
        <GenerateVideoCenter
          brandId={brandId}
          onResult={(v) => setDetail({ type: "video", data: v })}
        />
      )}
      {activeSection === "train_product" && (
        <TrainingCenter
          brandId={brandId}
          type="product"
          currentTier={currentTier}
          totalModelCount={trainedModels.length}
          onModelReady={(m) => {
            setTrainedModels((prev) => {
              const exists = prev.find((p) => p.id === m.id);
              if (exists) return prev;
              return [...prev, m];
            });
            setDetail({ type: "training", data: m });
          }}
        />
      )}
      {activeSection === "train_character" && (
        <TrainingCenter
          brandId={brandId}
          type="character"
          currentTier={currentTier}
          totalModelCount={trainedModels.length}
          onModelReady={(m) => {
            setTrainedModels((prev) => {
              const exists = prev.find((p) => p.id === m.id);
              if (exists) return prev;
              return [...prev, m];
            });
            setDetail({ type: "training", data: m });
          }}
        />
      )}
      {activeSection === "history" && (
        <HistoryCenter
          brandId={brandId}
          onSelectImage={(img) => setDetail({ type: "image", data: img })}
          onSelectVideo={(v) => setDetail({ type: "video", data: v })}
        />
      )}
    </div>
  );

  const left = (
    <StudioNav active={activeSection} onSelect={setActiveSection} />
  );

  const right = (
    <div className="h-full overflow-y-auto">
      <DetailPanel detail={detail} />
    </div>
  );

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
