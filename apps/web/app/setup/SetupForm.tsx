'use client'

import { useState } from 'react'

type Provider = 'scripted' | 'openai-compat' | 'anthropic' | 'gemini'

type Props = {
  initial: {
    configured: boolean
    provider: string
    model?: string
    baseURL?: string
    adultAttested: boolean
  }
}

const DEFAULTS: Record<Exclude<Provider, 'scripted'>, { model: string; baseURL?: string }> = {
  'openai-compat': { model: 'gpt-4o-mini' },
  anthropic: { model: 'claude-3-5-sonnet-latest' },
  gemini: { model: 'gemini-1.5-flash' },
}

export function SetupForm({ initial }: Props) {
  const NON_SCRIPTED = ['openai-compat', 'anthropic', 'gemini'] as const
  const [provider, setProvider] = useState<Provider>(
    (NON_SCRIPTED as readonly string[]).includes(initial.provider)
      ? (initial.provider as Provider)
      : 'scripted',
  )
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(initial.model ?? '')
  const [baseURL, setBaseURL] = useState(initial.baseURL ?? '')
  const [attested, setAttested] = useState(initial.adultAttested)
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null)

  function pickProvider(p: Provider) {
    setProvider(p)
    setStatus(null)
    if (p !== 'scripted') {
      setModel(DEFAULTS[p].model)
      if (p === 'openai-compat' && !baseURL) {
        setBaseURL('') // leave blank for openai.com default
      }
    }
  }

  async function submit() {
    setStatus(null)
    let payload: unknown
    if (provider === 'scripted') {
      payload = { provider: 'scripted', adultAttested: attested }
    } else {
      if (!apiKey) {
        setStatus({ ok: false, msg: 'API key required.' })
        return
      }
      if (!attested) {
        setStatus({ ok: false, msg: 'You must confirm you are 18 or older.' })
        return
      }
      payload = {
        provider,
        apiKey,
        model,
        ...(provider === 'openai-compat' && baseURL ? { baseURL } : {}),
        adultAttested: true,
      }
    }
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setApiKey('')
      setStatus({ ok: true, msg: 'Saved. The next mission will use this provider.' })
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      setStatus({ ok: false, msg: j.error ?? `Save failed (${res.status})` })
    }
  }

  return (
    <div className="card setup-form">
      <fieldset>
        <legend>Provider</legend>
        {(['scripted', 'openai-compat', 'anthropic', 'gemini'] as Provider[]).map((p) => (
          <label key={p} className="radio">
            <input
              type="radio"
              name="provider"
              value={p}
              checked={provider === p}
              onChange={() => pickProvider(p)}
            />
            <span>
              {p === 'scripted'
                ? 'Scripted (no key, default)'
                : p === 'openai-compat'
                  ? 'OpenAI / OpenAI-compatible (NVIDIA NIM, Ollama, vLLM, …)'
                  : p === 'anthropic'
                    ? 'Anthropic (Claude)'
                    : 'Gemini (Google)'}
            </span>
          </label>
        ))}
      </fieldset>

      {provider !== 'scripted' && (
        <>
          <label className="field">
            <span>API key (server-side only — never sent to the browser)</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              placeholder="sk-..."
            />
          </label>
          <label className="field">
            <span>Model</span>
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
          {provider === 'openai-compat' && (
            <label className="field">
              <span>Base URL (leave blank for openai.com)</span>
              <input
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="https://integrate.api.nvidia.com/v1"
              />
            </label>
          )}
          <label className="checkbox">
            <input
              type="checkbox"
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
            />
            <span>
              I am 18 or older and I accept the provider&apos;s terms of service for use of this key.
            </span>
          </label>
        </>
      )}

      <button className="primary" onClick={submit}>
        Save setup
      </button>
      {status && <p className={status.ok ? 'verdict ok' : 'verdict bad'}>{status.msg}</p>}
    </div>
  )
}
