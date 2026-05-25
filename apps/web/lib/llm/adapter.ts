export type PlanInput = {
  system: string
  user: string
}

export interface LLMAdapter {
  /** Streams plan deltas. Yields only the text delta — never provider event envelopes. */
  streamPlan(input: PlanInput): AsyncIterable<string>
}

export type ProviderId = 'openai-compat' | 'anthropic' | 'gemini' | 'scripted'

export type ProviderConfig =
  | {
      provider: 'openai-compat'
      apiKey: string
      model: string
      baseURL?: string
      temperature?: number
      maxTokens?: number
    }
  | {
      provider: 'anthropic'
      apiKey: string
      model: string
      temperature?: number
      maxTokens?: number
    }
  | {
      provider: 'gemini'
      apiKey: string
      model: string
      temperature?: number
      maxTokens?: number
    }
  | { provider: 'scripted' }
