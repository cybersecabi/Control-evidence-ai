import { createBrowserClient, createServerClient } from './supabase';

// Get current user on client side
export async function getCurrentUser() {
    const supabase = createBrowserClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

// Get current session on client side
export async function getSession() {
    const supabase = createBrowserClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

// Sign up with email and password
export async function signUp(email, password) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

// Sign in with email and password
export async function signIn(email, password) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

// Sign out
export async function signOut() {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signOut();
    return { error };
}

// Get user from request headers (for API routes)
export async function getUserFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: 'No authorization header' };
    }

    const token = authHeader.substring(7);
    const supabase = createServerClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);
    return { user, error };
}
