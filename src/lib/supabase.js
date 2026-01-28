import { createClient } from '@supabase/supabase-js';

// Browser client (uses anon key)
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
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

// Singleton browser client for client components
let browserClient = null;

export function getSupabase() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabase should only be called on the client side');
  }
  
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  
  return browserClient;
}
