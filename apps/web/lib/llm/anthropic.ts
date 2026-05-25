import Anthropic from '@anthropic-ai/sdk'
import type { LLMAdapter, PlanInput } from './adapter'

type Cfg = {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

export function makeAnthropicAdapter(cfg: Cfg): LLMAdapter {
  const client = new Anthropic({ apiKey: cfg.apiKey })
  return {
    async *streamPlan(input: PlanInput) {
      const stream = await client.messages.create({
        model: cfg.model,
        system: input.system,
        messages: [{ role: 'user', content: input.user }],
        temperature: cfg.temperature ?? 0.7,
        max_tokens: cfg.maxTokens ?? 512,
        stream: true,
      })
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text
        }
      }
    },
  }
}
