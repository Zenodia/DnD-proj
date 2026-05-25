import Link from 'next/link'
import { chapters, SEVEN_STEP_LABEL, FIVE_LAYER_LABEL } from '@content/chapters'
import { readConfig, publicStatus } from '@/lib/server/config'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const cfg = await readConfig()
  const status = publicStatus(cfg)

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Solo Leveling · Agent Quest</p>
        <h1>You were the weakest in the raid.</h1>
        <p className="lead">
          A massacre opens the System. Six chapters take you from broken gate to sovereign command —
          and teach the 7-step agent loop and the 5 disciplines through play, not lecture.
        </p>
        <p className="mode-pill">
          System feed:{' '}
          <strong>
            {status.provider === 'scripted'
              ? 'Scripted (no key)'
              : `Live LLM — ${status.provider}${'model' in status && status.model ? ` · ${status.model}` : ''}`}
          </strong>
          {' · '}
          <Link href="/setup">{status.configured ? 'Change' : 'Bind a model'}</Link>
        </p>
      </header>

      <section className="grid">
        <div className="card">
          <h2>How it plays</h2>
          <ol className="how-it-plays">
            <li>Open a chapter. Read the briefing.</li>
            <li>Make the Hunter decisions the chapter demands.</li>
            <li>Watch the System stream a Quest brief.</li>
            <li>Find the single deliberately flawed step and rewrite it.</li>
            <li>Unlock the next chapter.</li>
          </ol>
          <p className="lead-small">
            Zero-key by default. Bind a model (Anthropic / OpenAI / Gemini / OpenAI-compat — NVIDIA NIM, Ollama, vLLM, …) to swap the System Voice for a live LLM that streams the Quest.
          </p>
        </div>

        <div className="card">
          <h2>The campaign</h2>
          <ul className="chapter-list">
            {chapters.map((c) => (
              <li key={c.id}>
                <Link href={`/chapters/${c.id}`} className="chapter-link">
                  <span className="chapter-order">Ch.{c.order.toString().padStart(2, '0')}</span>
                  <span className="chapter-title">{c.title}</span>
                  <span className="chapter-act">{c.act}</span>
                  <span className="chapter-tags">
                    <span className="tag">{SEVEN_STEP_LABEL[c.learningGoal.step]}</span>
                    <span className="tag">{FIVE_LAYER_LABEL[c.learningGoal.layer]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
