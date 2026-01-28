'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await signUp(email, password);

            if (error) {
                setError(error.message);
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-lg)',
            }}>
                <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
                    <span style={{
                        fontStyle: 'italic',
                        fontWeight: 700,
                        fontSize: '2rem',
                        letterSpacing: '-0.05em',
                        color: 'var(--text-primary)'
                    }}>CE</span>
                    <h2 style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)' }}>
                        Check your email
                    </h2>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-lg)' }}>
                        We've sent a confirmation link to {email}
                    </p>
                    <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

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
                    }}>Create your account</p>
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

                    <div style={{ marginBottom: 'var(--space-md)' }}>
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

                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="label">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {isLoading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-tertiary)'
                }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--text-primary)' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
