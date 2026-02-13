// =====================================================
// GeoVera Seed Data Generator Edge Function
// =====================================================
// Purpose: Generate comprehensive test data via API
// Target: 1000 creators, 200 brands, 10K hashtags, 5K content

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Indonesian name pools
const INDONESIAN_FIRST_NAMES = [
  "Adi", "Budi", "Citra", "Dewi", "Eka", "Fitri", "Gita", "Hana", 
  "Indra", "Joko", "Kartika", "Lina", "Maya", "Nanda", "Oki", "Putri",
  "Rahmat", "Sari", "Tika", "Umar", "Vina", "Wati", "Yuni", "Zahra",
  "Ayu", "Bambang", "Candra", "Dian", "Erna", "Fajar"
];

const INDONESIAN_LAST_NAMES = [
  "Pratama", "Sari", "Wijaya", "Kusuma", "Santoso", "Lestari", "Putra",
  "Putri", "Nugroho", "Wibowo", "Susanto", "Rahayu", "Setiawan", 
  "Permata", "Cahaya", "Indah", "Utama", "Jaya", "Surya", "Bulan"
];

const CATEGORIES = [
  "Beauty", "F&B", "Fashion", "FMCG", "Gadget", "Finance", 
  "Health", "Mom & Baby", "Shoes", "Watches"
];

const PLATFORMS = ["Instagram", "TikTok", "YouTube"];

const TIERS = ["Mega", "Macro", "Micro"];

