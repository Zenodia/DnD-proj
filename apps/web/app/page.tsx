import { missions } from '@content/missions'

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Anime Agentic AI</p>
        <h1>Lead a squad of AI agents through missions.</h1>
        <p className="lead">Learn what agentic AI is by assigning roles, watching plans, and fixing failures.</p>
      </header>
      <section className="grid">
        <div className="card">
          <h2>What you learn</h2>
          <ul>
            <li>Planning vs execution</li>
            <li>Tools, memory, and guardrails</li>
            <li>When agents help and when they fail</li>
          </ul>
        </div>
        <div className="card">
          <h2>Mission board</h2>
          <ul>
            {missions.map((m) => (
              <li key={m.id}>{m.title}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
