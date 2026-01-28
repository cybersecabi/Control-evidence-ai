'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ValidationResult from '@/components/ValidationResult';
import Link from 'next/link';

function formatBytes(bytes) {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function EvidenceDetailPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();

    const [evidence, setEvidence] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvidence();
    }, [id]);

    const fetchEvidence = async () => {
        try {
            const response = await fetch(`/api/evidence/${id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch evidence');
            }

            setEvidence(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async () => {
        setIsValidating(true);
        setError(null);

        try {
            const response = await fetch('/api/evidence/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ evidence_item_id: id }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Validation failed');
            }

            // Refresh evidence data
            await fetchEvidence();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsValidating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this evidence?')) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/evidence/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete evidence');
            }

            router.push('/evidence');
        } catch (err) {
            setError(err.message);
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="skeleton" style={{ height: '100px', marginBottom: 'var(--space-lg)' }} />
                <div className="skeleton" style={{ height: '300px' }} />
            </Layout>
        );
    }

    if (error && !evidence) {
        return (
            <Layout>
                <div className="empty-state">
                    <div className="empty-icon">❌</div>
                    <h3 className="empty-title">Error Loading Evidence</h3>
                    <p className="empty-subtitle">{error}</p>
                    <Link href="/evidence" className="btn btn-primary mt-md">
                        Back to Evidence
                    </Link>
                </div>
            </Layout>
        );
    }

    const latestResult = evidence?.ai_validation_results?.[0];

    return (
        <Layout>
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <Link href="/evidence" style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                            ← Back to Evidence
                        </Link>
                        <h1 className="page-title" style={{ marginTop: 'var(--space-sm)' }}>
                            {evidence.file_name}
                        </h1>
                        <p className="page-subtitle">
                            {formatBytes(evidence.file_size)} • Uploaded {formatDate(evidence.uploaded_at)}
                        </p>
                    </div>
                    <div className="flex gap-md">
                        <button
                            onClick={handleValidate}
                            disabled={isValidating}
                            className="btn btn-primary"
                        >
                            {isValidating ? (
                                <>
                                    <span className="loading-spinner" />
                                    Validating...
                                </>
                            ) : (
                                <>
                                    <span>🤖</span>
                                    {latestResult ? 'Re-validate' : 'Validate'}
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="btn btn-danger"
                        >
                            {isDeleting ? 'Deleting...' : '🗑️ Delete'}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: 'var(--space-md)',
                    background: 'var(--danger-soft)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-lg)',
                    color: 'var(--danger)',
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Evidence Info Card */}
            <div className="card mb-lg">
                <div className="flex gap-lg items-center">
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                    }}>
                        {evidence.file_type?.startsWith('image/') ? '🖼️' :
                            evidence.file_type?.includes('csv') ? '📊' :
                                evidence.file_type?.includes('pdf') ? '📄' : '📝'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="flex gap-md items-center mb-sm">
                            <span className={`badge badge-${evidence.status}`}>
                                {evidence.status}
                            </span>
                            {evidence.detected_evidence_type && (
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {evidence.detected_evidence_type}
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', margin: 0 }}>
                            Type: {evidence.file_type} • Size: {formatBytes(evidence.file_size)}
                        </p>
                    </div>
                    {evidence.file_url && (
                        <a
                            href={evidence.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                        >
                            <span>⬇️</span> Download
                        </a>
                    )}
                </div>

                {/* Image Preview */}
                {evidence.file_type?.startsWith('image/') && evidence.file_url && (
                    <div style={{ marginTop: 'var(--space-lg)' }}>
                        <img
                            src={evidence.file_url}
                            alt={evidence.file_name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Validation Results */}
            <h2 className="mb-md">Validation Results</h2>
            <ValidationResult
                result={latestResult?.result_json}
                modelUsed={latestResult?.model_used}
                processingTime={latestResult?.processing_time_ms}
            />

            {/* Validation History */}
            {evidence.ai_validation_results?.length > 1 && (
                <div className="card mt-lg">
                    <h3 className="mb-md">Validation History</h3>
                    <div className="flex flex-col gap-md">
                        {evidence.ai_validation_results.slice(1).map((result, index) => (
                            <div
                                key={result.id}
                                style={{
                                    padding: 'var(--space-md)',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <strong>{result.result_json?.evidence_type || 'Unknown'}</strong>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>
                                            {formatDate(result.created_at)} • Score: {result.result_json?.completeness_score || 0}%
                                        </p>
                                    </div>
                                    <span className="badge badge-framework">
                                        {result.result_json?.mapped_control?.framework || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Layout>
    );
}
