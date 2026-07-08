'use client';

import { useCallback, useRef, useState } from 'react';

interface Props {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

const SAMPLES = [
  { name: 'Facebook Lead Export', filename: 'facebook_lead_export.csv' },
  { name: 'Google Ads Export', filename: 'google_ads_leads.csv' },
  { name: 'Real Estate CRM', filename: 'realestate_crm_export.csv' },
];

export default function FileUploader({ onFileSelect, isLoading, error }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const dropBorder = isDragging ? 'var(--accent)' : error ? 'var(--conf-lo)' : 'var(--border-strong)';
  const dropBg = isDragging ? 'var(--accent-soft)' : 'var(--surface)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dropBorder}`,
          borderRadius: 20,
          background: dropBg,
          padding: '56px 28px',
          textAlign: 'center',
          transition: 'background 0.15s, border-color 0.15s',
          cursor: isLoading ? 'wait' : 'default',
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <span style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid var(--surface-3)',
              borderTopColor: 'var(--accent)',
              display: 'inline-block',
            }} className="animate-spin" />
            <div style={{ fontSize: 16, fontWeight: 600 }}>Parsing CSV…</div>
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <div style={{
              width: 60, height: 60, margin: '0 auto 20px',
              borderRadius: 16, background: 'var(--accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent-fg)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4" />
                <polyline points="7 9 12 4 17 9" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            </div>

            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
              {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV here'}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 22 }}>or</div>

            <button
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 12,
                border: 'none', background: 'var(--accent)', color: 'var(--on-accent)',
                fontSize: 14, fontWeight: 600,
                boxShadow: 'var(--shadow)',
              }}
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleInputChange}
              id="csv-file-input"
            />

            {/* Sample files */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <div style={{
                fontSize: 11, fontWeight: 500, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14,
              }}>
                or try a sample export
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {SAMPLES.map(s => (
                  <button
                    key={s.filename}
                    onClick={() => {
                      // Create a synthetic File object from sample name for the state machine
                      const dummyFile = new File(['name,email\nSample,sample@test.com'], s.filename, { type: 'text/csv' });
                      handleFile(dummyFile);
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 16px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text)', fontSize: 12.5, fontWeight: 500,
                      boxShadow: 'var(--shadow)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 12, padding: '12px 16px',
          borderRadius: 10, background: 'color-mix(in srgb, var(--conf-lo) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--conf-lo) 30%, transparent)',
          color: 'var(--conf-lo)', fontSize: 13, fontWeight: 500,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
