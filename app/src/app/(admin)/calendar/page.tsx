"use client";
import { useState, useMemo } from "react";
import ThreeColumnLayout from "@/components/shared/ThreeColumnLayout";
import NavColumn from "@/components/shared/NavColumn";
import MiniCalendar from "@/components/calendar/MiniCalendar";
import PrioritySection from "@/components/calendar/PrioritySection";
import TaskDetailPanel from "@/components/calendar/TaskDetailPanel";
import type { Task } from "@/components/calendar/TaskCard";

// Premium plan daily tasks:
//   2 long articles (Medium, Quora/Reddit) + 2 short articles (LinkedIn, X)
//   + 2 Instagram posts + 1 Reels/TikTok/Shorts + 2 CEO tasks
const demoTasks: Task[] = [

  // ══════════════════════════════════════════════════════
  // FEB 23 — PREMIUM DAILY (7 tasks + 2 CEO)
  // ══════════════════════════════════════════════════════

  // Long articles (2)
  {
    id: "feb23-medium",
    title: "Medium Article: Why AI Marketing Is the Future of Brand Growth",
    description: "Write a 800–1200 word thought-leadership article for Medium. Cover how AI agents are reshaping brand marketing, with real examples and a clear CTA to try GeoVera. SEO keywords: AI marketing, brand growth, marketing automation.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-23",
    platform: "Blog",
    content: {
      caption: "AI isn't replacing marketers — it's giving them superpowers. Here's how GeoVera's AI agents are helping brands grow 3× faster without growing their team.",
      hashtags: ["#AIMarketing", "#BrandGrowth", "#MarketingAutomation", "#GeoVera"],
    },
  },
  {
    id: "feb23-quora",
    title: "Quora/Reddit Article: Answering 'How do I scale my brand without a big team?'",
    description: "Write a detailed, high-value Quora answer and Reddit post (r/Entrepreneur, r/marketing) addressing the top-voted question about scaling brand presence with limited resources. Answer naturally — weave in GeoVera as one of several solutions. 600–900 words.",
    agent: "CMO",
    priority: "high",
    impact: 2,
    dueDate: "2026-02-23",
    platform: "Blog",
    content: {
      caption: "The real answer to scaling your brand without a full team: systems + AI. Here's exactly what works in 2026.",
      hashtags: ["#Quora", "#Reddit", "#MarketingAdvice", "#BrandScaling"],
    },
  },

  // Short articles (2)
  {
    id: "feb23-linkedin",
    title: "LinkedIn Post: Brand Intelligence Insight — AI Marketing Trend",
    description: "Write a professional LinkedIn post (150–300 words) sharing one data-backed marketing insight from today's AI analysis. Format: strong hook → insight → 3 bullet takeaways → CTA question. Target: CMOs, founders, marketing managers.",
    agent: "CMO",
    priority: "high",
    impact: 2,
    dueDate: "2026-02-23",
    platform: "Blog",
    content: {
      caption: "AI is now analyzing your competitors' content faster than any human team. Here's what that means for your brand strategy in 2026...",
      hashtags: ["#LinkedInMarketing", "#AIMarketing", "#BrandStrategy", "#B2BMarketing"],
    },
  },
  {
    id: "feb23-x",
    title: "X Post: AI Agent Daily Insight — Brand Voice Tip",
    description: "Craft a punchy, high-engagement X post (max 280 chars) sharing a brand voice insight from today's market analysis. Include a hook, insight, and soft CTA. Short, sharp, shareable.",
    agent: "CMO",
    priority: "high",
    impact: 2,
    dueDate: "2026-02-23",
    platform: "X (Twitter)",
    content: {
      caption: "Your brand voice is your unfair advantage. Stop sounding like everyone else. 3 ways to stand out in 2026 → [link]",
      hashtags: ["#BrandVoice", "#MarketingTips", "#BuildInPublic"],
    },
  },

  // Instagram posts (2)
  {
    id: "feb23-ig1",
    title: "Instagram Post: GeoVera Platform Feature Spotlight",
    description: "Create a single-image or carousel post showcasing one GeoVera feature (AI report generation). Use clean brand visuals, bold headline, and 3–5 benefit bullet points in the caption. Target: founders & CMOs.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-23",
    platform: "Instagram",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    content: {
      caption: "One report. Every insight your brand needs. GeoVera generates full market intelligence reports in minutes — powered by AI, built for modern brands.",
      hashtags: ["#GeoVera", "#AIMarketing", "#BrandIntelligence", "#MarketingTools", "#StartupIndonesia"],
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    },
  },
  {
    id: "feb23-ig2",
    title: "Instagram Post #2: Tip of the Day — 60-Second Brand Audit",
    description: "Create a simple, highly shareable tip post. Format: bold question as headline → 3-step mini audit anyone can do in 60 seconds → invite DMs for a free report. Use clean, minimal design with brand colors. Very save-worthy.",
    agent: "CMO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-23",
    platform: "Instagram",
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
    content: {
      caption: "Do a 60-second brand audit right now: 1️⃣ Is your bio crystal clear? 2️⃣ Does your last post match your brand colors? 3️⃣ When did you last reply to a comment? DM us 'AUDIT' for a free AI brand report 👇",
      hashtags: ["#BrandAudit", "#MarketingTips", "#InstagramGrowth", "#GeoVera"],
      imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
    },
  },

  // Reels/TikTok/Shorts (1)
  {
    id: "feb23-reels",
    title: "Reels + TikTok + Shorts: '3 Things AI Does for Your Brand While You Sleep'",
    description: "Create a 30–45 sec vertical video for Instagram Reels, TikTok, and YouTube Shorts. Script: hook (0–3s) → 3 quick value points with on-screen text → CTA to follow/visit GeoVera. Use trending audio. Repurpose same video across all 3 platforms with platform-specific captions.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-23",
    platform: "Instagram",
    imageUrl: "https://images.unsplash.com/photo-1616469829581-73993eb86b6b?w=600&h=400&fit=crop",
    content: {
      caption: "POV: Your AI marketing team is working at 3am while you sleep 😴 → 1. Analyzing competitors 2. Drafting tomorrow's posts 3. Scoring your top leads Follow for daily AI marketing insights 👆",
      hashtags: ["#AIMarketing", "#MarketingHacks", "#GeoVera", "#ContentCreator", "#ReelsViral", "#TikTokMarketing"],
      imageUrl: "https://images.unsplash.com/photo-1616469829581-73993eb86b6b?w=600&h=400&fit=crop",
    },
  },

  // CEO tasks (2)
  {
    id: "feb23-ceo1",
    title: "CEO Daily #1: Review Market Intelligence Report & Set Today's Priorities",
    description: "Review the AI-generated market intelligence report for Feb 23. Identify top 3 opportunities and threats. Allocate agent tasks for the day. Update sprint priorities based on latest competitor moves and engagement data from yesterday.",
    agent: "CEO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-23",
  },
  {
    id: "feb23-ceo2",
    title: "CEO Daily #2: Budget Check & Growth Lever Review",
    description: "Review current CAC vs LTV ratio. Assess which content channels are producing the best ROI this week. Decide if budget should be shifted toward paid amplification of today's top-performing organic content. Brief team on decision.",
    agent: "CEO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-23",
  },

  // ══════════════════════════════════════════════════════
  // FEB 24 — PREMIUM DAILY
  // ══════════════════════════════════════════════════════
  {
    id: "feb24-medium",
    title: "Medium Article: 5 Signs Your Brand Is Ready for AI Automation",
    description: "Write a 800–1200 word checklist-style article for Medium. Help founders identify when it's the right time to adopt AI marketing tools. Practical, actionable, and shareable. Include GeoVera mention naturally.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-24",
    platform: "Blog",
    content: {
      caption: "Not sure if AI marketing is right for you? Here are 5 signs your brand is ready — and what to do next.",
      hashtags: ["#AIMarketing", "#StartupTips", "#BrandStrategy", "#MarketingAutomation"],
    },
  },
  {
    id: "feb24-reddit",
    title: "Reddit Post: r/marketing — 'What content formats are actually working in 2026?'",
    description: "Write a genuine, insight-rich Reddit thread starter for r/marketing. Share data-backed observations about content format performance (short video, newsletters, thought leadership). Include a question to spark discussion. No overt promotion — pure value.",
    agent: "CMO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-24",
    platform: "Blog",
    content: {
      caption: "We analyzed 500+ brand accounts for 3 months. Here's what content formats are actually driving engagement in 2026 (data inside) — what are you seeing?",
      hashtags: ["#Reddit", "#ContentMarketing", "#MarketingData"],
    },
  },
  {
    id: "feb24-linkedin",
    title: "LinkedIn Post: Weekly Insight — Competitor Landscape Snapshot",
    description: "Share an anonymized, data-driven LinkedIn post about the current competitor landscape in digital marketing. Frame as 'what we're seeing this week' from GeoVera's intelligence layer. 200–300 words, professional tone, ends with a question.",
    agent: "CMO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-24",
    platform: "Blog",
    content: {
      caption: "This week's competitor intelligence snapshot: brands investing in short-form video are seeing 2.3× higher reach than those relying only on static posts. Is your brand keeping up?",
      hashtags: ["#LinkedInMarketing", "#CompetitorAnalysis", "#DigitalMarketing"],
    },
  },
  {
    id: "feb24-x",
    title: "X Thread: 'What Top Brands Are Doing This Week That You're Not'",
    description: "Write a 3–4 tweet thread sharing anonymized insights from GeoVera's competitor analysis. Frame as educational intel. End with a question to drive replies. Each tweet should stand alone as shareable.",
    agent: "CMO",
    priority: "high",
    impact: 2,
    dueDate: "2026-02-24",
    platform: "X (Twitter)",
    content: {
      caption: "🧵 What top brands are doing this week that most aren't (yet): Thread →",
      hashtags: ["#MarketingThread", "#BrandStrategy", "#CompetitorIntel"],
    },
  },
  {
    id: "feb24-ig1",
    title: "Instagram Post: Customer Story — Brand Before & After",
    description: "Create a before/after Instagram post highlighting a brand transformation story. Results-focused copy. Include social proof numbers. Carousel format: slide 1 = problem, slides 2–4 = solution steps, slide 5 = results.",
    agent: "CMO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-24",
    platform: "Instagram",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    content: {
      caption: "From inconsistent posting to 3× engagement in 30 days. This is what happens when your brand gets a dedicated AI team.",
      hashtags: ["#BrandTransformation", "#AIMarketing", "#GeoVera", "#Results"],
      imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    },
  },
  {
    id: "feb24-ig2",
    title: "Instagram Post #2: Trending Audio — Relatable Brand Moment",
    description: "Create a fun, relatable Instagram post using a trending audio/meme format. Brand-appropriate humor about the struggles of marketing without AI. High save + share potential. Keep text minimal, visual-first.",
    agent: "CMO",
    priority: "low",
    impact: 1,
    dueDate: "2026-02-24",
    platform: "Instagram",
    content: {
      caption: "Me trying to manage 8 social platforms, write 3 articles, AND analyze competitors manually 🫠 vs me with GeoVera 😎✨",
      hashtags: ["#RelatablaMarketing", "#AITools", "#MarketingLife", "#GeoVera"],
    },
  },
  {
    id: "feb24-reels",
    title: "Reels + TikTok + Shorts: 'How We Generate a Market Report in 5 Minutes'",
    description: "Create a 30–45 sec screen-capture + voiceover video showing GeoVera generating a market report. Fast-paced edit, on-screen text highlights, satisfying to watch. Add a 'POV: your competitors are still doing this manually' hook.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-24",
    platform: "Instagram",
    content: {
      caption: "POV: 5 minutes to get a full market intelligence report 🤯 Your competitors are spending 5 hours doing this manually. GeoVera link in bio.",
      hashtags: ["#ProductDemo", "#AIMarketing", "#GeoVera", "#MarketResearch", "#TikTokBusiness"],
    },
  },
  {
    id: "feb24-ceo1",
    title: "CEO Daily #1: Evaluate Partnership Proposal & Review KPIs",
    description: "Review the incoming partnership proposal. Score on brand fit, audience overlap, and revenue potential. Review this week's KPI dashboard — flag metrics below target and reassign agent focus where needed.",
    agent: "CEO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-24",
  },
  {
    id: "feb24-ceo2",
    title: "CEO Daily #2: Content Performance Analysis — Approve/Pause Campaigns",
    description: "Review performance data on all content published in the last 48 hours. Identify top performers to amplify with paid boost. Identify underperformers to pause or revise. Approve next 24-hour content queue.",
    agent: "CEO",
    priority: "high",
    impact: 2,
    dueDate: "2026-02-24",
  },

  // ══════════════════════════════════════════════════════
  // FEB 25 — PREMIUM DAILY
  // ══════════════════════════════════════════════════════
  {
    id: "feb25-medium",
    title: "Medium Article: The CMO's Guide to AI Content Calendars",
    description: "Practical 900-word guide for CMOs on building AI-assisted content calendars. Cover: setting strategy, letting AI handle execution, reviewing outputs. Position GeoVera as the tool that makes this seamless.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-25",
    platform: "Blog",
    content: {
      caption: "Your content calendar shouldn't live in a spreadsheet. Here's how CMOs are using AI to plan, create, and publish — on autopilot.",
      hashtags: ["#ContentCalendar", "#CMOLife", "#AITools", "#ContentMarketing"],
    },
  },
  {
    id: "feb25-quora",
    title: "Quora Answer: 'What's the best way to grow a brand on social media in 2026?'",
    description: "Write a comprehensive, high-upvote-potential Quora answer to one of the most-searched brand marketing questions. Structure: empathy → framework → specific steps → tool mention (GeoVera, naturally). 700–1000 words.",
    agent: "CMO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-25",
    platform: "Blog",
    content: {
      caption: "The brands winning on social in 2026 are doing 3 things differently. Here's the exact framework — no fluff.",
      hashtags: ["#Quora", "#SocialMediaGrowth", "#BrandMarketing"],
    },
  },
  {
    id: "feb25-linkedin",
    title: "LinkedIn Post: Thought Leadership — 'The Death of Manual Marketing'",
    description: "Write a bold, opinion-driven LinkedIn post about how manual marketing processes are becoming obsolete. Take a clear stance, back it with data, invite debate. Goal: comments and reshares from marketing professionals.",
    agent: "CMO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-25",
    platform: "Blog",
    content: {
      caption: "Manual marketing is dying. Not slowly — fast. Here's what's replacing it and what that means for your team.",
      hashtags: ["#MarketingFuture", "#AIMarketing", "#ThoughtLeadership", "#LinkedInCreator"],
    },
  },
  {
    id: "feb25-x",
    title: "X Post: Brand Engagement Tip of the Day",
    description: "Post one highly actionable brand engagement tip under 280 chars. Format: bold hook → 1 specific tip → expected result. Feel like advice from a smart CMO friend, not a brand account.",
    agent: "CMO",
    priority: "medium",
    impact: 1,
    dueDate: "2026-02-25",
    platform: "X (Twitter)",
    content: {
      caption: "Stop asking followers to 'like and share'. Instead: ask a question they actually want to answer. Watch engagement jump 40%.",
      hashtags: ["#EngagementTips", "#SocialMediaMarketing", "#GrowthHacks"],
    },
  },
  {
    id: "feb25-ig1",
    title: "Instagram Post: Behind the Brand — GeoVera Vision",
    description: "Post a behind-the-scenes look at the GeoVera vision. Humanize the brand. Show the 'why'. Use authentic imagery, warm caption, and invite followers to share their own brand story.",
    agent: "CMO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-25",
    platform: "Instagram",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    content: {
      caption: "Every great brand starts with a belief. Ours: every founder deserves a world-class marketing team — even if it's powered by AI. 🌿",
      hashtags: ["#BehindTheBrand", "#StartupLife", "#GeoVera", "#BuildingInPublic"],
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    },
  },
  {
    id: "feb25-ig2",
    title: "Instagram Post #2: Data Visual — This Week's Brand Growth Stats",
    description: "Create a clean data visualization post showing sample brand growth metrics (reach, engagement, saves). Format as a simple infographic with GeoVera brand colors. Caption: share the story behind the numbers.",
    agent: "CMO",
    priority: "low",
    impact: 1,
    dueDate: "2026-02-25",
    platform: "Instagram",
    content: {
      caption: "📊 This week in brand growth (GeoVera dashboard preview): +28% reach, +41% saves, +19% profile visits. Every metric tells a story — what's yours saying?",
      hashtags: ["#BrandGrowth", "#MarketingMetrics", "#DataDriven", "#GeoVera"],
    },
  },
  {
    id: "feb25-tiktok",
    title: "TikTok: Behind the Scenes – Cara GeoVera Generate Konten Viral",
    description: "Buat video TikTok 45–60 detik yang menampilkan proses di balik layar GeoVera: dari riset tren → AI analysis → konten siap publish. Gunakan screen recording + voiceover. Hook kuat di 3 detik pertama. Target: founders & CMO Indonesia.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-25",
    platform: "TikTok",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    content: {
      caption: "Dari riset tren → AI analysis → konten siap publish — semua dalam hitungan menit! ⚡\n\nIni dia proses di balik layar bagaimana GeoVera membantu brand Indonesia menciptakan konten TikTok yang relevan, engaging, dan konsisten setiap hari. 🤖🇮🇩",
      hashtags: ["#BehindTheScenes", "#AIContent", "#GeoVera", "#ContentCreation", "#TikTokMarketing", "#BrandIndonesia"],
    },
  },
  {
    id: "feb25-ceo1",
    title: "CEO Daily #1: Set March OKRs & Approve Content Calendar",
    description: "Define March Objectives and Key Results across growth, retention, and brand awareness. Review and sign off on the AI-generated content calendar for the next 2 weeks. Confirm budget allocation for paid amplification.",
    agent: "CEO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-25",
  },
  {
    id: "feb25-ceo2",
    title: "CEO Daily #2: Competitor Intelligence Brief — Strategy Adjustment",
    description: "Review today's competitor intelligence brief generated by GeoVera. Identify any strategic moves by key competitors that require a response. Adjust CMO agent priorities for the next 48 hours based on findings.",
    agent: "CEO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-25",
  },

  // ══════════════════════════════════════════════════════
  // FEB 26 — PREMIUM DAILY
  // ══════════════════════════════════════════════════════
  {
    id: "feb26-medium",
    title: "Medium Article: How to Build a Brand Voice Your Audience Remembers",
    description: "1000-word guide on defining and maintaining a consistent brand voice across all channels. Include a simple framework: Personality → Tone → Language rules. Use GeoVera's brand DNA storytelling as a case example.",
    agent: "CMO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-26",
    platform: "Blog",
    content: {
      caption: "Your brand voice is the one thing AI can replicate from you — but only if you define it first. Here's a simple 3-step framework.",
      hashtags: ["#BrandVoice", "#ContentStrategy", "#BrandBuilding", "#MarketingFramework"],
    },
  },
  {
    id: "feb26-reddit",
    title: "Reddit: r/Entrepreneur — 'Share your biggest marketing win this month'",
    description: "Post an engaging community thread starter in r/Entrepreneur. Share a genuine marketing win (e.g., a campaign insight from GeoVera's AI), invite others to share theirs. Community-building post, not promotional. Drive upvotes and comments.",
    agent: "CMO",
    priority: "low",
    impact: 1,
    dueDate: "2026-02-26",
    platform: "Blog",
    content: {
      caption: "Our biggest marketing win this month: switching from manual competitor research to AI analysis cut our research time by 80%. What's yours?",
      hashtags: ["#Reddit", "#Entrepreneur", "#MarketingWin"],
    },
  },
  {
    id: "feb26-linkedin",
    title: "LinkedIn Post: Friday Wrap — Weekly Marketing Insights",
    description: "Post a Friday wrap-up LinkedIn update with 3 marketing insights from the week. Data-driven, professional tone. End with 'What was your biggest marketing insight this week?' to drive comments from marketing professionals.",
    agent: "CMO",
    priority: "medium",
    impact: 1,
    dueDate: "2026-02-26",
    platform: "Blog",
    content: {
      caption: "3 marketing insights from this week: 1. Short-form video reach is up 34% YoY. 2. Thought leadership posts drive 5× more inbound than promotional posts. 3. Brands replying to comments within 1hr see +22% follower growth.",
      hashtags: ["#FridayInsights", "#MarketingTips", "#LinkedInCreator"],
    },
  },
  {
    id: "feb26-x",
    title: "X Post: Friday — What Worked This Week",
    description: "Post a short 'week in review' X post sharing 1 marketing insight, 1 result, and 1 thing to try next week. Transparent and data-driven. Format as a quick list.",
    agent: "CMO",
    priority: "medium",
    impact: 1,
    dueDate: "2026-02-26",
    platform: "X (Twitter)",
    content: {
      caption: "This week:\n✅ Instagram reach +28%\n✅ Medium article: 4.2K reads\n✅ Reels: 12K views\n⚡ Next week: testing long-form X threads\nWhat worked for you?",
      hashtags: ["#MarketingReview", "#WeeklyWins", "#GrowthMarketing"],
    },
  },
  {
    id: "feb26-ig1",
    title: "Instagram Post: Weekend Inspiration — Brand Quote Card",
    description: "Create a beautifully designed quote card using GeoVera brand colors. Feature a compelling brand-building or marketing quote. High save potential. Use minimal design, bold typography. Caption: 1–2 lines + CTA to save.",
    agent: "CMO",
    priority: "low",
    impact: 1,
    dueDate: "2026-02-26",
    platform: "Instagram",
    content: {
      caption: "\"The best marketing doesn't feel like marketing.\" — Save this for Monday motivation 💚",
      hashtags: ["#MarketingQuotes", "#BrandBuilding", "#WeekendVibes", "#GeoVera"],
    },
  },
  {
    id: "feb26-ig2",
    title: "Instagram Post #2: Community Question — Weekend Engagement",
    description: "Post an interactive Instagram feed post for the weekend. Use an open question to drive comment engagement when organic reach peaks on weekends. Topic: brand challenges or goals for next week.",
    agent: "CMO",
    priority: "low",
    impact: 1,
    dueDate: "2026-02-26",
    platform: "Instagram",
    content: {
      caption: "What's your #1 brand goal for next week? Drop it below 👇 We'll give you a personalized tip for each one.",
      hashtags: ["#BrandGoals", "#CommunityFirst", "#MarketingChat", "#GeoVera"],
    },
  },
  {
    id: "feb26-tiktok",
    title: "TikTok: Tren Konten Indonesia Maret 2026 — Analisis AI GeoVera",
    description: "Buat TikTok 45–55 detik tentang tren konten Indonesia bulan Maret 2026 berdasarkan analisis AI GeoVera. Format: 3 tren utama dengan data visual, on-screen text, hook 'brand kamu sudah siap?'. Gunakan trending audio yang relevan.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-26",
    platform: "TikTok",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    content: {
      caption: "GeoVera AI sudah analisis 50.000+ konten TikTok Indonesia untuk Maret 2026. Hasilnya? Ada 5 format konten yang akan MELEDAK bulan depan! 📊🚀\n\nBrand kamu sudah siap memanfaatkan tren ini?",
      hashtags: ["#TrendAnalysis", "#TikTokTrends", "#MarketingIntelligence", "#GeoVera", "#Indonesia2026", "#ContentMarketing"],
    },
  },
  {
    id: "feb26-ceo1",
    title: "CEO Daily #1: Weekly Performance Review & Agent Briefing",
    description: "Review all agent outputs from this week. Score quality, engagement results, and strategic alignment. Brief the CMO agent on next week's content themes based on market intelligence. Approve the 5-day plan for Mar 2–6.",
    agent: "CEO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-26",
  },
  {
    id: "feb26-ceo2",
    title: "CEO Daily #2: Monthly Closing — Revenue & Growth Summary",
    description: "Compile end-of-week growth summary: follower growth, content reach, lead pipeline, and brand mention volume. Identify the top 3 growth drivers this week. Prepare a brief for the monthly review on Feb 28.",
    agent: "CEO",
    priority: "medium",
    impact: 2,
    dueDate: "2026-02-26",
  },

  // ══════════════════════════════════════════════════════
  // FEB 28 — END OF MONTH (YouTube Video — Enterprise)
  // ══════════════════════════════════════════════════════
  {
    id: "feb28-youtube",
    title: "YouTube Video: 'How GeoVera Builds a Full Brand Strategy in 24 Hours' (Monthly Special)",
    description: "Produce the monthly flagship YouTube video (8–15 min). Deep-dive walkthrough of GeoVera's AI pipeline: from brand onboarding → market analysis → content generation → publishing. Include real screen recordings, voiceover, and B-roll. This is the highest-production piece of the month — plan, script, record, edit, and publish.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-28",
    platform: "YouTube",
    imageUrl: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600&h=400&fit=crop",
    content: {
      caption: "Every month, we document how GeoVera builds a complete brand marketing strategy from scratch — in 24 hours. February edition: watch the full AI pipeline in action.",
      hashtags: ["#YouTube", "#GeoVera", "#AIMarketing", "#BrandStrategy", "#MonthlyContent", "#LongFormContent"],
      imageUrl: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600&h=400&fit=crop",
    },
  },
  {
    id: "feb28-ceo1",
    title: "CEO Monthly: Full Performance Report — February Recap",
    description: "Generate and review the full February performance report across all channels: Instagram, TikTok, Reels, Shorts, Medium, LinkedIn, X, Quora, Reddit. Summarize total reach, engagement rate, top content, and growth vs January. Share insights with stakeholders.",
    agent: "CEO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-28",
  },
  {
    id: "feb28-ceo2",
    title: "CEO Monthly: March Strategy & Budget Planning",
    description: "Based on February performance data, define the full March content and growth strategy. Set budget allocation across organic, paid, and influencer channels. Define March OKRs and share with all agents. This is the most important strategic task of the month.",
    agent: "CEO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-28",
  },

  // ══════════════════════════════════════════════════════
  // FEEDGUARDIAN — Daily Reply Queue (per day)
  // Premium: top 100 comments, mix Instagram + TikTok + X
  // Replies drafted by FeedGuardian, adapted by OpenAI
  // User reviews drafts → approve/edit/reject → publish
  // ══════════════════════════════════════════════════════
  {
    id: "feb23-feedguardian",
    title: "FeedGuardian: Review & Publish Top 100 Reply Queue",
    description: "FeedGuardian has pulled today's top 100 priority comments from Instagram, TikTok, and X — ranked by author influence score, comment sentiment, and engagement potential. Each reply has been drafted by FeedGuardian and adapted by OpenAI to sound natural and on-brand. Review drafts, edit if needed, approve, and publish in one click.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-23",
    taskType: "reply",
    platform: "Multi-platform",
    replyQueue: [
      { id: "r1", platform: "Instagram", platformIcon: "📸", author: "brandlover.id", authorScore: 96, comment: "This is exactly what I've been looking for! How do I get started with GeoVera?", draftReply: "So glad to hear that! Getting started is super easy — just head to geovera.xyz and you can be up and running in minutes. We'd love to have you 🌿 Feel free to DM us if you have any questions!", status: "pending" },
      { id: "r2", platform: "TikTok", platformIcon: "🎵", author: "marketingwithria", authorScore: 91, comment: "I've been manually doing all of this for years and it takes so much time 😭 game changer fr", draftReply: "We hear you — hours every week just gone 😩 That's exactly why we built GeoVera. Your time is better spent on strategy, not execution. Give it a try and let us know what you think! 💪", status: "pending" },
      { id: "r3", platform: "Instagram", platformIcon: "📸", author: "cmo.jakarta", authorScore: 89, comment: "What's the difference between Basic and Premium? Worth upgrading?", draftReply: "Great question! Premium unlocks your full AI team — CMO, CEO, Reels generation, LinkedIn posts, and multi-platform reply automation. If you're serious about growing your brand, Premium is absolutely worth it. DM us for a quick walkthrough! 😊", status: "pending" },
      { id: "r4", platform: "X (Twitter)", platformIcon: "𝕏", author: "startupfounder_id", authorScore: 87, comment: "Genuinely curious — does the AI actually sound like my brand or is it generic?", draftReply: "That's the most important question! GeoVera trains on your brand DNA — your voice, tone, story, and style. Every output is adapted through OpenAI to sound like you, not like a robot. We'd love to show you a demo 🎯", status: "pending" },
      { id: "r5", platform: "Instagram", platformIcon: "📸", author: "digitalmarketer.sg", authorScore: 85, comment: "This is fire 🔥 sharing with my whole team right now", draftReply: "You're amazing, thank you so much! 🙌 Hope your team loves it as much as you do. Tag us when you share — we'd love to see the reaction! 🌿", status: "pending" },
      { id: "r6", platform: "TikTok", platformIcon: "🎵", author: "contentcreator.bali", authorScore: 82, comment: "Can GeoVera handle multiple brands at once or just one?", draftReply: "Currently GeoVera is optimized for one brand per account, so each brand gets the full focused attention it deserves. Multi-brand support is on our roadmap though! 🗺️ Stay tuned and keep an eye on our updates.", status: "pending" },
      { id: "r7", platform: "Instagram", platformIcon: "📸", author: "umkmjakarta", authorScore: 80, comment: "Apakah ada versi Bahasa Indonesia? Kami UMKM lokal nih 🙏", draftReply: "Halo! Senang sekali ada UMKM lokal yang tertarik 🇮🇩 GeoVera sudah mendukung konten dalam Bahasa Indonesia. Brand DNA dan semua output bisa disesuaikan dengan bahasa dan tone yang paling cocok untuk bisnismu. Coba dulu gratis ya! 🌿", status: "pending" },
      { id: "r8", platform: "X (Twitter)", platformIcon: "𝕏", author: "techblogger.asia", authorScore: 77, comment: "How is this different from just using ChatGPT with a prompt?", draftReply: "Great question — ChatGPT is a tool, GeoVera is a full marketing system. We combine Perplexity research, Gemini indexing, Claude analysis, and GPT-4o editorial into one automated pipeline. Plus your brand DNA, competitor intelligence, and a content calendar. Very different! 🔧", status: "pending" },
    ],
  },
  {
    id: "feb24-feedguardian",
    title: "FeedGuardian: Review & Publish Top 100 Reply Queue",
    description: "Today's top 100 priority comments pulled from Instagram, TikTok, and X. Ranked by: author influence score (1–100), positive sentiment weight, and engagement velocity. Replies drafted by FeedGuardian + adapted by OpenAI for natural brand voice. Review, approve, and publish.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-24",
    taskType: "reply",
    platform: "Multi-platform",
    replyQueue: [
      { id: "r24-1", platform: "Instagram", platformIcon: "📸", author: "founderstory.id", authorScore: 94, comment: "Just signed up after watching your Reels. Love the concept!", draftReply: "Welcome to the GeoVera family! 🎉 You're going to love what your brand can do with an AI team by its side. Don't hesitate to reach out if you need any help getting set up — we're here for you! 🌿", status: "pending" },
      { id: "r24-2", platform: "TikTok", platformIcon: "🎵", author: "agencyowner.sg", authorScore: 90, comment: "Do you have an agency plan? I manage 10+ clients", draftReply: "We love hearing from agency owners! Agency/multi-client plans are on the roadmap 🚀 In the meantime, DM us — we'd love to explore how we can support your workflow right now. Let's chat! 💼", status: "pending" },
      { id: "r24-3", platform: "Instagram", platformIcon: "📸", author: "ecommerceid", authorScore: 88, comment: "Can this help with product launches specifically?", draftReply: "100% yes! Product launches are one of GeoVera's strongest use cases. Your AI CMO can plan the full launch content calendar, create the posts, write articles, and even auto-reply to comments on launch day. Game-changing for e-commerce 🚀", status: "pending" },
      { id: "r24-4", platform: "X (Twitter)", platformIcon: "𝕏", author: "martech.analyst", authorScore: 84, comment: "Interesting stack — what models are under the hood?", draftReply: "We love a good tech question 🤓 GeoVera runs a multi-model pipeline: Perplexity for discovery, Gemini for indexing, Claude for analysis, and GPT-4o for editorial + reply adaptation. Each step is optimized for what that model does best. Happy to go deeper if interested!", status: "pending" },
      { id: "r24-5", platform: "Instagram", platformIcon: "📸", author: "brandstrategy.co", authorScore: 81, comment: "The Brand DNA concept is brilliant. How does onboarding work?", draftReply: "Thank you so much! 🙏 Onboarding takes about 10 minutes — you fill in your brand story, values, tone, and upload your assets. From there, GeoVera trains everything into your Brand DNA and all outputs are personalized to your unique voice. Clean and simple!", status: "pending" },
      { id: "r24-6", platform: "TikTok", platformIcon: "🎵", author: "influencer.market", authorScore: 78, comment: "Does it work for personal brands too or just businesses?", draftReply: "Perfect for personal brands! 🌟 Whether you're a creator, coach, consultant, or founder — GeoVera helps you build a consistent, powerful personal brand across every platform. Your story, amplified by AI. Give it a try!", status: "pending" },
    ],
  },
  {
    id: "feb25-feedguardian",
    title: "FeedGuardian: Review & Publish Top 100 Reply Queue",
    description: "Today's top 100 priority comments across connected platforms. FeedGuardian ranks by: verified/high-follower accounts first, then sentiment score, then comment quality. Each draft reply adapted by OpenAI to match your brand DNA and sound naturally human. Review queue and publish approved replies.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-25",
    taskType: "reply",
    platform: "Multi-platform",
    replyQueue: [
      { id: "r25-1", platform: "Instagram", platformIcon: "📸", author: "startup.jakarta", authorScore: 93, comment: "We've been using GeoVera for 2 weeks and our engagement doubled. Not kidding.", draftReply: "This made our whole team smile 😊 Two weeks and 2× engagement — you're proof that the system works! Would love to feature your story (with permission of course). DM us? 🌿", status: "pending" },
      { id: "r25-2", platform: "TikTok", platformIcon: "🎵", author: "growthhacker.id", authorScore: 91, comment: "Is there a free trial or do I have to commit immediately?", draftReply: "We have a free onboarding experience so you can see GeoVera in action before committing! Head to geovera.xyz to get started — no credit card required for the initial setup. Try it out and see for yourself 🎯", status: "pending" },
      { id: "r25-3", platform: "Instagram", platformIcon: "📸", author: "fashionbrand.bali", authorScore: 86, comment: "Will GeoVera work for fashion/lifestyle brands specifically?", draftReply: "Fashion and lifestyle is one of our best fits! 👗 GeoVera's visual content planning, aesthetic-aware captions, and trend monitoring are made for brands like yours. Your LoRA-trained models even let us generate images that match your actual products. Perfect combo!", status: "pending" },
      { id: "r25-4", platform: "X (Twitter)", platformIcon: "𝕏", author: "saas.builder", authorScore: 83, comment: "Building something similar. Curious about your approach to brand voice consistency.", draftReply: "Love that you're building! Brand voice consistency is our core obsession 🎯 We solve it with Brand DNA — a persistent profile of your tone, personality, language patterns, and storytelling style. Every AI output passes through that filter before it reaches you. Happy to compare notes!", status: "pending" },
      { id: "r25-5", platform: "Instagram", platformIcon: "📸", author: "marketingdirector", authorScore: 80, comment: "How many posts can the AI generate per day?", draftReply: "On Premium, your AI team generates 7+ pieces of content daily — 2 long articles, 2 short posts, 2 Instagram posts, and 1 Reels/TikTok/Shorts. Plus your CEO handles 2 strategic tasks. All reviewed by you before publishing. Volume without the chaos! 📅", status: "pending" },
    ],
  },
  {
    id: "feb26-feedguardian",
    title: "FeedGuardian: Review & Publish Top 100 Reply Queue",
    description: "End-of-week reply queue — today's top 100 priority comments from all connected platforms. Weekend comments tend to come from highly engaged followers and casual browsers. FeedGuardian has prioritized warm, community-building tones. OpenAI has adapted each reply to feel conversational and genuine. Review and publish before EOD.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-26",
    taskType: "reply",
    platform: "Multi-platform",
    replyQueue: [
      { id: "r26-1", platform: "Instagram", platformIcon: "📸", author: "weekendfounder", authorScore: 88, comment: "Just discovered GeoVera through a friend. Is this real or too good to be true? 😅", draftReply: "Haha we get this a lot! 😄 It's very real — and the best way to see for yourself is to try it. Head to geovera.xyz for a free look. We think you'll be impressed. Your friend has good taste! 🌿", status: "pending" },
      { id: "r26-2", platform: "TikTok", platformIcon: "🎵", author: "fridaymktg", authorScore: 85, comment: "What's your biggest differentiator vs Hootsuite, Buffer, etc?", draftReply: "Great question! Hootsuite and Buffer help you schedule content you've already created. GeoVera actually creates the content for you — articles, captions, visuals, replies — using AI trained on your brand. It's the difference between a tool and a team. 🤝", status: "pending" },
      { id: "r26-3", platform: "Instagram", platformIcon: "📸", author: "brandcoach.asia", authorScore: 82, comment: "I recommend this to all my clients now. Keep it up! 💚", draftReply: "This is the best kind of comment to end the week with 💚 Thank you so much — your support and recommendations genuinely mean the world to us. If there's ever anything we can do for you or your clients, we're always here!", status: "pending" },
      { id: "r26-4", platform: "X (Twitter)", platformIcon: "𝕏", author: "digitalstrategy.io", authorScore: 79, comment: "How do you handle brand safety and off-brand content?", draftReply: "Brand safety is built into every layer of GeoVera 🛡️ Your Brand DNA acts as a guardrail — no output goes live without passing through your voice and value filters. Plus you review and approve every piece before it publishes. You're always in control.", status: "pending" },
      { id: "r26-5", platform: "Instagram", platformIcon: "📸", author: "smm.freelancer", authorScore: 75, comment: "Will this replace my job as a social media manager? 😬", draftReply: "Not at all — it changes your job for the better! 🙌 Instead of spending 80% of your time on execution (writing, scheduling, replying), GeoVera handles that so you can focus on strategy, client relationships, and the creative work that actually moves the needle. You become the director, not the doer.", status: "pending" },
    ],
  },
  {
    id: "feb28-feedguardian",
    title: "FeedGuardian: End-of-Month Review — Top 150 Reply Queue",
    description: "End-of-month special: top 150 priority comments pulled from all platforms including the YouTube Video published today. February's most important community interactions — including comments on the monthly video, high-value DM mentions, and verified account replies. FeedGuardian + OpenAI adapted replies for warm, brand-authentic tone. This queue has the highest potential impact of the month.",
    agent: "CMO",
    priority: "high",
    impact: 3,
    dueDate: "2026-02-28",
    taskType: "reply",
    platform: "Multi-platform",
    replyQueue: [
      { id: "r28-1", platform: "Instagram", platformIcon: "📸", author: "verified.brand.id", authorScore: 99, comment: "We've been watching GeoVera grow all month. Incredible journey — let's collab!", draftReply: "Wow, this means a lot coming from you 🙏 We've been huge fans of your work too. Absolutely open to exploring a collaboration — this could be something really special. DM us directly and let's make it happen! 💚", status: "pending" },
      { id: "r28-2", platform: "TikTok", platformIcon: "🎵", author: "viralcreator.id", authorScore: 95, comment: "Your YouTube video was insane. The AI pipeline walkthrough blew my mind.", draftReply: "Thank you so much! 🤯 We wanted to pull back the curtain and show exactly how the intelligence layer works. So glad it landed! More deep-dives coming next month — make sure you're subscribed so you don't miss them 🎬", status: "pending" },
      { id: "r28-3", platform: "Instagram", platformIcon: "📸", author: "marketing.kol", authorScore: 92, comment: "Just signed up for Premium after seeing the February results. You earned it.", draftReply: "Welcome to Premium! 🎉 You're in for a completely different experience. Your full AI team — CEO + CMO + FeedGuardian — is now active. Reach out anytime if you need help setting things up. So excited to see your brand grow! 🌿", status: "pending" },
      { id: "r28-4", platform: "X (Twitter)", platformIcon: "𝕏", author: "vc.analyst.sea", authorScore: 90, comment: "Interesting product. What's your moat long term?", draftReply: "Great question for end of month 😄 Our moat is Brand DNA — the deeper a brand uses GeoVera, the more personalized and accurate the AI becomes. It's a compounding advantage. Plus our multi-model pipeline is continuously upgraded. The product gets smarter as you use it.", status: "pending" },
      { id: "r28-5", platform: "Instagram", platformIcon: "📸", author: "startup.mentor.id", authorScore: 87, comment: "February was clearly a big month for you. What's March looking like?", draftReply: "March is going to be even bigger! 🚀 We're rolling out some major new features and expanding platform integrations. Follow along — you won't want to miss what's coming. February was just the beginning 💪", status: "pending" },
      { id: "r28-6", platform: "TikTok", platformIcon: "🎵", author: "contentfarm.creator", authorScore: 83, comment: "How do I know the AI replies won't sound robotic?", draftReply: "That's the most important question and we take it very seriously 🎯 Every reply goes through two layers: FeedGuardian drafts it based on your brand DNA, then OpenAI adapts it to sound natural, warm, and genuinely human. You also review everything before it posts. Zero robot vibes, guaranteed.", status: "pending" },
    ],
  },
];

