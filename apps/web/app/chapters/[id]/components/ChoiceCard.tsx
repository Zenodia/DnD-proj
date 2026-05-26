'use client'

import { useState } from 'react'
import { Corner } from './SystemFrame'
import { sfx } from '@/lib/audio'

export type ChoiceOptionView = {
  id: string
  n: string // '01', '02'...
  label: string
  hint?: string
  cost?: string
  imageSrc?: string // optional /chapters/<id>/options/<id>.jpg
}

type Props = {
  opt: ChoiceOptionView
  selected: boolean
  onSelect: (id: string) => void
  disabled?: boolean
}

export function ChoiceCard({ opt, selected, onSelect, disabled }: Props) {
  const [hover, setHover] = useState(false)
  const [imgOk, setImgOk] = useState(true)

  const accent = 'var(--accent)'
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => { setHover(true); sfx.tick() }}
      onMouseLeave={() => setHover(false)}
      onClick={() => { if (!disabled) { onSelect(opt.id); sfx.blip() } }}
      style={{
        position: 'relative',
        textAlign: 'left',
        background: 'transparent',
        padding: 0,
        border: 0,
        color: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(8,12,22,0.6)',
          border: `1px solid ${
            selected ? accent : hover ? 'rgba(92,200,255,0.5)' : 'rgba(255,255,255,0.08)'
          }`,
          padding: 14,
          transition: 'all 180ms ease',
          boxShadow: selected
            ? `0 0 0 1px ${accent}, 0 0 32px rgba(92,200,255,0.35), inset 0 0 32px rgba(92,200,255,0.08)`
            : hover
            ? '0 0 24px rgba(92,200,255,0.2)'
            : 'none',
          transform: selected ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Image area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            background: '#03060e',
            overflow: 'hidden',
            marginBottom: 14,
            border: `1px solid rgba(92,200,255,0.2)`,
          }}
        >
          {opt.imageSrc && imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={opt.imageSrc}
              alt={opt.label}
              onError={() => setImgOk(false)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                color: 'rgba(214,228,247,0.35)',
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              <span>{opt.label}</span>
            </div>
          )}

          {/* Number badge */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontFamily: 'var(--font-ui)',
              fontSize: 18,
              letterSpacing: '0.2em',
              color: accent,
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 8px',
              border: `1px solid rgba(92,200,255,0.4)`,
              fontWeight: 600,
            }}
          >
            {opt.n}
          </div>

          {selected && (
            <>
              <Corner pos="tl" color={accent} />
              <Corner pos="tr" color={accent} />
              <Corner pos="bl" color={accent} />
              <Corner pos="br" color={accent} />
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  letterSpacing: '0.32em',
                  color: 'var(--bg)',
                  background: accent,
                  padding: '3px 8px',
                  fontWeight: 700,
                }}
              >
                LOCKED
              </div>
            </>
          )}
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: '#fff',
            marginBottom: 6,
            lineHeight: 1.2,
            minHeight: '2.4em',
          }}
        >
          {opt.label}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.4,
            marginBottom: 10,
            minHeight: '2.8em',
          }}
        >
          {opt.hint}
        </div>

        {/* Cost bar */}
        {opt.cost && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--accent-2)',
              opacity: 0.75,
              paddingTop: 10,
              borderTop: '1px dashed rgba(92,200,255,0.2)',
            }}
          >
            {opt.cost}
          </div>
        )}
      </div>
    </button>
  )
}
