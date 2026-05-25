import { NextRequest } from 'next/server'
import { getChapter } from '@content/chapters'
import { makeAdapter } from '@/lib/llm'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/llm/prompts'
import { readConfig } from '@/lib/server/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = {
  chapterId: string
  choices: Record<string, string>
}

function sseEvent(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const chapter = getChapter(body.chapterId)
  if (!chapter) {
    return new Response(`Unknown chapter: ${body.chapterId}`, { status: 404 })
  }

  const cfg = await readConfig()
  const provider =
    cfg && cfg.provider !== 'scripted' && cfg.adultAttested
      ? cfg
      : { provider: 'scripted' as const }

  const adapter = makeAdapter(provider, chapter.scripted.tokens)
  const system = buildSystemPrompt(chapter)
  const user = buildUserPrompt(chapter, body.choices ?? {})

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          sseEvent({
            kind: 'meta',
            provider: provider.provider,
            ...(provider.provider !== 'scripted' ? { model: (provider as { model?: string }).model } : {}),
          }),
        ),
      )
      try {
        for await (const delta of adapter.streamPlan({ system, user })) {
          controller.enqueue(encoder.encode(sseEvent({ kind: 'delta', text: delta })))
        }
        controller.enqueue(encoder.encode(sseEvent({ kind: 'done' })))
      } catch {
        controller.enqueue(
          encoder.encode(sseEvent({ kind: 'error', message: 'plan-stream-failed' })),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
