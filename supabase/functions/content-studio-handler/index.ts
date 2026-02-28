import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KIE_API_KEY = Deno.env.get("KIE_API_KEY") ?? "";
const KIE_BASE = "https://api.kie.ai/v1";

// ── helpers ─────────────────────────────────────────────────────────────────

function kieHeaders() {
  return {
    "Authorization": `Bearer ${KIE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function kiePost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${KIE_BASE}${path}`, {
    method: "POST",
    headers: kieHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`KIE API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function kieGet(path: string) {
  const res = await fetch(`${KIE_BASE}${path}`, { headers: kieHeaders() });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`KIE API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ── main handler ─────────────────────────────────────────────────────────────

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

    if (!KIE_API_KEY) {
      return new Response(JSON.stringify({ error: "KIE_API_KEY not configured" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GENERATE IMAGE ──────────────────────────────────────────────────────
    if (action === "generate_image") {
      const { prompt, aspect_ratio = "1:1", model = "kie-flux", negative_prompt = "", lora_model = "" } = data;

      if (!prompt) {
        return new Response(JSON.stringify({ error: "prompt is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload: Record<string, unknown> = {
        prompt,
        negative_prompt,
        aspect_ratio,
        model,
        num_images: 1,
      };
      if (lora_model) payload.lora_model = lora_model;

      const kieRes = await kiePost("/image/generate", payload);

      // Store in gv_image_generations
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

      return new Response(JSON.stringify({
        success: true,
        task_id: kieRes.task_id ?? kieRes.id ?? null,
        image_url: kieRes.image_url ?? kieRes.url ?? null,
        status: kieRes.status ?? "completed",
        db_id: inserted?.id ?? null,
        raw: kieRes,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── GENERATE VIDEO ──────────────────────────────────────────────────────
    if (action === "generate_video") {
      const { prompt, duration = 5, aspect_ratio = "16:9", model = "kling-v1", image_url = "" } = data;

      if (!prompt) {
        return new Response(JSON.stringify({ error: "prompt is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload: Record<string, unknown> = {
        prompt,
        duration,
        aspect_ratio,
        model,
        mode: data.mode ?? "standard",
      };
      if (image_url) payload.image_url = image_url;

      const kieRes = await kiePost("/video/generate", payload);

      // Store in gv_video_generations
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

      return new Response(JSON.stringify({
        success: true,
        task_id: kieRes.task_id ?? kieRes.id ?? null,
        video_url: kieRes.video_url ?? null,
        status: kieRes.status ?? "processing",
        db_id: inserted?.id ?? null,
        raw: kieRes,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── CHECK TASK STATUS ────────────────────────────────────────────────────
    if (action === "check_task") {
      const { task_id, db_id, task_type } = data;
      if (!task_id) {
        return new Response(JSON.stringify({ error: "task_id is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const kieRes = await kieGet(`/task/${task_id}`);
      const status = kieRes.status ?? "processing";

      // Update DB record if completed
      if (db_id && (status === "completed" || status === "succeeded" || status === "success")) {
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

      return new Response(JSON.stringify({
        success: true,
        status,
        image_url: kieRes.image_url ?? kieRes.result?.image_url ?? null,
        video_url: kieRes.video_url ?? kieRes.result?.video_url ?? null,
        raw: kieRes,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── TRAIN PRODUCT MODEL ──────────────────────────────────────────────────
    if (action === "train_product" || action === "train_character") {
      const { name, trigger_word, image_urls, steps = 1000 } = data;
      const training_type = action === "train_character" ? "character" : "product";

      if (!name || !image_urls?.length) {
        return new Response(JSON.stringify({ error: "name and image_urls are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const kieRes = await kiePost("/training/create", {
        name,
        trigger_word: trigger_word ?? name.toLowerCase().replace(/\s+/g, "_"),
        image_urls,
        training_type,
        steps,
      });

      // Store in gv_lora_datasets
      await supabase.from("gv_lora_datasets").insert({
        brand_id,
        dataset_name: name,
        theme: training_type,
        image_count: image_urls.length,
        training_status: "training",
        storage_path: `kie://${kieRes.training_id ?? kieRes.id}`,
        metadata: {
          trigger_word: trigger_word ?? name.toLowerCase().replace(/\s+/g, "_"),
          kie_training_id: kieRes.training_id ?? kieRes.id,
          steps,
        },
      });

      return new Response(JSON.stringify({
        success: true,
        training_id: kieRes.training_id ?? kieRes.id ?? null,
        status: kieRes.status ?? "training",
        trigger_word: trigger_word ?? name.toLowerCase().replace(/\s+/g, "_"),
        raw: kieRes,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── CHECK TRAINING STATUS ─────────────────────────────────────────────────
    if (action === "check_training") {
      const { training_id } = data;
      if (!training_id) {
        return new Response(JSON.stringify({ error: "training_id is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const kieRes = await kieGet(`/training/${training_id}`);
      const status = kieRes.status ?? "training";

      // Update gv_lora_datasets
      if (status === "completed" || status === "succeeded") {
        await supabase.from("gv_lora_datasets").update({
          training_status: "completed",
          model_path: kieRes.model_url ?? kieRes.model_path ?? null,
        }).contains("metadata", { kie_training_id: training_id });
      }

      return new Response(JSON.stringify({
        success: true,
        status,
        model_url: kieRes.model_url ?? null,
        progress: kieRes.progress ?? null,
        raw: kieRes,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── GET HISTORY ─────────────────────────────────────────────────────────
    if (action === "get_history") {
      const limit = Number(data.limit ?? 20);
      const type = data.type ?? "all"; // "all" | "image" | "video" | "training"

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

      return new Response(JSON.stringify({ success: true, ...results }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("content-studio-handler error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
