'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Chapter, QuestStep } from '@content/chapters'
import { sfx } from '@/lib/audio'
import { HudHeader } from './components/HudHeader'
import { SystemFrame, Corner } from './components/SystemFrame'
import { ChoiceCard, type ChoiceOptionView } from './components/ChoiceCard'
import { UnlockOverlay } from './components/UnlockOverlay'

type Props = {
  chapter: Chapter
  nextChapterId: string | null
}

type Phase = 'decide' | 'quest' | 'correct' | 'unlocked'

const RANK_LADDER = ['E', 'D', 'C', 'B', 'A', 'S', '★']

const COST_PRESETS: Record<string, string> = {
  fast: 'TEMPO ▲▲▲   CAUTION ▽',
  slow: 'CAUTION ▲▲▲   TEMPO ▽▽',
  lore: 'INSIGHT ▲▲▲   TEMPO ▽▽',
  bond: 'BOND ▲▲▲   TEMPO ▽▽',
}

function guessCost(hint?: string): string {
  if (!hint) return 'WEIGHT · UNKNOWN'
  const h = hint.toLowerCase()
  if (h.includes('fast')) return COST_PRESETS.fast
  if (h.includes('lore') || h.includes('read')) return COST_PRESETS.lore
  if (h.includes('sacrific') || h.includes('save') || h.includes('protect') || h.includes('squad')) return COST_PRESETS.bond
  if (h.includes('slow') || h.includes('costly') || h.includes('time')) return COST_PRESETS.slow
  return 'WEIGHT · BALANCED'
}

