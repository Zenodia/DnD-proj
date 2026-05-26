'use client'

import { useEffect, useState } from 'react'
import { sfx } from '@/lib/audio'

type Props = {
  fromRank?: string
  toRank?: string
  chapterTitle: string
  motion?: number // 0-10
  onClose: () => void
}

export function UnlockOverlay({
  fromRank = 'E',
  toRank = 'D',
  chapterTitle,
  motion = 7,
  onClose,
}: Props) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    sfx.portal()
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => { setPhase(2); sfx.chime() }, 1700)
    const t3 = setTimeout(() => setPhase(3), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const accent = 'var(--accent)'
  const accent2 = 'var(--accent-2)'
  const ringCount = motion >= 6 ? 6 : motion >= 3 ? 4 : 2

  return (
    <div
      role="dialog"
      aria-label="Chapter cleared"
      onClick={() => phase >= 3 && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(circle at center, rgba(92,200,255,0.08) 0%, rgba(0,0,0,0.92) 60%, rgba(0,0,0,1) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.4s ease-out',
        cursor: phase >= 3 ? 'pointer' : 'default',
      }}
    >
      {/* Concentric expanding rings */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        {Array.from({ length: ringCount }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              border: `2px solid ${accent}`,
              borderRadius: '50%',
              opacity: 0,
              animation: `ringExpand 2s ease-out ${i * 0.25}s infinite`,
            }}
          />
        ))}
        {/* Hex gate */}
        {phase >= 1 && (
          <svg
            width="420"
            height="420"
            viewBox="-110 -110 220 220"
            style={{
              filter: 'drop-shadow(0 0 30px var(--accent))',
              animation: 'gateBloom 1.2s ease-out',
            }}
          >
            <defs>
              <radialGradient id="ggrad" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={accent2} stopOpacity="0.85" />
                <stop offset="50%" stopColor={accent} stopOpacity="0.5" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="0" cy="0" r="100" fill="url(#ggrad)" />
            <polygon points="0,-86 75,-43 75,43 0,86 -75,43 -75,-43" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.9" />
            <polygon points="0,-70 60,-35 60,35 0,70 -60,35 -60,-35" fill="none" stroke={accent} strokeWidth="1" opacity="0.6" />
            <polygon points="0,-54 47,-27 47,27 0,54 -47,27 -47,-27" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.4" />
            <circle cx="0" cy="0" r="8" fill={accent2} />
          </svg>
        )}
      </div>

      {/* Rising particles */}
      {motion >= 4 && phase >= 1 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: motion * 6 }, (_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                bottom: -20,
                width: 2,
                height: 2 + Math.random() * 4,
                background: i % 3 === 0 ? accent2 : accent,
                boxShadow: `0 0 6px ${accent}`,
                opacity: 0.6 + Math.random() * 0.4,
                animation: `rise ${3 + Math.random() * 4}s linear ${Math.random() * 2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Text */}
      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1, padding: 24 }}>
        {phase >= 1 && (
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 18,
              letterSpacing: '0.6em',
              color: accent,
              marginBottom: 8,
              animation: 'fadeUp 0.5s ease-out',
              textTransform: 'uppercase',
            }}
          >
            [ Gate Cleared ]
          </div>
        )}
        {phase >= 1 && (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 56,
              fontWeight: 600,
              color: '#fff',
              textShadow: 'var(--glow-strong, 0 0 32px var(--accent)), 0 0 64px rgba(92,200,255,0.5)',
              letterSpacing: '0.04em',
              margin: '0 0 28px',
              lineHeight: 1.05,
              animation: 'fadeUp 0.6s ease-out 0.1s both',
            }}
          >
            {chapterTitle.toUpperCase()}
          </div>
        )}
        {phase >= 2 && (
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              letterSpacing: '0.5em',
              color: accent2,
              marginBottom: 12,
              animation: 'fadeUp 0.4s ease-out',
            }}
          >
            HUNTER RANK
          </div>
        )}
        {phase >= 2 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 28,
              animation: 'fadeUp 0.5s ease-out 0.1s both',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 88,
                color: 'rgba(255,255,255,0.35)',
                textDecoration: 'line-through',
                textDecorationColor: 'rgba(255,255,255,0.25)',
              }}
            >
              {fromRank}
            </span>
            <span style={{ fontSize: 28, color: accent }}>→</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 110,
                color: '#fff',
                textShadow: '0 0 22px var(--accent), 0 0 56px rgba(92,200,255,0.5)',
                animation: motion >= 5 ? 'pulse 1.6s ease-in-out infinite' : 'none',
                fontWeight: 700,
              }}
            >
              {toRank}
            </span>
          </div>
        )}
        {phase >= 3 && (
          <div
            style={{
              marginTop: 40,
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              letterSpacing: '0.4em',
              color: 'rgba(255,255,255,0.6)',
              animation: 'fadeUp 0.5s ease-out',
            }}
          >
            [ Click to continue → ]
          </div>
        )}
      </div>
    </div>
  )
}
