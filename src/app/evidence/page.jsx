'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import EvidenceCard from '@/components/EvidenceCard';
import Link from 'next/link';

export default function EvidenceListPage() {
    const [evidence, setEvidence] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchEvidence();
    }, []);

    const fetchEvidence = async () => {
        try {
            const response = await fetch('/api/evidence?limit=50');
            const result = await response.json();

            if (result.success) {
                setEvidence(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching evidence:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEvidence = filter === 'all'
        ? evidence
        : evidence.filter(e => e.status === filter);

    const statusCounts = {
        all: evidence.length,
        pending: evidence.filter(e => e.status === 'pending').length,
        validated: evidence.filter(e => e.status === 'validated').length,
        failed: evidence.filter(e => e.status === 'failed').length,
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="page-title">Evidence Library</h1>
                        <p className="page-subtitle">Manage and validate your compliance evidence</p>
                    </div>
                    <Link href="/evidence/upload" className="btn btn-primary">
                        ↑ Upload New
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-sm mb-lg">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'validated', label: 'Validated' },
                    { key: 'failed', label: 'Failed' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        {tab.label}
                        <span style={{
                            marginLeft: 'var(--space-sm)',
                            opacity: 0.6,
                            fontSize: '0.8rem',
                        }}>
                            {statusCounts[tab.key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Evidence Grid */}
            {isLoading ? (
                <div className="evidence-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton" style={{ height: '180px' }} />
                    ))}
                </div>
            ) : filteredEvidence.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">◫</div>
                    <h3 className="empty-title">
                        {filter === 'all' ? 'No Evidence Found' : `No ${filter} Evidence`}
                    </h3>
                    <p className="empty-subtitle">
                        {filter === 'all'
                            ? 'Upload your first evidence file to get started.'
                            : `There are no evidence items with status "${filter}".`}
                    </p>
                    {filter === 'all' && (
                        <Link href="/evidence/upload" className="btn btn-primary mt-md">
                            Upload Evidence
                        </Link>
                    )}
                </div>
            ) : (
                <div className="evidence-grid">
                    {filteredEvidence.map(item => (
                        <EvidenceCard key={item.id} evidence={item} />
                    ))}
                </div>
            )}
        </Layout>
    );
}
