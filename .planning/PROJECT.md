# Solo Leveling · Agent Quest

## What This Is

A browser-first Next.js game inspired by *Solo Leveling* that teaches teens agentic AI design through play. Six chapters take the player from the weakest trainee surviving the Broken Gate through the Rupture War. Every chapter binds one stage of the 7-step agent loop (Trigger → Collect → Enrich → Reason → Produce → Persist → Notify) to one of the 5 disciplines (Guardrail / Spec / TDD / Agentic Harness / Vibe Coding). The "agent" the player critiques is the in-world System Voice — cold, sparse, eerie — issuing Quests with one deliberately flawed step the player must catch and rewrite.

## Core Value

A teen finishes a chapter and can explain in their own words how the System planned, what failed inside the plan, and what discipline they used to fix it.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Repo is mapped via CodeGraph so planning agents reason from real structure
- [ ] An MVP spec captures the playable slice (mission board → review → correct → unlock) in both scripted and LLM modes
- [ ] The work is broken into ordered phases with clear goals
- [ ] One vertical slice (one mission, end-to-end) is implemented in **scripted mode** — works with zero API keys
- [ ] An optional LLM integration adds provider-agnostic, server-side, streaming model calls (Anthropic / OpenAI / Gemini / OpenAI-compatible base_url) without ever exposing keys to the browser
- [ ] Both modes are verified — acceptance criteria from `specs/mvp-spec.md` pass with and without a configured key

### Out of Scope

- Native mobile app — web-first, mobile later
- Multiplayer / shared sessions — single-player MVP only
- User accounts / persistence backend — local state for MVP
- Browser-side LLM API keys — keys are server-side only; if no key is configured, the scripted mode runs
- Vendor lock-in to a single AI framework — the LLM layer is a thin provider-pluggable adapter, not a heavy single-vendor SDK

## Context

- Next.js 15 / React 19 app at `apps/web`
- Story bible + 6 chapters authored in `/docs/` (story-bible.md, story-beats.md, systems-map.md, chapters/*.md)
- Chapter content surfaced to the app via `packages/content/src/chapters.ts`
- Shared utilities in `packages/shared`
- CodeGraph config at `codegraph/config.yaml`; index lives at `.codegraph/codegraph.db`
- Existing seed spec: `specs/mvp-spec.md` (superseded by `/docs/`)
- pnpm workspace (`pnpm-workspace.yaml`); npm fallback verified
- Ubuntu-first setup with tarball packaging
- `.env` carries the optional NVIDIA NIM key (`NVIDIA_API_KEY`); symlinked into `apps/web/.env` so Next.js picks it up

## Constraints

- **Tech stack**: Next.js + pnpm workspace — do not change
- **Audience**: Teens — language, pacing, and tone must fit, not corporate
- **Greenfield content**: Mission and agent vocabulary need to land for non-engineers
- **Single-machine**: Setup must work from tarball on Ubuntu without extra services

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use CodeGraph before broad repo search | Per `.claude/CLAUDE.md` — keeps token use down and reasoning grounded in real code | — Pending |
| Vertical MVP slice over horizontal layers | Get one mission playable end-to-end before scaling content | — Pending |
| Skip full GSD research phase for now | Repo and spec already exist; minimal scaffold gets us to AI-SPEC fast | — Pending |
| Scripted mode is the default; LLM is opt-in | Adoption gate — teens/schools without paid API access must still play. No-key path is first-class, not degraded | ✓ Good |
| API keys live server-side only | Browser-accessible keys are an unacceptable XSS / exfil risk; first-run setup page writes to a 600-perm server file | ✓ Good |
| Provider-pluggable LLM adapter, not a single-vendor framework | Must support Anthropic, OpenAI, Gemini, and OpenAI-compatible base_url (NVIDIA NIM / vLLM / Ollama / OpenRouter); locking to one SDK defeats the goal | ✓ Good |
| Drop the OpenAI SDK for the openai-compat path; use raw fetch | The SDK strict-types `delta` and silently drops `reasoning_content` returned by NVIDIA NIM reasoning models; fetch gives full control + lets us pass `chat_template_kwargs` | ✓ Good |
| Default to Nemotron Nano reasoning; buffer-extract the final Quest | User asked for nano speed over Kimi K2.6 (slower 1T MoE); reasoning models leak chain-of-thought so the adapter buffers, finds the last `[SYSTEM]` marker, and replays the cleaned answer | ✓ Good |
| Solo Leveling-flavored story bible drives content | A teen audience needs power-fantasy momentum, not a generic squad-role exercise. Chapters 1-6 in `/docs/` are the canonical narrative layer | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-25 after minimal scaffold initialization*
