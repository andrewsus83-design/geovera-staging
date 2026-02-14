/**
 * GeoVera Intelligence Platform - Configuration Module
 * Centralizes environment variable access for frontend
 *
 * SECURITY: This file loads from environment variables instead of hardcoded values
 */

// Check if we're in a build environment with Vite
const isViteBuild = typeof import.meta !== 'undefined' && import.meta.env;

// Configuration object
const config = {
  supabase: {
    url: isViteBuild
      ? import.meta.env.VITE_SUPABASE_URL
      : window.ENV?.VITE_SUPABASE_URL || '',
    anonKey: isViteBuild
      ? import.meta.env.VITE_SUPABASE_ANON_KEY
      : window.ENV?.VITE_SUPABASE_ANON_KEY || ''
  },
  app: {
    url: isViteBuild
      ? import.meta.env.VITE_APP_URL
      : window.ENV?.VITE_APP_URL || 'https://geovera.xyz'
  }
};

// Validation - warn if credentials are missing
if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('CRITICAL: Supabase credentials not configured!');
  console.error('Please ensure environment variables are set:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
}

// Export for use in HTML files
if (typeof window !== 'undefined') {
  window.GeoVeraConfig = config;
}

// Export for ES modules
export default config;