// Generate realistic Indonesian creator handle
function generateHandle(firstName: string, lastName: string): string {
  const patterns = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `official.${firstName.toLowerCase()}`,
    `${firstName.toLowerCase()}.id`
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

// Generate follower count based on tier
function getFollowerCount(tier: string): number {
  if (tier === "Mega") return Math.floor(Math.random() * 5000000) + 1000000; // 1M - 6M
  if (tier === "Macro") return Math.floor(Math.random() * 900000) + 100000; // 100K - 1M
  return Math.floor(Math.random() * 90000) + 10000; // 10K - 100K
}

// Generate engagement rate (micro has higher)
function getEngagementRate(tier: string): number {
  if (tier === "Mega") return (Math.random() * 3 + 2); // 2-5%
  if (tier === "Macro") return (Math.random() * 4 + 4); // 4-8%
  return (Math.random() * 6 + 6); // 6-12%
}

// Generate trending hashtags
function generateHashtags(count: number, category: string): any[] {
  const baseHashtags: Record<string, string[]> = {
    "Beauty": ["skincare", "makeup", "beauty", "glowup", "selfcare", "tutorial", "review"],
    "F&B": ["foodie", "kuliner", "makanenak", "jajanankekinian", "food", "recipe"],
    "Fashion": ["ootd", "fashion", "style", "fashionista", "outfit", "trendy"],
    "FMCG": ["dailyessentials", "homecare", "grocery", "shopping"],
    "Gadget": ["tech", "gadget", "review", "unboxing", "smartphone"],
    "Finance": ["fintech", "investment", "savings", "money", "finance"],
    "Health": ["health", "wellness", "fitness", "workout", "healthy"],
    "Mom & Baby": ["mom", "baby", "parenting", "kids", "family"],
    "Shoes": ["sneakers", "shoes", "footwear", "kicks", "sneakerhead"],
    "Watches": ["watches", "timepiece", "luxury", "horology"]
  };

  const base = baseHashtags[category] || ["trending", "viral"];
  const hashtags = [];
  
  for (let i = 0; i < count; i++) {
    const tag = base[Math.floor(Math.random() * base.length)];
    const year = "2026";
    const suffix = Math.random() > 0.5 ? "indonesia" : "id";
    hashtags.push(`#${tag}${suffix}${year}${i}`);
  }
  
  return hashtags;
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { mode = "full", target = "all" } = await req.json();

    const results: any = {
      brands_created: 0,
      creators_created: 0,
      hashtags_created: 0,
      content_created: 0,
      mindshare_created: 0,
      trendshare_created: 0,
      errors: []
    };

    // ==========================================
    // STEP 1: CREATE 200 BRANDS (Brand Universe)
    // ==========================================
    if (target === "all" || target === "brands") {
      console.log("Creating 200 brands...");
      
      const brandsToCreate: any[] = [];
      const brandsPerCategory = Math.floor(200 / CATEGORIES.length);
      
      for (const category of CATEGORIES) {
        for (let i = 0; i < brandsPerCategory; i++) {
          const brandNames: Record<string, string[]> = {
            "Beauty": ["Glow", "Bella", "Radiant", "Pure", "Luxe", "Viva"],
            "F&B": ["Kopi", "Rasa", "Dapur", "Makan", "Kedai", "Warung"],
            "Fashion": ["Style", "Trend", "Chic", "Vogue", "Mode"],
            "FMCG": ["Daily", "Home", "Fresh", "Clean", "Pure"],
            "Gadget": ["Tech", "Smart", "Digital", "Pixel", "Byte"],
            "Finance": ["Money", "Invest", "Wealth", "Fund", "Capital"],
            "Health": ["Vita", "Fit", "Health", "Well", "Care"],
            "Mom & Baby": ["Mama", "Baby", "Kids", "Little", "Tiny"],
            "Shoes": ["Walk", "Step", "Stride", "Kick", "Sole"],
            "Watches": ["Time", "Chrono", "Watch", "Tempo", "Hour"]
          };

          const prefixes = brandNames[category] || ["Brand"];
          const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
          const suffix = ["Indo", "Asia", "Global", "Pro", "Plus", "Max"][Math.floor(Math.random() * 6)];
          
          brandsToCreate.push({
            brand_name: `${prefix} ${suffix} ${category} ${i + 1}`,
            category: category,
            priority_score: Math.random() * 100,
            market_position: ["leader", "challenger", "follower"][Math.floor(Math.random() * 3)],
            created_at: new Date().toISOString()
          });
        }
      }

      const { error: brandsError } = await supabase
        .from("gv_brand_universe")
        .insert(brandsToCreate);

      if (brandsError) {
        results.errors.push(`Brands: ${brandsError.message}`);
      } else {
        results.brands_created = brandsToCreate.length;
      }
    }

    // ==========================================
    // STEP 2: CREATE 1000 CREATORS
    // ==========================================
    if (target === "all" || target === "creators") {
      console.log("Creating 1000 creators...");
      
      const creatorsToCreate: any[] = [];
      const creatorsPerTier: Record<string, number> = {
        "Mega": 100,
        "Macro": 300,
        "Micro": 600
      };

      for (const tier of TIERS) {
        for (let i = 0; i < creatorsPerTier[tier]; i++) {
          const firstName = INDONESIAN_FIRST_NAMES[Math.floor(Math.random() * INDONESIAN_FIRST_NAMES.length)];
          const lastName = INDONESIAN_LAST_NAMES[Math.floor(Math.random() * INDONESIAN_LAST_NAMES.length)];
          const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
          const followerCount = getFollowerCount(tier);
          const engagementRate = getEngagementRate(tier);

          creatorsToCreate.push({
            creator_handle: generateHandle(firstName, lastName),
            creator_name: `${firstName} ${lastName}`,
            platform: platform,
            category: category,
            tier: tier,
            follower_count: followerCount,
            avg_engagement_rate: engagementRate,
            overall_score: Math.min(100, engagementRate * 8 + Math.random() * 20),
            engagement_score: engagementRate * 10,
            authenticity_score: Math.random() * 100,
            growth_score: Math.random() * 100,
            monthly_growth_rate: Math.random() * 10,
            trending_direction: ["up", "stable", "down"][Math.floor(Math.random() * 3)],
            percentile: Math.random() * 100,
            snapshot_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          });
        }
      }

      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < creatorsToCreate.length; i += batchSize) {
        const batch = creatorsToCreate.slice(i, i + batchSize);
        const { error } = await supabase
          .from("gv_creator_leaderboards")
          .insert(batch);

        if (error) {
          results.errors.push(`Creators batch ${i}: ${error.message}`);
        } else {
          results.creators_created += batch.length;
        }
      }
    }

    // ==========================================
    // STEP 3: CREATE 5000 TRENDING CONTENT
    // ==========================================
    if (target === "all" || target === "content") {
      console.log("Creating 5000 trending content...");
      
      const contentToCreate: any[] = [];
      
      for (let i = 0; i < 5000; i++) {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
        const views = Math.floor(Math.random() * 5000000);
        const engagement = Math.random() * 15;
        
        contentToCreate.push({
          platform: platform,
          content_type: ["video", "image", "carousel"][Math.floor(Math.random() * 3)],
          category: category,
          total_views: views,
          total_engagement: Math.floor(views * (engagement / 100)),
          engagement_rate: engagement,
          viral_score: Math.min(100, (views / 50000) + (engagement * 5)),
          share_velocity: Math.random() * 100,
          hashtags: generateHashtags(5, category),
          trending_rank: i + 1,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < contentToCreate.length; i += batchSize) {
        const batch = contentToCreate.slice(i, i + batchSize);
        const { error } = await supabase
          .from("gv_trending_content")
          .insert(batch);

        if (error) {
          results.errors.push(`Content batch ${i}: ${error.message}`);
        } else {
          results.content_created += batch.length;
        }
      }
    }

    // ==========================================
    // STEP 4: CREATE MINDSHARE DATA (10K records)
    // ==========================================
    if (target === "all" || target === "mindshare") {
      console.log("Creating mindshare data...");
      
      // Get all brands and creators first
      const { data: brands } = await supabase
        .from("gv_brand_universe")
        .select("id, brand_name, category")
        .limit(200);

      const { data: creators } = await supabase
        .from("gv_creator_leaderboards")
        .select("creator_handle, creator_name, platform, follower_count")
        .limit(1000);

      if (brands && creators) {
        const mindshareToCreate: any[] = [];
        
        // Create ~50 mindshare entries per brand
        for (const brand of brands.slice(0, 200)) {
          const relevantCreators = creators
            .filter(c => Math.random() > 0.95) // Random 5% creators per brand
            .slice(0, 50);

          for (const creator of relevantCreators) {
            const totalMentions = Math.floor(Math.random() * 50) + 1;
            const positivePct = Math.random();
            
            mindshareToCreate.push({
              brand_id: brand.id,
              author_handle: creator.creator_handle,
              author_name: creator.creator_name,
              platform: creator.platform,
              follower_count: creator.follower_count,
              credibility_score: Math.random() * 100,
              total_mentions: totalMentions,
              positive_mentions: Math.floor(totalMentions * positivePct),
              neutral_mentions: Math.floor(totalMentions * (1 - positivePct) * 0.7),
              negative_mentions: Math.floor(totalMentions * (1 - positivePct) * 0.3),
              avg_engagement_rate: Math.random() * 15,
              total_reach: Math.floor(creator.follower_count * (Math.random() * 0.5)),
              mindshare_pct: Math.random() * 10,
              advocate_tier: ["champion", "supporter", "neutral", "critic"][Math.floor(Math.random() * 4)],
              is_active: Math.random() > 0.2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            if (mindshareToCreate.length >= 100) {
              const { error } = await supabase
                .from("gv_mindshare")
                .insert(mindshareToCreate.splice(0, 100));
              
              if (error) {
                results.errors.push(`Mindshare: ${error.message}`);
              } else {
                results.mindshare_created += 100;
              }
            }
          }
        }

        // Insert remaining
        if (mindshareToCreate.length > 0) {
          const { error } = await supabase
            .from("gv_mindshare")
            .insert(mindshareToCreate);
          
          if (!error) results.mindshare_created += mindshareToCreate.length;
        }
      }
    }

    // ==========================================
    // STEP 5: CREATE TRENDSHARE DATA (1K records)
    // ==========================================
    if (target === "all" || target === "trendshare") {
      console.log("Creating trendshare data...");
      
      const { data: brands } = await supabase
        .from("gv_brand_universe")
        .select("id, brand_name, category")
        .limit(200);

      if (brands) {
        const trendshareToCreate: any[] = [];
        
        // Create trendshare for each brand x platform combination
        for (const brand of brands) {
          for (const platform of PLATFORMS) {
            const categoryRank = Math.floor(Math.random() * 50) + 1;
            const posts = Math.floor(Math.random() * 5000) + 100;
            
            trendshareToCreate.push({
              brand_id: brand.id,
              platform: platform,
              category: brand.category,
              category_rank: categoryRank,
              total_branded_posts: posts,
              brand_total_reach: Math.floor(Math.random() * 10000000),
              brand_engagement_rate: Math.random() * 15,
              trendshare_pct: Math.random() * 20,
              prev_trendshare_pct: Math.random() * 20,
              trendshare_delta: (Math.random() - 0.5) * 10,
              trending_hashtags: generateHashtags(10, brand.category),
              trend_velocity: Math.random() * 100,
              participation_score: Math.random() * 100,
              snapshot_date: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }

        // Insert in batches
        const batchSize = 100;
        for (let i = 0; i < trendshareToCreate.length; i += batchSize) {
          const batch = trendshareToCreate.slice(i, i + batchSize);
          const { error } = await supabase
            .from("gv_trendshare")
            .insert(batch);

          if (error) {
            results.errors.push(`Trendshare batch ${i}: ${error.message}`);
          } else {
            results.trendshare_created += batch.length;
          }
        }
      }
    }

    return new Response(JSON.stringify(results, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
