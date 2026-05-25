import Link from 'next/link'
import { readConfig, publicStatus } from '@/lib/server/config'
import { SetupForm } from './SetupForm'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  const cfg = await readConfig()
  const status = publicStatus(cfg)
  return (
    <main className="page">
      <p className="eyebrow">
        <Link href="/">← Mission board</Link>
      </p>
      <h1>LLM setup</h1>
      <p className="lead">
        Optional. The game works without any API key — pick a provider here only if you have a key
        and you (the installer) are 18 or older. Keys stay on this machine in a server-side file
        with restricted permissions; they never reach the browser.
      </p>
      <p className="mode-pill">
        Current: <strong>{status.configured ? `${status.provider} — ${status.model}` : 'Scripted (no key)'}</strong>
      </p>
      <SetupForm initial={status} />
    </main>
  )
}
