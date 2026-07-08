'use client';

import { useEffect, useState } from 'react';

export default function ProgressIndicator() {
  const [progress, setProgress] = useState(0);

  // Simulate progress visually while backend is working
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) return prev; // stall near end, waiting for real response
        return prev + (Math.random() * 3 + 1);
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const pct = Math.round(Math.min(progress, 92));
  const doneCount = Math.min(3, Math.floor(pct / 34));

  const batches = [
    { n: 1, range: 'rows 1–10' },
    { n: 2, range: 'rows 11–20' },
    { n: 3, range: 'rows 21+' },
  ].map((b, i) => {
    let state = 'pending';
    if (i < doneCount) state = 'done';
    else if (i === doneCount) state = 'active';

    return {
      ...b,
      state,
      border: state === 'done' ? 'var(--st-good-bg)' : state === 'active' ? 'var(--accent)' : 'var(--border)',
      bg: state === 'done' ? 'var(--st-good-bg)' : state === 'active' ? 'var(--accent-soft)' : 'var(--surface-2)',
      dot: state === 'done' ? 'var(--conf-hi)' : state === 'active' ? 'var(--accent)' : 'var(--text-3)',
      fg: state === 'pending' ? 'var(--text-2)' : 'var(--text)',
      status: state === 'done' ? 'done' : state === 'active' ? 'processing…' : 'queued',
      isPulsing: state === 'active',
    };
  });

  return (
    <section className="animate-fadeup" style={{
      marginBottom: 26, padding: '32px 28px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 18, boxShadow: 'var(--shadow)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <span className="animate-spin" style={{
          width: 22, height: 22, borderRadius: '50%',
          border: '3px solid var(--surface-3)', borderTopColor: 'var(--accent)',
          display: 'inline-block', flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Extracting CRM fields with AI…</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
            Batch {Math.min(3, doneCount + 1)} of 3 · mapping columns to GrowEasy schema
          </div>
        </div>
        <span style={{
          marginLeft: 'auto', fontSize: 26, fontWeight: 700,
          color: 'var(--accent-fg)', fontVariantNumeric: 'tabular-nums',
        }}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 9, borderRadius: 99, background: 'var(--surface-2)',
        overflow: 'hidden', marginBottom: 22,
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 99,
          background: 'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 55%, white))',
          transition: 'width 0.3s linear',
        }} />
      </div>

      {/* Batch status cards */}
      <div style={{ display: 'flex', gap: 11, flexWrap: 'wrap' }}>
        {batches.map(b => (
          <div key={b.n} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 15px', borderRadius: 11,
            border: `1px solid ${b.border}`, background: b.bg,
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%', background: b.dot,
              display: 'inline-block',
              ...(b.isPulsing ? { animation: 'gz-pulse 1s ease-in-out infinite' } : {}),
            }} />
            <span style={{ fontSize: 12.5, fontWeight: 500, color: b.fg }}>
              Batch {b.n} · {b.range}
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{b.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
