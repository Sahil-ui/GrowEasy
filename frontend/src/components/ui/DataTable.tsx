'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Props {
  headers: string[];
  rows: Record<string, string>[];
  maxHeight?: string;
}

export default function DataTable({ headers, rows, maxHeight = '480px' }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Hook up virtualization for the rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 41, // Average height of table row in pixels
    overscan: 10, // Number of items to render outside the viewport
  });

  return (
    <div
      ref={parentRef}
      className="data-table-container"
      style={{
        maxHeight,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ display: 'flex', width: '100%' }}>
            <th
              style={{
                width: '60px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 2,
              }}
            >
              #
            </th>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  flex: '1 0 160px',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          style={{
            display: 'block',
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={virtualRow.key}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <td
                  className="text-muted font-mono"
                  style={{
                    width: '60px',
                    flexShrink: 0,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {virtualRow.index + 1}
                </td>
                {headers.map((h) => (
                  <td
                    key={h}
                    title={row[h] || ''}
                    style={{
                      flex: '1 0 160px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {row[h] || <span className="text-muted" style={{ fontStyle: 'italic' }}>—</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