export function ChapterRunner({ chapter, nextChapterId }: Props) {
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<Phase>('decide')
  const [questText, setQuestText] = useState('')
  const [providerLabel, setProviderLabel] = useState<string>('')
  const [modelLabel, setModelLabel] = useState<string | null>(null)
  const [correction, setCorrection] = useState('')
  const [verdict, setVerdict] = useState<null | { ok: boolean; expected: string }>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const initialPingFired = useRef(false)

  const allAnswered = chapter.choices.every((c) => choices[c.id])
  const flawed = useMemo<QuestStep | undefined>(
    () => chapter.scripted.steps.find((s) => s.flawed),
    [chapter.scripted],
  )

  // Initial ambient ping when the System "comes online".
  useEffect(() => {
    if (initialPingFired.current) return
    initialPingFired.current = true
    const t = setTimeout(() => sfx.ping(), 600)
    return () => clearTimeout(t)
  }, [])

  // Map content choices → visual options (one ChoiceCard per option of each decision).
  function asView(option: { id: string; label: string; hint?: string }, idx: number): ChoiceOptionView {
    return {
      id: option.id,
      n: String(idx + 1).padStart(2, '0'),
      label: option.label,
      hint: option.hint,
      cost: guessCost(option.hint),
      imageSrc: `/chapters/${chapter.id}/options/${option.id}.jpg`,
    }
  }

  async function startStream() {
    setPhase('quest')
    setQuestText('')
    setProviderLabel('connecting…')
    setModelLabel(null)
    sfx.issue()

    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId: chapter.id, choices }),
    })
    if (!res.body) {
      setQuestText('[SYSTEM] stream failed.')
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    let tickI = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      let nl: number
      while ((nl = buf.indexOf('\n\n')) !== -1) {
        const raw = buf.slice(0, nl).trim()
        buf = buf.slice(nl + 2)
        if (!raw.startsWith('data:')) continue
        const json = raw.slice(5).trim()
        try {
          const evt = JSON.parse(json) as
            | { kind: 'meta'; provider: string; model?: string }
            | { kind: 'delta'; text: string }
            | { kind: 'done' }
            | { kind: 'error'; message: string }
          if (evt.kind === 'meta') {
            setProviderLabel(evt.provider)
            setModelLabel(evt.model ?? null)
          } else if (evt.kind === 'delta') {
            setQuestText((t) => t + evt.text)
            if (tickI++ % 4 === 0) sfx.tick()
          } else if (evt.kind === 'done') {
            break
          } else if (evt.kind === 'error') {
            setQuestText((t) => t + '\n[SYSTEM] feed cut. Returning to scripted brief.')
          }
        } catch {
          // ignore malformed events
        }
      }
    }
    setPhase('correct')
  }

  function submitCorrection() {
    if (!flawed || !flawed.fix) return
    const norm = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(Boolean)
    const expected = new Set(norm(flawed.fix))
    const got = norm(correction)
    const overlap = got.filter((w) => expected.has(w)).length
    const ok = overlap >= Math.max(2, Math.floor(expected.size * 0.4))
    setVerdict({ ok, expected: flawed.fix })
    if (ok) {
      sfx.blip()
      setPhase('unlocked')
      // Hand off to portal overlay after a beat
      setTimeout(() => setShowOverlay(true), 400)
    }
  }

  const selectedFirstOption = chapter.choices[0]
    ? choices[chapter.choices[0].id]
    : undefined
  const selectedFirstLabel = selectedFirstOption
    ? chapter.choices[0].options.find((o) => o.id === selectedFirstOption)?.label
    : undefined

  const rankIdx = Math.max(0, Math.min(RANK_LADDER.length - 2, chapter.order - 1))
  const fromRank = RANK_LADDER[rankIdx]
  const toRank = RANK_LADDER[rankIdx + 1]

  return (
    <div className="runner">
      <HudHeader current={chapter.order} total={6} rank={fromRank} />

      {/* ── Decision phase ─────────────────────────────────────────────── */}
      {phase === 'decide' && (
        <DecideStage
          chapter={chapter}
          choices={choices}
          setChoices={setChoices}
          allAnswered={allAnswered}
          onIssue={startStream}
          selectedFirstLabel={selectedFirstLabel}
          asView={asView}
        />
      )}

      {/* ── Quest stream ──────────────────────────────────────────────── */}
      {(phase === 'quest' || phase === 'correct' || phase === 'unlocked') && (
        <SystemFrame label="[ SYSTEM · QUEST FEED ]">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              letterSpacing: '0.32em',
              color: 'var(--accent)',
              marginBottom: 14,
            }}
          >
            <span>FIRST QUEST · ISSUED</span>
            <span className="badge">
              {providerLabel}
              {modelLabel ? ` · ${modelLabel}` : ''}
            </span>
          </div>
          <pre className="plan-stream">
            {questText || '…'}
            {phase === 'quest' && (
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 14,
                  background: 'var(--accent)',
                  marginLeft: 4,
                  verticalAlign: -2,
                  animation: 'cursor 1s steps(2) infinite',
                }}
              />
            )}
          </pre>
        </SystemFrame>
      )}

      {/* ── Catch the flaw ────────────────────────────────────────────── */}
      {(phase === 'correct' || phase === 'unlocked') && flawed && (
        <SystemFrame label="[ SYSTEM · CORRECTION ]">
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              letterSpacing: '0.32em',
              color: 'var(--accent)',
              marginBottom: 6,
            }}
          >
            STEP 1/7 · GUARDRAIL
          </div>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 8px' }}>Catch the flaw</h2>
          <p className="lead-small">
            One step in the Quest violates a hidden law of this chapter. Find it and rewrite that
            step so a senior hunter would sign off on it.
          </p>
          <div className="flawed-step-context">
            <em>Flawed line</em>
            <div style={{ marginTop: 6 }}>&quot;{flawed.text}&quot;</div>
          </div>
          <textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder="Rewrite the broken step in your own words."
            disabled={phase === 'unlocked'}
            rows={3}
            style={{ marginBottom: 12 }}
          />
          {phase === 'correct' && (
            <button className="primary" onClick={submitCorrection}>
              Submit correction
            </button>
          )}
          {verdict && (
            <p className={verdict.ok ? 'verdict ok' : 'verdict bad'}>
              {verdict.ok
                ? '✓ The System acknowledges. The Quest holds.'
                : `Not yet. A senior hunter would write something like: "${verdict.expected}". Rewrite and try again.`}
            </p>
          )}
        </SystemFrame>
      )}

      {/* ── Chapter cleared ───────────────────────────────────────────── */}
      {phase === 'unlocked' && !showOverlay && (
        <div style={{ position: 'relative', padding: 24, border: '1px solid rgba(92,200,255,0.5)', background: 'rgba(92,200,255,0.06)' }}>
          <Corner pos="tl" color="var(--accent)" />
          <Corner pos="tr" color="var(--accent)" />
          <Corner pos="bl" color="var(--accent)" />
          <Corner pos="br" color="var(--accent)" />
          <h2 style={{ marginBottom: 8 }}>Chapter cleared</h2>
          {nextChapterId ? (
            <p>
              <Link href={`/chapters/${nextChapterId}`} className="primary as-link">
                Enter the next gate →
              </Link>
            </p>
          ) : (
            <p>
              The Rupture Court falls. <Link href="/">Back to the campaign.</Link>
            </p>
          )}
        </div>
      )}

      {showOverlay && (
        <UnlockOverlay
          chapterTitle={chapter.title}
          fromRank={fromRank}
          toRank={toRank}
          motion={7}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </div>
  )
}

