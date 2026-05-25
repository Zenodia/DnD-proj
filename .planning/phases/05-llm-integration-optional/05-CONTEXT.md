# Phase 5 Context — LLM integration (optional)

This context captures the user-locked decisions for the optional LLM layer. The framework selector and downstream researchers MUST honor these constraints; they are not open questions.

## Project & Repo

- **Project:** Anime Agentic AI Game (Next.js, pnpm workspace) — `apps/web` + `packages/content` + `packages/shared`
- **Audience:** Teens (and schools / parents installing for them)
- **Distribution:** Tarball install on Ubuntu — single-machine; no central backend
- **Repo is pre-indexed with CodeGraph** (`.codegraph/codegraph.db`). Use `codegraph query` / `codegraph context` before broad search.
- **Existing draft:** mission board renders 4 missions from `packages/content/src/missions.ts`. Phase 4 adds the playable scripted slice (mission detail, role assign, plan review, correction, unlock) — Phase 5 layers an optional LLM stream into the same plan-review seam.

## Hard Constraints (Do Not Negotiate)

1. **No-key mode is the default and remains fully supported.** Scripted content per mission drives the same UX. The LLM layer is opt-in only.
2. **API keys are server-side only.** Never reachable from the browser. No `NEXT_PUBLIC_*` keys, no localStorage, no key-in-URL. First-run setup page POSTs to a server route that writes a 600-perm file; client receives only a masked "configured ✓" status.
3. **Provider-pluggable adapter.** Must support, on day one of this phase:
   - Anthropic (Claude Sonnet/Opus) — Messages API
   - OpenAI (ChatGPT) — Chat Completions / Responses API
   - Google Gemini — Generative Language API
   - **OpenAI-compatible custom endpoint** — user supplies `base_url` + `model`. Reference shape (provided by user):
     ```python
     from openai import OpenAI
     client = OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key="$NVIDIA_API_KEY")
     completion = client.chat.completions.create(
         model="nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
         messages=[{"role":"user","content":""}],
         temperature=1.00, top_p=0.01, max_tokens=1024, stream=True,
     )
     ```
     This adapter covers NVIDIA NIM, vLLM, Ollama (OpenAI-compat), Groq, Together, OpenRouter, etc.
4. **Streaming required.** Plan text streams from server route to browser via SSE (or fetch streams). Player sees the plan tokenize like a real agent regardless of upstream provider.
5. **Model swap supported.** Settings UI lets the user change provider and model without restarting. OpenAI-compat mode exposes `base_url` + `model` fields.
6. **No vendor lock-in framework.** Reject Claude Agent SDK, OpenAI Agents SDK, Google ADK as the primary framework — they each pin to one provider and defeat the multi-provider requirement. The right shape is direct provider SDKs (or fetch) wrapped in a thin internal adapter interface.

## Framework Hint (Strong Preference)

This is **not** a multi-agent orchestration problem, a stateful workflow problem, or a RAG problem. It's a **provider-pluggable single-turn streaming chat** problem with a setup/config UX. The right answer is:

- A small internal `LLMAdapter` interface (TypeScript) with one method roughly: `streamPlan(missionContext) → AsyncIterable<{ delta: string }>`
- Four implementations behind the interface:
  - `AnthropicAdapter` (uses `@anthropic-ai/sdk`)
  - `OpenAIAdapter` (uses `openai` SDK)
  - `GeminiAdapter` (uses `@google/generative-ai`)
  - `OpenAICompatAdapter` (uses `openai` SDK with `baseURL` override)
- A Next.js API route that picks an adapter from a server-side config file and returns a `text/event-stream` of OpenAI-shaped `delta.content` chunks to the browser.
- A first-run setup page (server-side write) for keys.

The framework selector should not "pick LangChain because everyone uses it" or "pick LangGraph because it's stateful." Those frameworks add abstraction overhead and pull in opinions we don't need for a one-shot streaming call. **Default to: direct provider SDKs + a hand-rolled thin adapter.** If the selector wants to justify a heavier framework, the justification needs to address the four hard constraints above.

## Evaluation Concerns (Pre-Filled)

Because plans are short user-facing text, the eval dimensions that matter most:

- **Tone/style appropriateness** — plan tone must match teen audience, no corporate jargon
- **Output structure validity** — the plan must include the same fields the UI renders (steps, owners) so the correction loop works regardless of provider
- **Safety** — appropriate content for teens; no harmful, biased, or off-topic output
- **Faithfulness to mission context** — plan must respond to the mission's goal, not drift
- **Cross-provider consistency** — the same mission should produce comparable plans across the 4 adapters (smoke check, not strict equivalence)

Skip:
- RAG-specific metrics (no retrieval here)
- Multi-agent handoff metrics (single-turn)
- Tool-use correctness (no tool calls in MVP)

## Out of Scope for Phase 5

- Vision/VLM models wired into mission UI (schema may accommodate, but no feature in Phase 5 — defer to v2 TOOL-02)
- LLM evaluation in production / observability dashboards — internal-only game, no production traffic
- Fine-tuning, custom models, embeddings, RAG

## References

- `.planning/PROJECT.md` — project context and key decisions
- `.planning/REQUIREMENTS.md` — LLM-01..06 requirements
- `.planning/ROADMAP.md` — Phase 5 detail block
- `packages/content/src/missions.ts` — mission schema
- `apps/web/app/page.tsx` — mission board entry point
