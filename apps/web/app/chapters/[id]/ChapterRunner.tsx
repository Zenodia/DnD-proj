'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Chapter, QuestStep } from '@content/chapters'

type Props = {
  chapter: Chapter
  nextChapterId: string | null
}

type Phase = 'decide' | 'quest' | 'correct' | 'unlocked'

export function ChapterRunner({ chapter, nextChapterId }: Props) {
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<Phase>('decide')
  const [questText, setQuestText] = useState('')
  const [providerLabel, setProviderLabel] = useState<string>('')
  const [modelLabel, setModelLabel] = useState<string | null>(null)
  const [correction, setCorrection] = useState('')
  const [verdict, setVerdict] = useState<null | { ok: boolean; expected: string }>(null)

  const allAnswered = chapter.choices.every((c) => choices[c.id])
  const flawed = useMemo<QuestStep | undefined>(
    () => chapter.scripted.steps.find((s) => s.flawed),
    [chapter.scripted],
  )

  async function startStream() {
    setPhase('quest')
    setQuestText('')
    setProviderLabel('connecting…')
    setModelLabel(null)

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
    if (ok) setPhase('unlocked')
  }

  return (
    <div className="runner">
      <section className="card">
        <h2>1. Hunter decisions</h2>
        <p className="lead-small">
          Pick before the System speaks. Choices propagate into the briefing the model receives.
        </p>
        {chapter.choices.map((c) => (
          <div key={c.id} className="choice-block">
            <p className="choice-q">{c.question}</p>
            <div className="choice-options">
              {c.options.map((o) => (
                <label
                  key={o.id}
                  className={`choice-option ${choices[c.id] === o.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`choice-${c.id}`}
                    value={o.id}
                    checked={choices[c.id] === o.id}
                    disabled={phase !== 'decide'}
                    onChange={() => setChoices({ ...choices, [c.id]: o.id })}
                  />
                  <span>
                    <strong>{o.label}</strong>
                    {o.hint ? <em> — {o.hint}</em> : null}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {phase === 'decide' && (
          <button className="primary" onClick={startStream} disabled={!allAnswered}>
            Issue the Quest →
          </button>
        )}
      </section>

      {phase !== 'decide' && (
        <section className="card">
          <h2>
            2. System feed{' '}
            <span className="badge">
              {providerLabel}
              {modelLabel ? ` · ${modelLabel}` : ''}
            </span>
          </h2>
          <pre className="plan-stream">{questText || '…'}</pre>
        </section>
      )}

      {(phase === 'correct' || phase === 'unlocked') && flawed && (
        <section className="card">
          <h2>3. Catch the flaw</h2>
          <p className="lead-small">
            One step in the Quest violates a hidden law of this chapter. Find it and rewrite that
            step so a senior hunter would sign off on it.
          </p>
          <p className="flawed-step-context">
            <em>Flawed line:</em> &quot;{flawed.text}&quot;
          </p>
          <textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder="Rewrite the broken step in your own words."
            disabled={phase === 'unlocked'}
            rows={3}
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
        </section>
      )}

      {phase === 'unlocked' && (
        <section className="card celebration">
          <h2>Chapter cleared</h2>
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
        </section>
      )}
    </div>
  )
}