// ── Decide stage (visual choice cards + briefing) ──────────────────────────
function DecideStage({
  chapter,
  choices,
  setChoices,
  allAnswered,
  onIssue,
  selectedFirstLabel,
  asView,
}: {
  chapter: Chapter
  choices: Record<string, string>
  setChoices: (c: Record<string, string>) => void
  allAnswered: boolean
  onIssue: () => void
  selectedFirstLabel: string | undefined
  asView: (option: { id: string; label: string; hint?: string }, idx: number) => ChoiceOptionView
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Briefing + Decisions: two-column on wide screens */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(560px, 2.2fr)',
          gap: 28,
          alignItems: 'start',
        }}
      >
        {/* Briefing column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <SystemFrame label="[ SYSTEM ]">
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                letterSpacing: '0.34em',
                color: 'var(--accent)',
                marginBottom: 6,
              }}
            >
              FIRST QUEST · STANDBY
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#e6f1ff',
              }}
            >
              {chapter.purpose}
            </div>
          </SystemFrame>

          <div
            style={{
              position: 'relative',
              padding: '18px 22px',
              borderLeft: '2px solid var(--accent)',
              background: 'linear-gradient(90deg, rgba(92,200,255,0.05) 0%, transparent 100%)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                letterSpacing: '0.38em',
                color: 'var(--accent)',
                marginBottom: 8,
                textTransform: 'uppercase',
              }}
            >
              Field briefing
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.6 }}>{chapter.briefing}</div>
          </div>
        </div>

        {/* Decisions column */}
        <div>
          {chapter.choices.map((choiceGroup, groupIdx) => (
            <div key={choiceGroup.id} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 36,
                    color: '#fff',
                    letterSpacing: '0.02em',
                  }}
                >
                  {String(groupIdx + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      letterSpacing: '0.45em',
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Decision point
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 22,
                      color: '#fff',
                      lineHeight: 1.25,
                    }}
                  >
                    {choiceGroup.question}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 18,
                }}
              >
                {choiceGroup.options.map((o, i) => (
                  <ChoiceCard
                    key={o.id}
                    opt={asView(o, i)}
                    selected={choices[choiceGroup.id] === o.id}
                    onSelect={(id) => setChoices({ ...choices, [choiceGroup.id]: id })}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '18px 24px',
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${allAnswered ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
              position: 'relative',
              transition: 'all 200ms',
            }}
          >
            {allAnswered && (
              <>
                <Corner pos="tl" color="var(--accent)" />
                <Corner pos="tr" color="var(--accent)" />
                <Corner pos="bl" color="var(--accent)" />
                <Corner pos="br" color="var(--accent)" />
              </>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  letterSpacing: '0.4em',
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                }}
              >
                {allAnswered ? 'Path selected' : 'Awaiting decision'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  color: allAnswered ? '#fff' : 'var(--text-muted)',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedFirstLabel ?? 'Choose one option above.'}
              </div>
            </div>
            <button
              className="primary"
              disabled={!allAnswered}
              onClick={onIssue}
              onMouseEnter={() => allAnswered && sfx.tick()}
              style={{ whiteSpace: 'nowrap' }}
            >
              Issue the Quest →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
