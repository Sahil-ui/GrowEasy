'use client';

import { ParsedCSV } from '../../types';

interface Props {
  data: ParsedCSV;
  fileName: string;
  fileSize: number;
  onConfirm: () => void;
  onReset: () => void;
  isProcessing?: boolean;
}

const PREVIEW_ROWS = 100;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CSVPreview({ data, fileName, fileSize, onConfirm, onReset, isProcessing }: Props) {
  const previewRows = data.rows.slice(0, PREVIEW_ROWS);

  return (
    <div className="animate-fadeup">
      {/* File info card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 15,
        padding: '18px 22px', marginBottom: 26,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, boxShadow: 'var(--shadow)',
      }}>
        <div style={{
          flexShrink: 0, width: 44, height: 44, borderRadius: 12,
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
            stroke="var(--accent-fg)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fileName}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
            {formatSize(fileSize)} · {data.totalRows} rows · {data.headers.length} columns detected
          </div>
        </div>
        <button
          onClick={onReset}
          disabled={isProcessing}
          style={{
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 15px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-2)', fontSize: 12.5, fontWeight: 500,
          }}
        >
          Replace
        </button>
      </div>

      {/* Raw preview table */}
      <section style={{ marginBottom: 26 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 16, marginBottom: 15, flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>Raw preview</h2>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-2)' }}>
              Your file exactly as uploaded — original column names, no changes.
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 13px', borderRadius: 99,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            fontSize: 12, fontWeight: 500, color: 'var(--text-2)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--text-3)', display: 'inline-block' }} />
            No AI processing yet
          </span>
        </div>

        <div style={{
          border: '1px solid var(--border)', borderRadius: 16,
          overflow: 'hidden', boxShadow: 'var(--shadow)', background: 'var(--surface)',
        }}>
          <div style={{ maxHeight: 340, overflow: 'auto', position: 'relative' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', minWidth: 1080 }}>
              <thead>
                <tr>
                  <th style={{
                    position: 'sticky', top: 0, zIndex: 3,
                    background: 'var(--surface-2)', padding: '12px 16px',
                    textAlign: 'left', fontSize: 10.5, letterSpacing: '0.04em',
                    textTransform: 'uppercase', color: 'var(--text-3)',
                    borderBottom: '1px solid var(--border)', fontWeight: 600, width: 42,
                  }}>#</th>
                  {data.headers.map(col => (
                    <th key={col} style={{
                      position: 'sticky', top: 0, zIndex: 3,
                      background: 'var(--surface-2)', padding: '12px 16px',
                      textAlign: 'left', fontSize: 10.5, letterSpacing: '0.04em',
                      textTransform: 'uppercase', color: 'var(--text-2)',
                      borderBottom: '1px solid var(--border)',
                      whiteSpace: 'nowrap', fontWeight: 600,
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} style={{ background: 'var(--surface)' }}>
                    <td style={{
                      padding: '11px 16px', borderBottom: '1px solid var(--border)',
                      fontSize: 11.5, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums',
                    }}>{i + 1}</td>
                    {data.headers.map(h => {
                      const val = row[h];
                      const isEmpty = !val || val.trim() === '';
                      return (
                        <td key={h} style={{
                          padding: '11px 16px', borderBottom: '1px solid var(--border)',
                          whiteSpace: 'nowrap', fontSize: 12.5,
                          color: isEmpty ? 'var(--text-3)' : 'var(--text)',
                          maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {isEmpty ? '—' : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {data.totalRows > PREVIEW_ROWS && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>
            Showing {PREVIEW_ROWS} of {data.totalRows} rows
          </p>
        )}
      </section>

      {/* Confirm & extract */}
      <section style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 18, flexWrap: 'wrap', padding: '22px 24px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, boxShadow: 'var(--shadow)', marginBottom: 26,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{
            flexShrink: 0, width: 42, height: 42, borderRadius: 12,
            background: 'var(--accent-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="var(--accent-fg)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a9 9 0 1 0 9 9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Ready to extract</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {data.totalRows} records — sent to AI for mapping
            </div>
          </div>
        </div>
        <button
          id="confirm-import-btn"
          onClick={onConfirm}
          disabled={isProcessing}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '13px 24px', borderRadius: 12,
            border: 'none', background: 'var(--accent)', color: 'var(--on-accent)',
            fontSize: 14.5, fontWeight: 600,
            boxShadow: 'var(--shadow)',
            opacity: isProcessing ? 0.6 : 1,
          }}
        >
          Confirm &amp; extract with AI
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </section>
    </div>
  );
}
