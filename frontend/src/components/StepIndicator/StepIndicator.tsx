'use client';

import { AppStep } from '../../types';

const STEPS = [
  { n: 1, label: 'Upload' },
  { n: 2, label: 'Preview' },
  { n: 3, label: 'Import' },
  { n: 4, label: 'Results' },
];

// Map our AppStep enum to a step number
function stepToNum(step: AppStep): number {
  switch (step) {
    case 'IDLE': return 1;
    case 'FILE_SELECTED': return 2;
    case 'PREVIEWING': return 2;
    case 'PROCESSING': return 3;
    case 'RESULTS': return 4;
    case 'ERROR': return 1;
    default: return 1;
  }
}

interface Props { currentStep: AppStep; }

export default function StepIndicator({ currentStep }: Props) {
  const currentNum = stepToNum(currentStep);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      marginBottom: 34, padding: '18px 24px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 18,
      boxShadow: 'var(--shadow)',
      overflowX: 'auto',
    }}>
      {STEPS.map((s, i) => {
        const state = s.n < currentNum ? 'done' : s.n === currentNum ? 'active' : 'pending';
        const isLast = i === STEPS.length - 1;

        const ring = state !== 'pending' ? 'var(--accent)' : 'var(--border-strong)';
        const badgeBg = state === 'done' ? 'var(--accent)' : state === 'active' ? 'var(--accent-soft)' : 'var(--surface-2)';
        const badgeFg = state === 'done' ? 'var(--on-accent)' : state === 'active' ? 'var(--accent-fg)' : 'var(--text-3)';
        const labelColor = state === 'pending' ? 'var(--text-3)' : 'var(--text)';
        const connector = state === 'done' ? 'var(--accent)' : 'var(--border)';

        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 13, flex: 1, minWidth: 155 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                flexShrink: 0, width: 30, height: 30, borderRadius: 99,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
                border: `2px solid ${ring}`,
                background: badgeBg, color: badgeFg,
              }}>
                {state === 'done' ? '✓' : String(s.n)}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                  Step {s.n}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: labelColor }}>
                  {s.label}
                </span>
              </div>
            </div>
            {!isLast && (
              <div style={{ flex: 1, height: 2, minWidth: 20, borderRadius: 99, background: connector }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
