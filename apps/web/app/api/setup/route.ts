import { NextRequest } from 'next/server'
import { writeConfig } from '@/lib/server/config'
import type { ProviderConfig } from '@/lib/llm/adapter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SetupBody = ProviderConfig & { adultAttested: boolean }

function isValid(body: unknown): body is SetupBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (b.adultAttested !== true) return false
  if (b.provider === 'scripted') return true
  if (b.provider === 'openai-compat' || b.provider === 'anthropic' || b.provider === 'gemini') {
    return typeof b.apiKey === 'string' && b.apiKey.length > 0 && typeof b.model === 'string' && b.model.length > 0
  }
  return false
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }
  if (!isValid(body)) {
    return Response.json(
      { error: 'Invalid setup payload. Adult 18+ attestation required and provider/model/key must be provided for non-scripted modes.' },
      { status: 400 },
    )
  }
  await writeConfig(body)
  return Response.json({ ok: true })
}
