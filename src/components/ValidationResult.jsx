'use client';

function getScoreClass(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

function ScoreGauge({ score }) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const progress = ((100 - score) / 100) * circumference;
    const scoreClass = getScoreClass(score);

    return (
        <div className="score-gauge">
            <div className="score-ring">
                <svg width="100" height="100">
                    <circle
                        className="score-ring-bg"
                        cx="50"
                        cy="50"
                        r={radius}
                    />
                    <circle
                        className={`score-ring-progress ${scoreClass}`}
                        cx="50"
                        cy="50"
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={progress}
                    />
                </svg>
                <span className="score-value">{score}</span>
            </div>
            <span className="score-label">Completeness</span>
        </div>
    );
}

export default function ValidationResult({ result, modelUsed, processingTime }) {
    if (!result) {
        return (
            <div className="validation-result">
                <div className="empty-state">
                    <div className="empty-icon">○</div>
                    <h3 className="empty-title">No Validation Results</h3>
                    <p className="empty-subtitle">
                        Click "Validate" to analyze this evidence with AI.
                    </p>
                </div>
            </div>
        );
    }

    const {
        evidence_type,
        mapped_control,
        completeness_score,
        extracted_data,
        issues,
        score_reasoning,
    } = result;

    return (
        <div className="validation-result">
            <div className="validation-header">
                <div>
                    <h3 style={{ marginBottom: 'var(--space-xs)', fontSize: '1rem' }}>{evidence_type}</h3>
                    <div className="flex gap-sm items-center">
                        <span className="badge badge-framework">{mapped_control?.framework}</span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            {mapped_control?.control_id} – {mapped_control?.control_name}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    <div>{modelUsed}</div>
                    {processingTime && <div>{(processingTime / 1000).toFixed(2)}s</div>}
                </div>
            </div>

            <div className="validation-body">
                <div className="validation-section">
                    <ScoreGauge score={completeness_score || 0} />

                    <div className="mt-md">
                        <h4 className="validation-section-title">Reasoning</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
                            {score_reasoning || 'No reasoning provided.'}
                        </p>
                    </div>
                </div>

                <div className="validation-section">
                    {issues && issues.length > 0 && (
                        <div>
                            <h4 className="validation-section-title">Issues ({issues.length})</h4>
                            <div className="issues-list mt-md">
                                {issues.map((issue, index) => (
                                    <div key={index} className="issue-item">
                                        <span className="issue-icon">–</span>
                                        <span>
                                            {typeof issue === 'object' ? (
                                                <>
                                                    {issue.risk_level && <strong>[{issue.risk_level}] </strong>}
                                                    {issue.issue_description || JSON.stringify(issue)}
                                                </>
                                            ) : (
                                                issue
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {extracted_data && Object.keys(extracted_data).length > 0 && (
                        <div className="mt-lg">
                            <h4 className="validation-section-title">Extracted Data</h4>
                            <div className="extracted-data mt-md">
                                <pre>{JSON.stringify(extracted_data, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
