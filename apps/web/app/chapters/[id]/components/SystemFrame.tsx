'use client'

import type { CSSProperties, ReactNode } from 'react'

type Pos = 'tl' | 'tr' | 'bl' | 'br'

export function Corner({ pos, color }: { pos: Pos; color: string }) {
  const horiz: Record<Pos, 'left' | 'right'> = { tl: 'left', tr: 'right', bl: 'left', br: 'right' }
  const vert: Record<Pos, 'top' | 'bottom'> = { tl: 'top', tr: 'top', bl: 'bottom', br: 'bottom' }
  const root: CSSProperties = {
    position: 'absolute',
    [horiz[pos]]: -1,
    [vert[pos]]: -1,
    width: 12,
    height: 12,
    pointerEvents: 'none',
  }
  const a: CSSProperties = { position: 'absolute', background: color }
  return (
    <span style={root}>
      <span style={{ ...a, [horiz[pos]]: 0, [vert[pos]]: 0, width: 12, height: 2 }} />
      <span style={{ ...a, [horiz[pos]]: 0, [vert[pos]]: 0, width: 2, height: 12 }} />
    </span>
  )
}

type SystemFrameProps = {
  label?: string
  accent?: string
  children: ReactNode
  style?: CSSProperties
}

/** Nested-rectangle viewfinder panel. Iconic Solo Leveling System window. */
export function SystemFrame({ label, accent = 'var(--accent)', children, style }: SystemFrameProps) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(0,0,0,0.55)',
        padding: '20px 22px 20px',
        ...style,
      }}
    >
      <span style={{ position: 'absolute', inset: 0, border: `1px solid ${accent}`, opacity: 0.95, pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', inset: 4, border: `1px solid ${accent}`, opacity: 0.35, pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', inset: 8, border: `1px solid ${accent}`, opacity: 0.15, pointerEvents: 'none' }} />
      {label && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: 22,
            background: 'var(--bg)',
            padding: '0 10px',
            color: accent,
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            letterSpacing: '0.32em',
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  )
}
