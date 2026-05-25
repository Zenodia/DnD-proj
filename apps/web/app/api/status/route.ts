import { readConfig, publicStatus } from '@/lib/server/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const cfg = await readConfig()
  return Response.json(publicStatus(cfg))
}
