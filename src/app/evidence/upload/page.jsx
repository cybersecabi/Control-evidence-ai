'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import EvidenceUpload from '@/components/EvidenceUpload';

export default function UploadPage() {
    const router = useRouter();

    const handleUploadComplete = (evidence) => {
        router.push(`/evidence/${evidence.id}`);
    };

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Upload Evidence</h1>
                <p className="page-subtitle">Add new compliance evidence for AI-powered validation</p>
            </div>

            <div className="card">
                <EvidenceUpload onUploadComplete={handleUploadComplete} />

                <div className="mt-lg" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>Supported Evidence Types</h3>
                    <div className="flex gap-lg" style={{ flexWrap: 'wrap' }}>
                        {[
                            { icon: '◫', name: 'CSV Files', desc: 'User access lists, audit logs' },
                            { icon: '▣', name: 'Screenshots', desc: 'MFA settings, admin panels' },
                            { icon: '≡', name: 'Text Files', desc: 'Policies, procedures' },
                            { icon: '▤', name: 'PDF Documents', desc: 'Certifications, reports' },
                        ].map(item => (
                            <div key={item.name} className="flex gap-md items-center" style={{ flex: '1 1 200px' }}>
                                <span style={{ fontSize: '1.25rem', opacity: 0.6 }}>{item.icon}</span>
                                <div>
                                    <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                                    <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-tertiary)' }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card mt-lg">
                <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>What Happens After Upload?</h3>
                <div className="flex gap-lg" style={{ flexWrap: 'wrap' }}>
                    {[
                        { num: '1', title: 'Upload & Store', desc: 'Securely stored in Supabase Storage' },
                        { num: '2', title: 'AI Analysis', desc: 'Analyzed by Gemini or local Ollama' },
                        { num: '3', title: 'Review Results', desc: 'Structured JSON with control mapping' },
                    ].map(step => (
                        <div key={step.num} style={{ flex: '1 1 200px' }}>
                            <div className="flex items-center gap-sm mb-sm">
                                <span style={{
                                    width: '24px',
                                    height: '24px',
                                    background: 'var(--white)',
                                    color: 'var(--black)',
                                    borderRadius: 'var(--radius-full)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                }}>{step.num}</span>
                                <strong style={{ fontSize: '0.9rem' }}>{step.title}</strong>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
