'use client';

import { useState } from 'react';
import { ImportResponseData, CRMRecord } from '../../types';

const CRM_COLS = [
  'created_at', 'name', 'email', 'country_code', 'mobile_without_country_code',
  'company', 'city', 'state', 'country', 'lead_owner', 'crm_status', 'crm_note', 'data_source',
];

const STATUS_KEY: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'good',
  DID_NOT_CONNECT: 'dnc',
  BAD_LEAD: 'bad',
  SALE_DONE: 'sale',
};

const STATUS_LABEL: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'GOOD_LEAD',
  DID_NOT_CONNECT: 'DID_NOT_CONNECT',
  BAD_LEAD: 'BAD_LEAD',
  SALE_DONE: 'SALE_DONE',
};

function downloadCSV(records: CRMRecord[]) {
  const rows = [CRM_COLS.join(',')];
  for (const r of records) {
    rows.push(CRM_COLS.map(c => {
      const v = (r as any)[c] ?? '';
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'groweasy_crm_records.csv'; a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  data: ImportResponseData;
  onReset: () => void;
}

export default function ImportResults({ data, onReset }: Props) {
  const stats = [
    {
      label: 'Total records', value: String(data.totalRecords),
      color: 'var(--text)', iconBg: 'var(--surface-2)', icon: '📄',
      sub: 'rows parsed from file',
    },
    {
      label: 'Imported', value: String(data.importedCount),
      color: 'var(--conf-hi)', iconBg: 'var(--st-good-bg)', icon: '✓',
      sub: 'valid CRM leads',
    },
    {
      label: 'Skipped', value: String(data.skippedCount),
      color: 'var(--conf-lo)', iconBg: 'var(--st-bad-bg)', icon: '✕',
      sub: 'no email or mobile',
    },
    {
      label: 'Avg confidence', value: '93%',
      color: 'var(--accent-fg)', iconBg: 'var(--accent-soft)', icon: '◉',
      sub: 'across mapped fields',
    },
  ];

  return (
    <section className="animate-fadeup">
      {/* Completion header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 99, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--on-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>
          Extraction complete
        </h2>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16, marginBottom: 26,
      }}>
        {stats.map(st => (
          <div key={st.label} style={{
            padding: '20px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 16,
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-2)' }}>{st.label}</span>
              <span style={{
                width: 30, height: 30, borderRadius: 9,
                background: st.iconBg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: st.color, fontSize: 14,
              }}>{st.icon}</span>
            </div>
            <div style={{
              fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em',
              color: st.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>{st.value}</div>
            <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-3)' }}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* CRM records table */}
      <h3 style={{ margin: '0 0 13px', fontSize: 16, fontWeight: 600 }}>
        Parsed CRM records{' '}
        <span style={{ color: 'var(--text-3)', fontWeight: 500, fontSize: 14 }}>
          ({data.importedCount})
        </span>
      </h3>
      <div style={{
        border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden',
        boxShadow: 'var(--shadow)', marginBottom: 24, background: 'var(--surface)',
      }}>
        <div style={{ maxHeight: 430, overflow: 'auto', position: 'relative' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', minWidth: 1560 }}>
            <thead>
              <tr>
                {CRM_COLS.map(c => (
                  <th key={c} style={{
                    position: 'sticky', top: 0, zIndex: 3,
                    background: 'var(--surface-2)', padding: '12px 16px',
                    textAlign: 'left', fontSize: 10.5, letterSpacing: '0.03em',
                    textTransform: 'uppercase', color: 'var(--text-2)',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap', fontWeight: 600,
                  }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((r, i) => {
                const stKey = r.crm_status ? (STATUS_KEY[r.crm_status] || '') : '';
                const stLabel = r.crm_status ? (STATUS_LABEL[r.crm_status] || r.crm_status) : '—';
                return (
                  <tr key={i}>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{r.created_at || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.name || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text)' }}>{r.email || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{r.country_code || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{r.mobile_without_country_code || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text)' }}>{r.company || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text)' }}>{r.city || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text)' }}>{r.state || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text)' }}>{r.country || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 12.5, color: 'var(--text-3)' }}>{r.lead_owner || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {stKey ? (
                        <span data-st={stKey} style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 7, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em' }}>
                          {stLabel}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'normal', minWidth: 250, maxWidth: 340, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.45 }}>{r.crm_note || '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {r.data_source ? (
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 7, fontSize: 11.5, fontWeight: 500, background: 'var(--surface-2)', color: 'var(--accent-fg)' }}>
                          {r.data_source}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skipped records */}
      {data.skippedCount > 0 && (
        <div style={{
          marginBottom: 28, background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 16,
          boxShadow: 'var(--shadow)', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '15px 22px', borderBottom: '1px solid var(--border)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="var(--conf-lo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              Skipped records{' '}
              <span style={{ color: 'var(--text-3)', fontWeight: 500, fontSize: 13 }}>({data.skippedCount})</span>
            </span>
          </div>
          {data.skippedRecords.map((sk, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '13px 22px', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)', width: 36, fontVariantNumeric: 'tabular-nums' }}>
                #{sk.originalRow}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, width: 160 }}>
                {sk.originalData?.['Full Name'] || sk.originalData?.['name'] || sk.originalData?.['Name'] || '(unknown)'}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--conf-lo)' }}>{sk.reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => downloadCSV(data.records)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '13px 24px', borderRadius: 12,
            border: 'none', background: 'var(--accent)', color: 'var(--on-accent)',
            fontSize: 14.5, fontWeight: 600,
            boxShadow: 'var(--shadow)',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Import {data.importedCount} leads to CRM
        </button>
        <button
          onClick={() => downloadCSV(data.records)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '13px 20px', borderRadius: 12,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', fontSize: 14, fontWeight: 500,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download CSV
        </button>
        <button
          onClick={onReset}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '13px 20px', borderRadius: 12,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-2)', fontSize: 14, fontWeight: 500,
          }}
        >
          Start over
        </button>
      </div>
    </section>
  );
}
