'use client'

import { CampaignBreadcrumb } from './CampaignBreadcrumb'

type Props = {
  hunterName?: string
  rank?: string
  xp?: number
  xpMax?: number
  aura?: number
  current: number
  total?: number
}

export function HudHeader({
  hunterName = 'Jin-ah Kwon',
  rank = 'E',
  xp = 1240,
  xpMax = 2000,
  aura = 14,
  current,
  total = 6,
}: Props) {
  const accent = 'var(--accent)'

  return (
    <header
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        paddingBottom: 18,
        marginBottom: 24,
        borderBottom: `1px solid rgba(92,200,255,0.15)`,
        gap: 24,
      }}
    >
      {/* Hunter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div
          style={{
            width: 38,
            height: 38,
            border: `1px solid ${accent}`,
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            background: 'rgba(0,0,0,0.4)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: accent }}>
            {hunterName.charAt(0).toUpperCase()}
          </span>
          <span style={{ position: 'absolute', top: -3, left: -3, width: 6, height: 6, background: accent }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              letterSpacing: '0.16em',
              fontSize: 13,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase',
            }}
          >
            Hunter · {hunterName}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.18em',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: accent }}>RANK · {rank}</span> · XP {xp}/{xpMax} · AURA {aura}%
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <CampaignBreadcrumb current={current} total={total} />

      {/* System status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: accent,
            boxShadow: `0 0 12px ${accent}, 0 0 24px rgba(92,200,255,0.5)`,
            animation: 'blink 1.5s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            letterSpacing: '0.28em',
            fontSize: 12,
            color: accent,
            whiteSpace: 'nowrap',
          }}
        >
          SYSTEM · ONLINE
        </span>
      </div>
    </header>
  )
}
