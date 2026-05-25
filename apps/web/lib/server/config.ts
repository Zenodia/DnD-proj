import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { ProviderConfig } from '../llm/adapter'

const CONFIG_FILE = process.env.GAME_CONFIG_PATH ?? path.join(process.cwd(), '.game-config.json')

export type StoredConfig = ProviderConfig & {
  /** Set by the setup page when the installing adult attests to being 18+. */
  adultAttested?: boolean
}

/**
 * Reads a stored .game-config.json if present; otherwise falls back to env vars
 * that the installer set in .env. Env-fallback is opt-in by setting one of
 * these variables — when none are set, the game stays in scripted mode.
 *
 * Recognized env vars (first non-empty match wins, in this order):
 *   NVIDIA_API_KEY        → openai-compat at integrate.api.nvidia.com (default model overridable via NVIDIA_MODEL)
 *   OPENAI_API_KEY        → openai-compat at api.openai.com           (default model overridable via OPENAI_MODEL)
 *   ANTHROPIC_API_KEY     → anthropic native                          (default model overridable via ANTHROPIC_MODEL)
 *   GEMINI_API_KEY        → gemini native                             (default model overridable via GEMINI_MODEL)
 *
 * Env-fallback also requires GAME_LLM_ENV_ATTEST=1 — the installer must
 * affirm 18+ adulthood in the env to mirror the /setup page checkbox.
 */
export async function readConfig(): Promise<StoredConfig | null> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(raw) as StoredConfig
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
  return envFallback()
}

function envFallback(): StoredConfig | null {
  const attested = process.env.GAME_LLM_ENV_ATTEST === '1'
  if (!attested) return null

  if (process.env.NVIDIA_API_KEY) {
    return {
      provider: 'openai-compat',
      apiKey: process.env.NVIDIA_API_KEY,
      // Default to the faster Nemotron Nano (any-to-any reasoning, ~30B-A3B MoE).
      // Swap to moonshotai/kimi-k2.6 for the VLM-capable but slower model via NVIDIA_MODEL.
      model: process.env.NVIDIA_MODEL ?? 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
      baseURL: 'https://integrate.api.nvidia.com/v1',
      adultAttested: true,
    }
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai-compat',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      adultAttested: true,
    }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest',
      adultAttested: true,
    }
  }
  if (process.env.GEMINI_API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
      adultAttested: true,
    }
  }
  return null
}

export async function writeConfig(cfg: StoredConfig): Promise<void> {
  const tmp = `${CONFIG_FILE}.tmp`
  await fs.writeFile(tmp, JSON.stringify(cfg, null, 2), { mode: 0o600 })
  await fs.rename(tmp, CONFIG_FILE)
  await fs.chmod(CONFIG_FILE, 0o600)
}

/** Returns a redacted view safe to send to the browser. Never includes the API key. */
export function publicStatus(cfg: StoredConfig | null) {
  if (!cfg || cfg.provider === 'scripted') {
    return { configured: false, provider: 'scripted' as const, adultAttested: !!cfg?.adultAttested }
  }
  const baseURL = cfg.provider === 'openai-compat' ? cfg.baseURL : undefined
  return {
    configured: true,
    provider: cfg.provider,
    model: cfg.model,
    baseURL,
    adultAttested: !!cfg.adultAttested,
  }
}