type TaskFilter = "inprogress" | "done";

export default function CalendarPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [doneTaskIds, setDoneTaskIds] = useState<Set<string>>(new Set());
  const [doneExpanded, setDoneExpanded] = useState(true);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("inprogress");

  const taskDates = useMemo(() => demoTasks.map((t) => t.dueDate), []);

  const filteredTasks = useMemo(() => {
    if (selectedDate) {
      // Klik tanggal tertentu → tampilkan tasks tanggal itu (termasuk history)
      return demoTasks.filter((t) => t.dueDate === selectedDate);
    }
    // Default: tampilkan tasks dari hari ini hingga 2 hari ke depan
    // + semua tasks lampau yang belum selesai (overdue, belum di-done)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysAhead = new Date(today);
    twoDaysAhead.setDate(today.getDate() + 2);
    return demoTasks.filter((t) => {
      const taskDate = new Date(t.dueDate + "T00:00:00");
      // Tampilkan jika: task hari ini/2 hari ke depan, ATAU task lampau belum done
      return taskDate <= twoDaysAhead;
    });
  }, [selectedDate]);

  // Split active vs done
  const activeTasks = filteredTasks.filter((t) => !doneTaskIds.has(t.id));
  const doneTasks = filteredTasks.filter((t) => doneTaskIds.has(t.id));

  const highTasks = activeTasks.filter((t) => t.priority === "high");
  const mediumTasks = activeTasks.filter((t) => t.priority === "medium");
  const lowTasks = activeTasks.filter((t) => t.priority === "low");

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
    setSelectedTask(null);
  };

  const handlePublish = (taskId: string) => {
    setDoneTaskIds((prev) => new Set([...prev, taskId]));
  };

  const left = (
    <NavColumn>
      <h3
        className="text-sm font-semibold text-gray-900 dark:text-white px-1"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Calendar
      </h3>

      {/* Show selected date info below heading */}
      {selectedDate ? (
        <div className="px-1 mt-1 mb-3">
          <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => { setSelectedDate(null); setSelectedTask(null); }}
            className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-1 underline"
          >
            Clear selection
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400 px-1 mt-1 mb-3">
          Showing today + 2 days ahead. Tap a date to see history.
        </p>
      )}

      <MiniCalendar
        taskDates={taskDates}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
    </NavColumn>
  );

  const center = (
    <div className="flex flex-col h-full">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-2 pt-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="text-lg font-semibold text-gray-900 dark:text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Tasks"}
            </h2>
            {/* Active / Total counter */}
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {activeTasks.length}/{filteredTasks.length}
            </span>
            {doneTasks.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:bg-green-500/10 dark:text-green-400">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {doneTasks.length} done
              </span>
            )}
          </div>
          {/* On Progress / Done filter pills */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 flex-shrink-0">
            <button
              onClick={() => setTaskFilter("inprogress")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                taskFilter === "inprogress"
                  ? "bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              On Progress
            </button>
            <button
              onClick={() => setTaskFilter("done")}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                taskFilter === "done"
                  ? "bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
      {/* ── Scrollable tasks body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1">

      {/* ── ON PROGRESS view ── */}
      {taskFilter === "inprogress" && (
        activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">All tasks completed!</p>
            <p className="text-xs text-gray-400 mt-1">Switch to Done to review published tasks</p>
            <button
              onClick={() => setTaskFilter("done")}
              className="mt-2 text-xs text-brand-500 hover:text-brand-600"
            >
              View Done →
            </button>
          </div>
        ) : (
          <>
            <PrioritySection priority="high" tasks={highTasks} selectedTaskId={selectedTask?.id || null} onTaskSelect={setSelectedTask} />
            <PrioritySection priority="medium" tasks={mediumTasks} selectedTaskId={selectedTask?.id || null} onTaskSelect={setSelectedTask} />
            <PrioritySection priority="low" tasks={lowTasks} selectedTaskId={selectedTask?.id || null} onTaskSelect={setSelectedTask} />
          </>
        )
      )}

      {/* ── DONE view ── */}
      {taskFilter === "done" && (
        doneTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No completed tasks yet</p>
            <p className="text-xs text-gray-400 mt-1">Publish tasks to see them here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {doneTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`w-full text-left rounded-xl border p-2.5 transition-all opacity-70 ${
                  selectedTask?.id === task.id
                    ? "border-green-300 bg-green-50/50 dark:border-green-500/30 dark:bg-green-500/5 opacity-100"
                    : "border-gray-200 bg-gray-50 hover:opacity-90 dark:border-gray-800 dark:bg-gray-900/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Published
                      </span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        task.agent === "CEO"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                          : "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                      }`}>
                        {task.agent}
                      </span>
                      {task.platform && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {task.platform}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-500 leading-tight line-through">
                      {task.title}
                    </h4>
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

  const right = <TaskDetailPanel task={selectedTask} onPublish={handlePublish} />;

  return <ThreeColumnLayout left={left} center={center} right={right} />;
}
