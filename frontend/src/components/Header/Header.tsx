'use client';

import { useTheme } from '../../hooks/useDarkMode';

export default function Header() {
  const { isDark, toggle } = useTheme();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      padding: '15px 30px',
      background: 'color-mix(in srgb, var(--surface) 82%, transparent)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="var(--on-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 16 9 10 13 14 21 5" />
            <polyline points="15 5 21 5 21 11" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>GrowEasy</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)' }}>CSV Importer</span>
        </div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 15px', borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-2)',
          fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
          boxShadow: 'var(--shadow)',
          transition: 'all 0.2s',
        }}
      >
        {isDark ? (
          /* Sun icon — shown in dark mode, click to go light */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          /* Moon icon — shown in light mode, click to go dark */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
        {isDark ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}
