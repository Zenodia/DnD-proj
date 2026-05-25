import type { LLMAdapter, PlanInput } from './adapter'

type Cfg = {
  apiKey: string
  model: string
  /** Defaults to https://api.openai.com/v1. Override for NIM, Ollama, vLLM, OpenRouter, etc. */
  baseURL?: string
  temperature?: number
  maxTokens?: number
}

const DEFAULT_BASE = 'https://api.openai.com/v1'

/**
 * Reasoning models (DeepSeek-R1, NVIDIA Nemotron *-reasoning, Qwen QwQ, …) emit
 * a long internal monologue in `delta.reasoning_content` before producing the
 * final answer in the same field. For this game we want the player to see the
 * Quest, not the model's chain of thought. Detect and post-process accordingly.
 */
function isReasoningModel(model: string): boolean {
  const m = model.toLowerCase()
  return (
    m.includes('reasoning') ||
    m.includes('-r1') ||
    m.includes('thinking') ||
    m.includes('nemotron') ||
    m.includes('qwq')
  )
}

type DeltaPayload = {
  content?: string | null
  reasoning_content?: string | null
  reasoning?: string | null
}

type StreamLine = { choices?: Array<{ delta?: DeltaPayload }> }

/**
 * Walk the raw stream and yield individual text chunks. Used by both the
 * streaming path (non-reasoning models) and the buffered path (reasoning).
 */
async function* rawTextStream(
  res: Response,
): AsyncGenerator<string, void, unknown> {
  if (!res.body) return
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n\n')) !== -1) {
      const raw = buf.slice(0, nl)
      buf = buf.slice(nl + 2)
      for (const line of raw.split('\n')) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        let json: StreamLine
        try {
          json = JSON.parse(payload) as StreamLine
        } catch {
          continue
        }
        const delta = json.choices?.[0]?.delta
        if (!delta) continue
        const text =
          delta.content || delta.reasoning_content || delta.reasoning
        if (text) yield text
      }
    }
  }
}

/**
 * Extract the Quest body from a reasoning-model trace. Strategy:
 * 1. Find the last "[SYSTEM]" marker — reasoning models often write it twice
 *    (once when planning, once when emitting the final answer).
 * 2. Drop any leading hedging line ("Now output:", "Let's craft:", …) so the
 *    player sees a clean briefing.
 * 3. Fall back to the full buffer if no marker exists at all.
 */
function extractQuest(full: string): string {
  const lastMarker = full.lastIndexOf('[SYSTEM]')
  if (lastMarker < 0) return full.trim()
  return full.slice(lastMarker).trim()
}

/**
 * Replay a buffered string as a stream of short tokens with small delays so the
 * UI keeps its "agent thinking" feel even when we had to wait for the model to
 * finish reasoning before extracting the clean answer.
 */
async function* replayTokenized(
  text: string,
  delayMs = 18,
): AsyncGenerator<string, void, unknown> {
  // Split on whitespace boundaries so each yielded token is small but the
  // assembled output preserves spacing exactly.
  const parts = text.match(/\s+|\S+/g) ?? [text]
  for (const part of parts) {
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
    yield part
  }
}

/**
 * Raw-fetch OpenAI-compatible adapter. We avoid the official `openai` SDK
 * because (a) it strict-types `delta` and silently drops the reasoning fields
 * NVIDIA NIM sends, and (b) NVIDIA accepts `chat_template_kwargs` which is not
 * in the SDK's typed body. Direct fetch over SSE works against every
 * OpenAI-shaped endpoint we ship: OpenAI native, NVIDIA NIM
 * (integrate.api.nvidia.com), Ollama, vLLM, OpenRouter, Groq, Together.
 */
export function makeOpenAICompatAdapter(cfg: Cfg): LLMAdapter {
  const base = (cfg.baseURL ?? DEFAULT_BASE).replace(/\/+$/, '')
  const url = `${base}/chat/completions`
  const reasoning = isReasoningModel(cfg.model)

  return {
    async *streamPlan(input: PlanInput) {
      const body: Record<string, unknown> = {
        model: cfg.model,
        messages: [
          { role: 'system', content: input.system },
          { role: 'user', content: input.user },
        ],
        temperature: cfg.temperature ?? 0.7,
        max_tokens: cfg.maxTokens ?? (reasoning ? 2048 : 512),
        stream: true,
      }
      if (reasoning) {
        // Ask NIM/vLLM to skip the thinking template. Many models ignore this
        // and still emit reasoning_content — that's why we also buffer and
        // extract below.
        body.chat_template_kwargs = { thinking: false }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        throw new Error(
          `upstream ${res.status} ${res.statusText}: ${detail.slice(0, 200)}`,
        )
      }

      if (!reasoning) {
        // Non-reasoning model: stream straight through, no buffering.
        for await (const text of rawTextStream(res)) yield text
        return
      }

      // Reasoning model: buffer the full trace, extract the final Quest from
      // the last [SYSTEM] marker, then replay it tokenized for the UI.
      let buf = ''
      for await (const text of rawTextStream(res)) buf += text
      const cleaned = extractQuest(buf)
      yield* replayTokenized(cleaned)
    },
  }
}
