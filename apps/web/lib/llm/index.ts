import type { LLMAdapter, ProviderConfig } from './adapter'
import { makeAnthropicAdapter } from './anthropic'
import { makeGeminiAdapter } from './gemini'
import { makeOpenAICompatAdapter } from './openai-compat'
import { makeScriptedAdapter } from './scripted'

export function makeAdapter(
  cfg: ProviderConfig,
  scriptedTokens: string[],
): LLMAdapter {
  switch (cfg.provider) {
    case 'openai-compat':
      return makeOpenAICompatAdapter(cfg)
    case 'anthropic':
      return makeAnthropicAdapter(cfg)
    case 'gemini':
      return makeGeminiAdapter(cfg)
    case 'scripted':
      return makeScriptedAdapter(scriptedTokens)
  }
}

export type { LLMAdapter, ProviderConfig } from './adapter'
