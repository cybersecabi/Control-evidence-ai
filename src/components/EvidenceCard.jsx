'use client';

import Link from 'next/link';

function getFileIcon(fileType) {
    if (fileType?.includes('csv') || fileType?.includes('spreadsheet')) return { icon: '◫', className: 'csv' };
    if (fileType?.startsWith('image/')) return { icon: '▣', className: 'image' };
    if (fileType?.includes('pdf')) return { icon: '▤', className: 'pdf' };
    return { icon: '≡', className: 'text' };
}

function getScoreClass(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

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
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function EvidenceCard({ evidence }) {
    const { icon, className } = getFileIcon(evidence.file_type);
    const latestResult = evidence.ai_validation_results?.[0]?.result_json;
    const completenessScore = latestResult?.completeness_score;
    const scoreClass = completenessScore !== undefined ? getScoreClass(completenessScore) : null;

    return (
        <Link href={`/evidence/${evidence.id}`} style={{ textDecoration: 'none' }}>
            <div className="evidence-card">
                <div className="evidence-card-header">
                    <div className={`evidence-file-icon ${className}`}>{icon}</div>
                    <div className="evidence-info">
                        <h4 className="evidence-name">{evidence.file_name}</h4>
                        <p className="evidence-meta">
                            {formatBytes(evidence.file_size)} · {formatDate(evidence.uploaded_at)}
                        </p>
                    </div>
                    <span className={`badge badge-${evidence.status}`}>
                        {evidence.status}
                    </span>
                </div>

                <div className="evidence-card-body">
                    {evidence.detected_evidence_type && (
                        <p className="evidence-type">{evidence.detected_evidence_type}</p>
                    )}

                    {latestResult?.mapped_control && (
                        <div className="evidence-control">
                            <span className="badge badge-framework">
                                {latestResult.mapped_control.framework}
                            </span>
                            <span>{latestResult.mapped_control.control_id}</span>
                        </div>
                    )}

                    {completenessScore !== undefined && (
                        <div className="evidence-score">
                            <div className="score-bar">
                                <div
                                    className={`score-bar-fill ${scoreClass}`}
                                    style={{ width: `${completenessScore}%` }}
                                />
                            </div>
                            <span className="score-text">{completenessScore}%</span>
                        </div>
                    )}

                    {latestResult?.issues?.length > 0 && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            {latestResult.issues.length} issue{latestResult.issues.length !== 1 ? 's' : ''} found
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}
