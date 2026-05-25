import type { LLMAdapter, PlanInput } from './adapter'

/** Streams a hand-authored plan in token-sized chunks so the UI feels the same with or without a key. */
export function makeScriptedAdapter(tokens: string[], delayMs = 35): LLMAdapter {
  return {
    async *streamPlan(_input: PlanInput) {
      for (const t of tokens) {
        if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
        yield t
      }
    },
  }
}
