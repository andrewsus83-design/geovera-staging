import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "https://geovera.xyz",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RecordFeedbackRequest {
  brand_id: string;
  content_id: string;
  rating: number;
  feedback_text?: string;
  issues_reported?: string[];
  brand_consistency_rating?: number;
  quality_rating?: number;
  relevance_rating?: number;
  was_edited?: boolean;
  edit_percentage?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: RecordFeedbackRequest = await req.json();
    const {
      brand_id,
      content_id,
      rating,
      feedback_text,
      issues_reported = [],
      brand_consistency_rating,
      quality_rating,
      relevance_rating,
      was_edited = false,
      edit_percentage = 0
    } = requestData;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ success: false, error: "Rating must be between 1 and 5" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get content details
    const { data: content, error: contentError } = await supabaseClient
      .from("gv_content_library")
      .select("content_type")
      .eq("id", content_id)
      .single();

    if (contentError || !content) {
      return new Response(
        JSON.stringify({ success: false, error: "Content not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record feedback using helper function
    const { data: feedbackId, error: feedbackError } = await supabaseClient.rpc("record_content_feedback", {
      p_brand_id: brand_id,
      p_user_id: user.id,
      p_content_id: content_id,
      p_rating: rating,
      p_feedback_text: feedback_text || null,
      p_issues_reported: issues_reported
    });

    if (feedbackError) {
      throw new Error(`Failed to record feedback: ${feedbackError.message}`);
    }

    // Update feedback with additional ratings
    if (brand_consistency_rating || quality_rating || relevance_rating || was_edited) {
      const { error: updateError } = await supabaseClient
        .from("gv_content_feedback_loop")
        .update({
          brand_consistency_rating: brand_consistency_rating || null,
          quality_rating: quality_rating || null,
          relevance_rating: relevance_rating || null,
          was_edited,
          edit_percentage: was_edited ? edit_percentage : 0
        })
        .eq("id", feedbackId);

      if (updateError) {
        console.error("[record-content-feedback] Failed to update additional ratings:", updateError);
      }
    }

    // If rating is high (4-5), consider adding to training data
    if (rating >= 4 && content.content_type !== "article") {
      const { data: contentDetails } = await supabaseClient
        .from("gv_content_library")
        .select("primary_file_url, thumbnail_url, file_size_kb, file_format, title")
        .eq("id", content_id)
        .single();

      if (contentDetails && contentDetails.primary_file_url) {
        // Add to training data
        await supabaseClient
          .from("gv_content_training_data")
          .insert({
            brand_id,
            user_id: user.id,
            content_type: content.content_type,
            training_source: "generated_approved",
            file_url: contentDetails.primary_file_url,
            thumbnail_url: contentDetails.thumbnail_url,
            file_size_kb: contentDetails.file_size_kb,
            file_format: contentDetails.file_format,
            title: contentDetails.title,
            quality_score: (quality_rating || rating) / 5.0,
            brand_consistency_score: (brand_consistency_rating || rating) / 5.0,
            approved_for_training: true
          });

        // Update visual guidelines to needs_update if we have new high-quality examples
        await supabaseClient
          .from("gv_brand_visual_guidelines")
          .update({
            training_status: "needs_update"
          })
          .eq("brand_id", brand_id)
          .eq("training_status", "trained");
      }
    }

    // If rating is low (1-2), mark visual guidelines for review
    if (rating <= 2) {
      // Log poor performance for model improvement
      console.log(`[record-content-feedback] Low rating (${rating}) for content ${content_id}. Issues: ${issues_reported.join(", ")}`);
    }

    // Update brand voice guidelines approval rate
    const { data: avgRating } = await supabaseClient
      .from("gv_content_feedback_loop")
      .select("rating")
      .eq("brand_id", brand_id)
      .eq("content_type", "article");

    if (avgRating && avgRating.length > 0 && content.content_type === "article") {
      const totalRatings = avgRating.length;
      const approvedCount = avgRating.filter((f: any) => f.rating >= 4).length;
      const approvalRate = (approvedCount / totalRatings) * 100;

      await supabaseClient
        .from("gv_brand_voice_guidelines")
        .update({
          total_content_generated: totalRatings,
          user_approval_rate: approvalRate
        })
        .eq("brand_id", brand_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        feedback_id: feedbackId,
        message: rating >= 4
          ? "Thank you! This content has been added to your training data."
          : rating >= 3
            ? "Thank you for your feedback. We'll use this to improve future generations."
            : "Thank you for your feedback. We'll work on addressing the issues you reported."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[record-content-feedback] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: "FEEDBACK_RECORDING_FAILED"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
