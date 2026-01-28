import { createClient } from '@supabase/supabase-js';

// Singleton browser client
let browserClient = null;

// Browser client (uses anon key) - SINGLETON
export function createBrowserClient() {
  if (typeof window === 'undefined') {
    // Server-side: create new instance each time
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }

  // Client-side: return singleton
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

// Server client (uses service role key for admin operations)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Alias for backward compatibility
export const getSupabase = createBrowserClient;
