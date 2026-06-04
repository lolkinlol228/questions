import { createClient } from '@supabase/supabase-js';

// Fallback values are used if the Vercel env vars are missing.
// These are public by design (the project URL and the Supabase publishable key
// always ship inside the client bundle), so committing them is safe.
const FALLBACK_SUPABASE_URL = 'https://xxbbdkiedshmemwptxio.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_h3zreN6CLsSYfZOSsRSYzg_jCSaX0bH';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

function cleanEnv(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '');
}

function normalizeSupabaseUrl(value) {
  const raw = cleanEnv(value);
  if (!raw || raw.includes('YOUR_PROJECT_ID')) return '';

  const candidate = /^[a-z0-9-]{15,}$/.test(raw) && !raw.includes('.')
    ? `https://${raw}.supabase.co`
    : raw;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.origin;
  } catch {
    return '';
  }
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = cleanEnv(rawSupabaseAnonKey);

let configError = '';

if (!supabaseUrl) {
  configError = 'Supabase URL is not configured correctly. In Vercel set VITE_SUPABASE_URL to https://YOUR_PROJECT_REF.supabase.co';
} else if (!supabaseAnonKey || supabaseAnonKey.includes('YOUR_ANON_KEY')) {
  configError = 'Supabase anon key is not configured. In Vercel set VITE_SUPABASE_ANON_KEY to your Supabase anon public key.';
}

function disabledResult() {
  return {
    data: null,
    error: {
      code: 'SUPABASE_CONFIG_ERROR',
      message: configError || 'Supabase is not configured.'
    }
  };
}

function disabledQuery() {
  const query = {
    insert: async () => disabledResult(),
    select: () => query,
    order: () => query,
    range: async () => disabledResult()
  };
  return query;
}

function disabledClient() {
  return {
    from: () => disabledQuery(),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => disabledResult(),
      signOut: async () => ({ error: null })
    }
  };
}

let supabaseClient;

if (configError) {
  console.warn(configError);
  supabaseClient = disabledClient();
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    configError = `Supabase client could not start: ${error.message}`;
    console.warn(configError);
    supabaseClient = disabledClient();
  }
}

export const supabase = supabaseClient;
export const SUPABASE_CONFIG_ERROR = configError;

export const ADMIN_REQUIRE_AUTH = import.meta.env.VITE_ADMIN_REQUIRE_AUTH !== 'false';
export const SURVEY_VERSION = import.meta.env.VITE_SURVEY_VERSION || '2';
