'use client'

import { Fragment } from 'react'

type Props = {
  current: number // 1-indexed
  total?: number
}

export function CampaignBreadcrumb({ current, total = 6 }: Props) {
  const accent = 'var(--accent)'
  const nodes = Array.from({ length: total }, (_, i) => i + 1)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {nodes.map((n, i) => {
        const active = n === current
        const done = n < current
        const size = active ? 18 : 10
        return (
          <Fragment key={n}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
              <div
                style={{
                  width: size,
                  height: size,
                  border: `1.5px solid ${accent}`,
                  background: done ? accent : active ? 'rgba(92,200,255,0.25)' : 'transparent',
                  opacity: done || active ? 1 : 0.5,
                  boxShadow: active ? `0 0 14px ${accent}, 0 0 28px rgba(92,200,255,0.4)` : 'none',
                  transition: 'all 0.3s',
                }}
              />
              {active && (
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    color: accent,
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    position: 'absolute',
                    top: 22,
                    whiteSpace: 'nowrap',
                    opacity: 0.85,
                  }}
                >
                  CH·{String(n).padStart(2, '0')}
                </div>
              )}
            </div>
            {i < nodes.length - 1 && (
              <div
                style={{
                  width: 36,
                  height: 1,
                  borderTop: `1px dashed ${accent}`,
                  opacity: n < current ? 0.8 : 0.3,
                  margin: '0 6px',
                }}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
