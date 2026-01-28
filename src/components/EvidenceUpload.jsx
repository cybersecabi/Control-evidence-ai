'use client';

import { useState, useRef } from 'react';

export default function EvidenceUpload({ onUploadComplete }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleUpload = async (file) => {
        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/evidence', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            if (onUploadComplete) {
                onUploadComplete(result.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <div
                className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="upload-icon">↑</div>
                <h3 className="upload-title">
                    {isUploading ? 'Uploading...' : 'Drop files here'}
                </h3>
                <p className="upload-subtitle">
                    or click to browse
                </p>
                <div className="upload-formats">
                    <span className="format-tag">CSV</span>
                    <span className="format-tag">PNG</span>
                    <span className="format-tag">JPG</span>
                    <span className="format-tag">PDF</span>
                    <span className="format-tag">TXT</span>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".csv,.png,.jpg,.jpeg,.pdf,.txt,.json,.xlsx,.xls"
                style={{ display: 'none' }}
            />

            {error && (
                <div style={{
                    marginTop: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    );
}
