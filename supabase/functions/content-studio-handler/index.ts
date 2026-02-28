import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KIE_API_KEY = Deno.env.get("KIE_API_KEY") ?? "";
const KIE_BASE = "https://api.kie.ai/v1";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

// ── helpers ──────────────────────────────────────────────────────────────────

function kieHeaders() {
  return { "Authorization": `Bearer ${KIE_API_KEY}`, "Content-Type": "application/json" };
}

async function kiePost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${KIE_BASE}${path}`, {
    method: "POST", headers: kieHeaders(), body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`KIE API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function kieGet(path: string) {
  const res = await fetch(`${KIE_BASE}${path}`, { headers: kieHeaders() });
  if (!res.ok) throw new Error(`KIE API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function openAIChat(systemPrompt: string, userPrompt: string, maxTokens = 300): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.8,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ── today midnight UTC ────────────────────────────────────────────────────────
function todayISO() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

// ── main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const { action, brand_id, ...data } = body;

    if (!brand_id) {
      return new Response(JSON.stringify({ error: "brand_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!KIE_API_KEY && !["check_daily_usage", "generate_smart_prompt"].includes(action)) {
      return new Response(JSON.stringify({ error: "KIE_API_KEY not configured" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = (d: unknown, status = 200) =>
      new Response(JSON.stringify(d), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // ── CHECK DAILY USAGE ────────────────────────────────────────────────────
    if (action === "check_daily_usage") {
      const midnight = todayISO();
      const [imgRes, vidRes] = await Promise.all([
        supabase.from("gv_image_generations")
          .select("id", { count: "exact", head: true })
          .eq("brand_id", brand_id)
          .gte("created_at", midnight),
        supabase.from("gv_video_generations")
          .select("id", { count: "exact", head: true })
          .eq("brand_id", brand_id)
          .gte("created_at", midnight),
      ]);
      return json({ success: true, images_today: imgRes.count ?? 0, videos_today: vidRes.count ?? 0 });
    }

    // ── GENERATE SMART PROMPT (OpenAI + history learning) ────────────────────
    if (action === "generate_smart_prompt") {
      const { prompt_type = "image", subject_type = "product", model_name = "", topic_style = "", task_context = "" } = data;

      // Fetch recent successful generations for smart learning context
      const [imgHistory, vidHistory] = await Promise.all([
        supabase.from("gv_image_generations")
          .select("prompt_text, status, target_platform, style_preset")
          .eq("brand_id", brand_id)
          .in("status", ["completed", "succeeded"])
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("gv_video_generations")
          .select("hook, video_status, target_platform")
          .eq("brand_id", brand_id)
          .in("video_status", ["completed", "succeeded"])
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      const recentImgPrompts = (imgHistory.data ?? []).map((r: { prompt_text: string }) => `  - ${r.prompt_text}`).join("\n");
      const recentVidHooks = (vidHistory.data ?? []).map((r: { hook: string }) => `  - ${r.hook}`).join("\n");

      const subjectLabel = subject_type === "both" ? "character and product together" : subject_type;
      const isVideo = prompt_type === "video";

      const systemPrompt = `You are a world-class ${isVideo ? "video" : "photography"} director and creative AI prompt engineer for social media brands.

Your specialty is crafting highly specific, commercially powerful ${isVideo ? "video" : "image"} generation prompts that produce stunning, viral-worthy content.

Brand context:
- Subject: ${subjectLabel}${model_name ? ` — specifically "${model_name}"` : ""}
- Style/Topic: ${topic_style || "commercial brand content"}
${task_context ? `- Task context: ${task_context}` : ""}

Learning from this brand's recent successful content:
${recentImgPrompts ? `Recent images that worked:\n${recentImgPrompts}` : ""}
${recentVidHooks ? `Recent videos that worked:\n${recentVidHooks}` : ""}

Rules:
1. Generate ONE highly detailed, specific prompt only — no explanation, no quotes, just the prompt
2. Include lighting style, composition, mood, setting, technical quality descriptors
3. Make it commercially optimized for social media (Instagram/TikTok)
4. Learn from the patterns in the recent successful content above
5. Keep it under 150 words`;

      const userMsg = isVideo
        ? `Generate a compelling ${topic_style} video prompt for ${subjectLabel} content. Include movement, mood, setting, and style direction.`
        : `Generate a stunning commercial ${topic_style || "product"} photography prompt for ${subjectLabel}. Include lighting, composition, setting, and technical quality.`;

      const prompt = await openAIChat(systemPrompt, userMsg, 200);
      return json({ success: true, prompt });
    }

    // ── GENERATE SYNTHETICS (for training — bypasses daily quota) ─────────────
    if (action === "generate_synthetics") {
      const { name, training_type = "product", count = 8 } = data;
      if (!name) return json({ error: "name is required" }, 400);

      const typeLabel = training_type === "character" ? "person/character" : "product";

      // Build varied prompts using OpenAI
      let prompts: string[] = [];
      try {
        const systemMsg = `Generate ${count} varied, highly specific text-to-image prompts for AI training data of a ${typeLabel} named "${name}".
Each prompt should show a different angle, lighting, setting, or style.
Return ONLY a JSON array of prompt strings, nothing else.`;
        const raw = await openAIChat(systemMsg, `Generate ${count} training image prompts for "${name}" (${typeLabel}). Vary angles, lighting, backgrounds, styles.`, 600);
        const parsed = JSON.parse(raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
        if (Array.isArray(parsed)) prompts = parsed.slice(0, count);
      } catch {
        // Fallback prompts
        prompts = [
          `${typeLabel} photography of ${name}, front view, white studio background, professional lighting`,
          `${typeLabel} shot of ${name}, left side 45-degree angle, soft lighting, clean backdrop`,
          `${typeLabel} photo of ${name}, right side view, dramatic studio strobe, white background`,
          `${typeLabel} back view of ${name}, gradient background, product commercial quality`,
          `${typeLabel} overhead flatlay of ${name}, top-down, minimal props, editorial`,
          `${typeLabel} close-up detail of ${name}, macro lens, studio light, sharp focus`,
          `${typeLabel} lifestyle shot of ${name}, natural environment, authentic context`,
          `${typeLabel} hero shot of ${name}, cinematic lighting, premium magazine quality`,
        ].slice(0, count);
      }

      // Generate images in parallel batches of 4 using Flux-2 Pro for highest quality training data
      const results: string[] = [];
      const BATCH = 4;
      for (let i = 0; i < prompts.length; i += BATCH) {
        const batch = prompts.slice(i, i + BATCH);
        const settled = await Promise.allSettled(
          batch.map((prompt) => kiePost("/image/generate", { prompt, aspect_ratio: "1:1", model: "flux-2-pro", num_images: 1 }))
        );
        for (const r of settled) {
          if (r.status === "fulfilled") {
            const url = r.value?.image_url ?? r.value?.url ?? null;
            if (url) results.push(url);
          }
        }
      }

      return json({ success: true, synthetic_urls: results, count: results.length });
    }

    // ── GENERATE IMAGE ───────────────────────────────────────────────────────
    if (action === "generate_image") {
      const { prompt, aspect_ratio = "1:1", model = "kie-flux", negative_prompt = "", lora_model = "" } = data;
      if (!prompt) return json({ error: "prompt is required" }, 400);

      const payload: Record<string, unknown> = { prompt, negative_prompt, aspect_ratio, model, num_images: 1 };
      if (lora_model) payload.lora_model = lora_model;

      const kieRes = await kiePost("/image/generate", payload);

      const { data: inserted } = await supabase.from("gv_image_generations").insert({
        brand_id,
        prompt_text: prompt,
        negative_prompt,
        aspect_ratio,
        ai_provider: "kie",
        ai_model: kieRes.model ?? model,
        image_url: kieRes.image_url ?? kieRes.url ?? null,
        thumbnail_url: kieRes.thumbnail_url ?? null,
        status: kieRes.status ?? "completed",
        target_platform: data.platform ?? "instagram",
        style_preset: lora_model || null,
      }).select("id").single();

      return json({
        success: true,
        task_id: kieRes.task_id ?? kieRes.id ?? null,
        image_url: kieRes.image_url ?? kieRes.url ?? null,
        status: kieRes.status ?? "completed",
        db_id: inserted?.id ?? null,
        raw: kieRes,
      });
    }

    // ── GENERATE VIDEO ───────────────────────────────────────────────────────
    if (action === "generate_video") {
      const { prompt, duration = 8, aspect_ratio = "9:16", model = "kling-v1", image_url = "" } = data;
      if (!prompt) return json({ error: "prompt is required" }, 400);

      const payload: Record<string, unknown> = { prompt, duration, aspect_ratio, model, mode: data.mode ?? "standard" };
      if (image_url) payload.image_url = image_url;

      const kieRes = await kiePost("/video/generate", payload);

      const { data: inserted } = await supabase.from("gv_video_generations").insert({
        brand_id,
        target_platform: data.platform ?? "tiktok",
        hook: prompt,
        ai_model: kieRes.model ?? model,
        status: kieRes.status ?? "processing",
        generation_mode: "kie",
        runway_task_id: kieRes.task_id ?? kieRes.id ?? null,
        video_url: kieRes.video_url ?? null,
        video_thumbnail_url: kieRes.thumbnail_url ?? null,
        video_aspect_ratio: aspect_ratio,
        video_status: kieRes.status ?? "processing",
      }).select("id").single();

      return json({
        success: true,
        task_id: kieRes.task_id ?? kieRes.id ?? null,
        video_url: kieRes.video_url ?? null,
        status: kieRes.status ?? "processing",
        db_id: inserted?.id ?? null,
        raw: kieRes,
      });
    }

    // ── CHECK TASK STATUS ────────────────────────────────────────────────────
    if (action === "check_task") {
      const { task_id, db_id, task_type } = data;
      if (!task_id) return json({ error: "task_id is required" }, 400);

      const kieRes = await kieGet(`/task/${task_id}`);
      const status = kieRes.status ?? "processing";

      if (db_id && ["completed", "succeeded", "success"].includes(status)) {
        if (task_type === "image") {
          await supabase.from("gv_image_generations").update({
            status: "completed",
            image_url: kieRes.image_url ?? kieRes.result?.image_url ?? null,
            thumbnail_url: kieRes.thumbnail_url ?? null,
          }).eq("id", db_id);
        } else if (task_type === "video") {
          await supabase.from("gv_video_generations").update({
            video_status: "completed",
            video_url: kieRes.video_url ?? kieRes.result?.video_url ?? null,
            video_thumbnail_url: kieRes.thumbnail_url ?? null,
          }).eq("id", db_id);
        }
      }

      return json({
        success: true, status,
        image_url: kieRes.image_url ?? kieRes.result?.image_url ?? null,
        video_url: kieRes.video_url ?? kieRes.result?.video_url ?? null,
        raw: kieRes,
      });
    }

    // ── TRAIN PRODUCT / CHARACTER ────────────────────────────────────────────
    if (action === "train_product" || action === "train_character") {
      const { name, trigger_word, image_urls, steps = 1000 } = data;
      const training_type = action === "train_character" ? "character" : "product";
      if (!name || !image_urls?.length) return json({ error: "name and image_urls are required" }, 400);

      const tw = trigger_word ?? name.toLowerCase().replace(/\s+/g, "_");

      const kieRes = await kiePost("/training/create", {
        name, trigger_word: tw, image_urls, training_type, steps,
        base_model: "flux-2-pro", // Optimized Flux-2 Pro base for highest quality LoRA
      });

      await supabase.from("gv_lora_datasets").insert({
        brand_id,
        dataset_name: name,
        theme: training_type,
        image_count: image_urls.length,
        training_status: "training",
        storage_path: `kie://${kieRes.training_id ?? kieRes.id}`,
        metadata: { trigger_word: tw, kie_training_id: kieRes.training_id ?? kieRes.id, steps },
      });

      return json({
        success: true,
        training_id: kieRes.training_id ?? kieRes.id ?? null,
        status: kieRes.status ?? "training",
        trigger_word: tw,
        raw: kieRes,
      });
    }

    // ── CHECK TRAINING STATUS ────────────────────────────────────────────────
    if (action === "check_training") {
      const { training_id } = data;
      if (!training_id) return json({ error: "training_id is required" }, 400);

      const kieRes = await kieGet(`/training/${training_id}`);
      const status = kieRes.status ?? "training";

      if (["completed", "succeeded"].includes(status)) {
        await supabase.from("gv_lora_datasets").update({
          training_status: "completed",
          model_path: kieRes.model_url ?? kieRes.model_path ?? null,
        }).contains("metadata", { kie_training_id: training_id });
      }

      return json({
        success: true, status,
        model_url: kieRes.model_url ?? null,
        progress: kieRes.progress ?? null,
        raw: kieRes,
      });
    }

    // ── GET HISTORY ──────────────────────────────────────────────────────────
    if (action === "get_history") {
      const limit = Number(data.limit ?? 20);
      const type = data.type ?? "all";
      const results: Record<string, unknown> = {};

      if (type === "all" || type === "image") {
        const { data: imgs } = await supabase
          .from("gv_image_generations")
          .select("id, prompt_text, image_url, thumbnail_url, status, ai_model, target_platform, style_preset, created_at")
          .eq("brand_id", brand_id)
          .order("created_at", { ascending: false })
          .limit(limit);
        results.images = imgs ?? [];
      }

      if (type === "all" || type === "video") {
        const { data: vids } = await supabase
          .from("gv_video_generations")
          .select("id, hook, video_url, video_thumbnail_url, video_status, ai_model, target_platform, video_aspect_ratio, created_at")
          .eq("brand_id", brand_id)
          .order("created_at", { ascending: false })
          .limit(limit);
        results.videos = vids ?? [];
      }

      if (type === "all" || type === "training") {
        const { data: trainings } = await supabase
          .from("gv_lora_datasets")
          .select("id, dataset_name, theme, image_count, training_status, model_path, metadata, created_at")
          .eq("brand_id", brand_id)
          .order("created_at", { ascending: false })
          .limit(limit);
        results.trainings = trainings ?? [];
      }

      return json({ success: true, ...results });
    }

    return json({ error: "Invalid action" }, 400);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("content-studio-handler error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
