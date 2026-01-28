'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const supabase = createBrowserClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
                return;
            }

            // Hard redirect after successful login
            window.location.href = '/';
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-lg)',
        }}>
            <div style={{ width: '100%', maxWidth: '360px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <span style={{
                        fontStyle: 'italic',
                        fontWeight: 700,
                        fontSize: '2rem',
                        letterSpacing: '-0.05em',
                        color: 'var(--text-primary)'
                    }}>CE</span>
                    <p style={{
                        color: 'var(--text-tertiary)',
                        marginTop: 'var(--space-sm)',
                        fontSize: '0.9rem'
                    }}>Sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: 'var(--space-md)',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-md)',
                            fontSize: '0.9rem',
                            border: '1px solid var(--border-subtle)',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: 'var(--space-md)' }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-tertiary)'
                }}>
                    Don't have an account?{' '}
                    <Link href="/signup" style={{ color: 'var(--text-primary)' }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
