'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

export default function SettingsPage() {
    const [healthStatus, setHealthStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        try {
            const response = await fetch('/api/health');
            const result = await response.json();
            setHealthStatus(result);
        } catch (error) {
            setHealthStatus({ success: false, error: 'Health check failed' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Configure your ControlEvidence AI instance</p>
            </div>

            {/* AI Provider Section */}
            <div className="settings-section">
                <div className="settings-section-title">AI Provider</div>
                <div className="card">
                    {isLoading ? (
                        <div className="skeleton" style={{ height: '80px' }} />
                    ) : (
                        <>
                            <div className="settings-item">
                                <span className="settings-item-label">Active Provider</span>
                                <span className="settings-item-value">
                                    {healthStatus?.activeProvider?.toUpperCase() || 'Unknown'}
                                </span>
                            </div>
                            <div className="settings-item">
                                <span className="settings-item-label">Status</span>
                                <span className="settings-item-value">
                                    {healthStatus?.services?.ai?.available ? '● Connected' : '○ Disconnected'}
                                </span>
                            </div>
                            {healthStatus?.services?.ai?.models && (
                                <div className="settings-item">
                                    <span className="settings-item-label">Model</span>
                                    <span className="settings-item-value">
                                        {healthStatus.services.ai.models[0] || 'Default'}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Storage Section */}
            <div className="settings-section">
                <div className="settings-section-title">Storage</div>
                <div className="card">
                    <div className="settings-item">
                        <span className="settings-item-label">Provider</span>
                        <span className="settings-item-value">Supabase Storage</span>
                    </div>
                    <div className="settings-item">
                        <span className="settings-item-label">Status</span>
                        <span className="settings-item-value">
                            {healthStatus?.services?.database ? '● Connected' : '○ Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="settings-section">
                <div className="settings-section-title">About</div>
                <div className="card">
                    <div className="settings-item">
                        <span className="settings-item-label">Application</span>
                        <span className="settings-item-value">ControlEvidence AI</span>
                    </div>
                    <div className="settings-item">
                        <span className="settings-item-label">Version</span>
                        <span className="settings-item-value">0.1.0</span>
                    </div>
                    <div className="settings-item">
                        <span className="settings-item-label">Frameworks</span>
                        <span className="settings-item-value">SOC 2, ISO 27001, SOX ITGC, NIST CSF</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
