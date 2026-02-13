import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo";

// Token costs per 1K tokens (USD)
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4": { input: 0.03, output: 0.06 },
};

interface ChatRequest {
  brand_id: string;
  session_id?: string;
  message: string;
}

interface ChatSession {
  id: string;
  brand_id: string;
  user_id: string;
  title: string;
  message_count: number;
  total_tokens: number;
  total_cost_usd: number;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Validate OpenAI API key
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized - Authorization header required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Parse request body
    const body: ChatRequest = await req.json();
    const { brand_id, session_id, message } = body;

    // Validate required fields
    if (!brand_id || !message) {
      return new Response(JSON.stringify({ error: "brand_id and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user owns the brand
    const { data: userBrand, error: brandError } = await supabase
      .from("user_brands")
      .select("brand_id, role")
      .eq("user_id", userId)
      .eq("brand_id", brand_id)
      .single();

    if (brandError || !userBrand) {
      return new Response(JSON.stringify({ error: "Brand not found or access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or create chat session
    let chatSession: ChatSession | null = null;

    if (session_id) {
      // Try to get existing session
      const { data: existingSession } = await supabase
        .from("gv_ai_chat_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("brand_id", brand_id)
        .eq("user_id", userId)
        .single();

      chatSession = existingSession;
    }

    if (!chatSession) {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from("gv_ai_chat_sessions")
        .insert({
          brand_id,
          user_id: userId,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          message_count: 0,
          total_tokens: 0,
          total_cost_usd: 0,
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        return new Response(JSON.stringify({ error: "Failed to create chat session" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      chatSession = newSession;
    }

    // Store user message in database
    const { data: userMessage, error: userMessageError } = await supabase
      .from("gv_ai_conversations")
      .insert({
        brand_id,
        user_id: userId,
        session_id: chatSession.id,
        message,
        role: "user",
        conversation_type: "chat",
        tokens_used: 0,
        cost_usd: 0,
      })
      .select()
      .single();

    if (userMessageError) {
      console.error("User message storage error:", userMessageError);
      return new Response(JSON.stringify({ error: "Failed to store user message" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get recent conversation history (last 10 messages)
    const { data: conversationHistory } = await supabase
      .from("gv_ai_conversations")
      .select("role, message")
      .eq("session_id", chatSession.id)
      .order("created_at", { ascending: true })
      .limit(10);

    // Build messages for OpenAI
    const messages = [
      {
        role: "system",
        content: "You are a helpful AI assistant for GeoVera, a marketing and brand intelligence platform. Help users with their marketing questions, campaign strategies, and brand insights.",
      },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.message,
      })),
    ];

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return new Response(JSON.stringify({ error: "OpenAI API error", details: errorData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;
    const tokensUsed = openaiData.usage?.total_tokens || 0;
    const promptTokens = openaiData.usage?.prompt_tokens || 0;
    const completionTokens = openaiData.usage?.completion_tokens || 0;

    // Calculate cost
    const modelCosts = TOKEN_COSTS[OPENAI_MODEL] || TOKEN_COSTS["gpt-3.5-turbo"];
    const costUsd = (
      (promptTokens / 1000) * modelCosts.input +
      (completionTokens / 1000) * modelCosts.output
    );

    // Store AI response in database
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from("gv_ai_conversations")
      .insert({
        brand_id,
        user_id: userId,
        session_id: chatSession.id,
        message: aiResponse,
        role: "assistant",
        ai_provider: "openai",
        model_used: OPENAI_MODEL,
        conversation_type: "chat",
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        parent_message_id: userMessage.id,
      })
      .select()
      .single();

    if (aiMessageError) {
      console.error("AI message storage error:", aiMessageError);
    }

    // Update session stats
    await supabase
      .from("gv_ai_chat_sessions")
      .update({
        message_count: (chatSession.message_count || 0) + 2,
        total_tokens: (chatSession.total_tokens || 0) + tokensUsed,
        total_cost_usd: (chatSession.total_cost_usd || 0) + costUsd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatSession.id);

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      session_id: chatSession.id,
      message_id: aiMessage?.id || null,
      response: aiResponse,
      metadata: {
        ai_provider: "openai",
        model_used: OPENAI_MODEL,
        tokens_used: tokensUsed,
        cost_usd: parseFloat(costUsd.toFixed(4)),
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: err instanceof Error ? err.message : String(err)
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
