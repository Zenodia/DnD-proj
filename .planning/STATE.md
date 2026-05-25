# STATE

**Project:** Solo Leveling · Agent Quest
**Initialized:** 2026-05-25
**Last updated:** 2026-05-25 (Solo Leveling rebrand + live NVIDIA Nemotron streaming verified)
**Current phase:** 5 — LLM integration (live path verified end-to-end)
**Status:** In progress

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-25)

**Core value:** A teen finishes a chapter and can explain how the System planned, what failed inside the plan, and which discipline fixed it.
**Current focus:** Phase 5 — LLM live path now works against NVIDIA NIM Nemotron Nano with reasoning suppression; Phase 6 (verify) still open.

## Phase Progress

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 1 | Map repo with codegraph | ✓ Done | CodeGraph index at `.codegraph/codegraph.db`; queried before refactor |
| 2 | Write spec | ✓ Done | Story bible + 6 chapter docs under `/docs/` now the canonical source |
| 3 | Plan phases | ✓ Done | Phase 5 split out of Phase 4 to isolate the AI integration |
| 4 | Implement scripted slice | ✓ Done | 6 chapters playable end-to-end with zero key — assign → stream → catch flaw → unlock |
| 5 | LLM integration (optional) | ✓ Live verified | Adapter rewritten to raw fetch (bypasses openai SDK reasoning-field drop); NVIDIA NIM Nemotron Nano streams real Quest in ~30s with `[SYSTEM]`-marker extraction; setup page + .env env-fallback both wired |
| 6 | Verify | ◐ Partial | Live NVIDIA stream verified; key-revocation test + Anthropic + Gemini smoke tests still open |

## What Ships Today

**Routes:**
- `/` — campaign home, 6 chapters listed with 7-step + 5-layer tags, mode pill shows scripted vs live model
- `/chapters/[id]` — chapter detail: briefing → Hunter decisions (radio choices from chapter doc) → System feed (streamed Quest) → catch the flaw → unlock
- `/setup` — provider picker (scripted / openai-compat / anthropic / gemini) + 18+ attestation
- `/api/plan` (POST) — SSE stream of `{kind:meta|delta|done|error}` events
- `/api/setup` (POST) — server-side key writer; 18+ gate
- `/api/status` (GET) — redacted public status; never includes the key

**Content (packages/content/src/chapters.ts):**
- 6 chapters mirroring `/docs/chapters/*.md` — Broken Gate / System Awakening / Red Gate Trials / Shadow Guild / City Blackout / Rupture War
- Each chapter binds a 7-step stage and 5-layer discipline
- Each ships a hand-authored scripted Quest with one flawed step + fix string

**LLM adapters (apps/web/lib/llm/):**
- `openai-compat.ts` — raw-fetch SSE adapter. Handles OpenAI native, NVIDIA NIM, Ollama, vLLM, OpenRouter. Detects reasoning models by name, raises `max_tokens`, sends `chat_template_kwargs:{thinking:false}` (some servers honor it), surfaces `reasoning_content` as fallback. For reasoning models, buffers the trace and replays only the slice after the last `[SYSTEM]` marker.
- `anthropic.ts` — Anthropic Messages with `content_block_delta` streaming
- `gemini.ts` — `generateContentStream` with systemInstruction
- `scripted.ts` — zero-key fallback, replays mission tokens at ~35ms
- `index.ts` — router
- `prompts.ts` — System Voice persona builder (cold, sparse, eerie; one flawed step required; binds to chapter learning goal)

**Server config (apps/web/lib/server/config.ts):**
- Reads `.game-config.json` (mode 0600). Falls back to env vars when `GAME_LLM_ENV_ATTEST=1`.
- Env precedence: `NVIDIA_API_KEY` → `OPENAI_API_KEY` → `ANTHROPIC_API_KEY` → `GEMINI_API_KEY`.
- Default NVIDIA model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` (override via `NVIDIA_MODEL`).
- Repo-root `.env` is symlinked into `apps/web/.env` so Next.js reads it.

## Verified Runtime

- `npm install` clean against repo-root `node_modules/`
- `npx next build` — all 6 routes compile (`/`, `/chapters/[id]`, `/setup`, `/api/plan`, `/api/setup`, `/api/status`)
- Scripted SSE — POST `/api/plan` streams `[SYSTEM] First Quest...` tokens with `text/event-stream` framing
- Live SSE — with `GAME_LLM_ENV_ATTEST=1`, POST `/api/plan` against NVIDIA NIM Nemotron Nano returns clean 5-step Quest with the visible flawed line, ~30s total

## Known Gaps

1. AI-SPEC Sections 5/6/7 (eval/guardrails/monitoring) still placeholders — eval-planner halted earlier; remediation deferred
2. Anthropic + Gemini live smoke tests not yet executed (only NVIDIA NIM via openai-compat verified)
3. Zod post-stream schema validation not wired (mentioned in AI-SPEC §4b)
4. No per-session token spend tracker (bill-safety guardrail from AI-SPEC §1b)
5. Dev mode (`next dev`) crashes with a Next 15.5.18 RSC bundler bug on the home route — `next start` against a production build works fine; recommend `npm run build && npm run start` for dev iteration until upstream is fixed
6. Key revocation test (VER-02) still pending

## Next Step

- Smoke-test Anthropic + Gemini paths (just need keys in `.env` and `GAME_LLM_ENV_ATTEST=1`)
- Add a token-cap guardrail to `/api/plan` so a runaway reasoning model can't burn the user's API credit
- Move to Phase 6 verify when both happy paths and a key-revocation test are documented

---
*Last updated: 2026-05-25 after Solo Leveling rebrand + live NVIDIA NIM Nemotron Nano stream verification*
