'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

const AuthContext = createContext({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createBrowserClient();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);

                // Force refresh on sign in/out to update middleware state
                if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                    window.location.reload();
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        const supabase = createBrowserClient();
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
