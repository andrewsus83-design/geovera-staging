/**
 * GeoVera Intelligence Platform - Environment Variable Loader
 * Loads environment variables at runtime for HTML pages
 *
 * USAGE: Include this script BEFORE any other scripts:
 * <script src="env-loader.js"></script>
 *
 * SECURITY: This replaces hardcoded credentials with environment-based loading
 */

(function() {
  'use strict';

  // Initialize global ENV object
  window.ENV = window.ENV || {};

  // Try to load from meta tags (preferred method for static sites)
  const loadFromMeta = () => {
    const supabaseUrl = document.querySelector('meta[name="supabase-url"]');
    const supabaseKey = document.querySelector('meta[name="supabase-anon-key"]');
    const appUrl = document.querySelector('meta[name="app-url"]');

    if (supabaseUrl) window.ENV.VITE_SUPABASE_URL = supabaseUrl.content;
    if (supabaseKey) window.ENV.VITE_SUPABASE_ANON_KEY = supabaseKey.content;
    if (appUrl) window.ENV.VITE_APP_URL = appUrl.content;
  };

  // Try to load from window._env_ (injected by build process)
  const loadFromWindow = () => {
    if (window._env_) {
      Object.assign(window.ENV, window._env_);
    }
  };

  // Load configuration
  loadFromMeta();
  loadFromWindow();

  // Validation
  const isConfigured = window.ENV.VITE_SUPABASE_URL && window.ENV.VITE_SUPABASE_ANON_KEY;

  if (!isConfigured) {
    console.error('========================');
    console.error('CONFIGURATION ERROR');
    console.error('========================');
    console.error('Supabase credentials not configured!');
    console.error('');
    console.error('To fix this, add meta tags to your HTML:');
    console.error('<meta name="supabase-url" content="your-url">');
    console.error('<meta name="supabase-anon-key" content="your-key">');
    console.error('');
    console.error('Or inject window._env_ object before loading scripts.');
    console.error('========================');
  }

  // Helper function to get config values
  window.getEnvConfig = () => ({
    SUPABASE_URL: window.ENV.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: window.ENV.VITE_SUPABASE_ANON_KEY || '',
    APP_URL: window.ENV.VITE_APP_URL || 'https://geovera.xyz'
  });

  console.log('Environment loaded:', isConfigured ? 'SUCCESS' : 'FAILED');
})();
