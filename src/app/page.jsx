'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import EvidenceCard from '@/components/EvidenceCard';
import Link from 'next/link';

export default function Dashboard() {
    const [evidence, setEvidence] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        validated: 0,
        failed: 0,
        avgScore: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [healthStatus, setHealthStatus] = useState(null);

    useEffect(() => {
        fetchData();
        checkHealth();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/evidence?limit=6');
            const result = await response.json();

            if (result.success) {
                setEvidence(result.data || []);
                calculateStats(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching evidence:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data) => {
        const pending = data.filter(e => e.status === 'pending').length;
        const validated = data.filter(e => e.status === 'validated').length;
        const failed = data.filter(e => e.status === 'failed').length;

        const scores = data
            .filter(e => e.ai_validation_results?.[0]?.result_json?.completeness_score)
            .map(e => e.ai_validation_results[0].result_json.completeness_score);

        const avgScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        setStats({
            total: data.length,
            pending,
            validated,
            failed,
            avgScore,
        });
    };

    const checkHealth = async () => {
        try {
            const response = await fetch('/api/health');
            const result = await response.json();
            setHealthStatus(result);
        } catch (error) {
            setHealthStatus({ success: false, error: 'Health check failed' });
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">AI-powered compliance evidence management</p>
            </div>

            {/* Health Status Banner */}
            {healthStatus && (
                <div className="card mb-lg" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md)'
                }}>
                    <span style={{ opacity: 0.6 }}>
                        {healthStatus.services?.ai?.available ? '●' : '○'}
                    </span>
                    <div>
                        <strong style={{ fontSize: '0.9rem' }}>
                            {healthStatus.activeProvider?.toUpperCase() || 'AI Provider'}
                        </strong>
                        <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-tertiary)' }}>
                            {healthStatus.services?.ai?.available
                                ? 'Connected and ready'
                                : 'Not connected'
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">◫</span>
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Evidence</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">○</span>
                    <span className="stat-value">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">●</span>
                    <span className="stat-value">{stats.validated}</span>
                    <span className="stat-label">Validated</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">◐</span>
                    <span className="stat-value">{stats.avgScore}%</span>
                    <span className="stat-label">Avg. Score</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-md mb-lg">
                <Link href="/evidence/upload" className="btn btn-primary">
                    ↑ Upload Evidence
                </Link>
                <Link href="/evidence" className="btn btn-secondary">
                    View All
                </Link>
            </div>

            {/* Recent Evidence */}
            <div className="card">
                <div className="flex justify-between items-center mb-lg">
                    <h2>Recent Evidence</h2>
                    <Link href="/evidence" className="btn btn-ghost btn-sm">
                        View All →
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex gap-md">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: '160px', flex: 1 }} />
                        ))}
                    </div>
                ) : evidence.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">◫</div>
                        <h3 className="empty-title">No Evidence Yet</h3>
                        <p className="empty-subtitle">
                            Upload your first evidence file to get started with AI-powered validation.
                        </p>
                        <Link href="/evidence/upload" className="btn btn-primary mt-md">
                            Upload Evidence
                        </Link>
                    </div>
                ) : (
                    <div className="evidence-grid">
                        {evidence.map(item => (
                            <EvidenceCard key={item.id} evidence={item} />
                        ))}
                    </div>
                )}
            </div>

            {/* Framework Coverage */}
            <div className="card mt-lg">
                <h2 className="mb-lg">Supported Frameworks</h2>
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    {[
                        { name: 'SOC 2', desc: 'Trust Services Criteria' },
                        { name: 'ISO 27001', desc: 'Information Security' },
                        { name: 'SOX ITGC', desc: 'IT General Controls' },
                        { name: 'NIST CSF', desc: 'Cybersecurity Framework' },
                    ].map(fw => (
                        <div
                            key={fw.name}
                            style={{
                                flex: '1 1 180px',
                                padding: 'var(--space-md)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <strong style={{ fontSize: '0.9rem' }}>{fw.name}</strong>
                            <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-tertiary)' }}>{fw.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
