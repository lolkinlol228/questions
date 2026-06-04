import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_PROJECT_ID')) {
  console.warn('Supabase env variables are not configured. Create .env.local from .env.example.');
}

export const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'missing-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const ADMIN_REQUIRE_AUTH = import.meta.env.VITE_ADMIN_REQUIRE_AUTH !== 'false';
export const SURVEY_VERSION = import.meta.env.VITE_SURVEY_VERSION || '2';
