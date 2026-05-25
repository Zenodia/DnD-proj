# Solo Leveling · Agent Quest

A browser-first Next.js learning game inspired by *Solo Leveling*. Six chapters take you from the weakest trainee surviving the Broken Gate to sovereign command over a Shadow Guild. Every chapter binds one stage of the 7-step agent loop (Trigger → Collect → Enrich → Reason → Produce → Persist → Notify) to one of the 5 disciplines (Guardrail / Spec / TDD / Agentic Harness / Vibe Coding). The "agent" you critique is the in-world System Voice — cold, sparse, eerie — issuing Quests with one deliberately flawed step you must catch and rewrite.

Plays out of the box with **no API key**. Optionally connects to Anthropic, OpenAI, Gemini, or any OpenAI-compatible endpoint (**NVIDIA NIM**, Ollama, vLLM, OpenRouter, …) — the System Voice then comes from a live LLM that streams the Quest token by token.

## What this repo contains

- Next.js 15 / React 19 app at `apps/web/`
- **Story bible + 6 chapter docs** under `/docs/` — the canonical narrative source (`story-bible.md`, `story-beats.md`, `systems-map.md`, `integration-notes.md`, `chapters/chapter-01..06.md`)
- Chapter content surfaced to the app at `packages/content/src/chapters.ts`
- LLM provider adapter stack in `apps/web/lib/llm/` — Anthropic / OpenAI / Gemini / OpenAI-compat + scripted fallback. The openai-compat adapter is **raw-fetch**, not the openai SDK, so it works with NVIDIA NIM reasoning models (Nemotron, etc.) that emit `reasoning_content` the SDK silently drops.
- Server-side key handling in `apps/web/lib/server/config.ts` — keys live only in `.game-config.json` (mode 0600) or `.env`; the browser never sees them
- First-run setup page at `/setup` (web UI) plus `.env` env-fallback (CLI-friendly)
- Claude Code + GSD planning artifacts under `.claude/` and `.planning/`
- CodeGraph indexing config in `codegraph/` (pre-indexed at `.codegraph/codegraph.db`)
- Ubuntu setup script in `env/`; tarball packaging in `scripts/`
- `sample_kimi_vlm_call.py` — reference Python call shape for NVIDIA NIM (vision-language)

## How to play the new game

1. From a fresh clone, get the app running (see [Environment build](#environment-build-ubuntu) for the npm fallback if pnpm isn't around):
   ```bash
   cd apps/web
   pnpm install        # or: npm install
   pnpm dev            # or: npm run build && npm run start  (see Caveat below)
   # open http://localhost:3000  (or 3838 if you used the alt build path)
   ```
2. The landing screen is the **campaign**: six chapter tiles, each tagged with the 7-step stage + 5-layer discipline it teaches. The top of the page shows a **System feed** pill — `Scripted (no key)` by default, or `Live LLM — <provider> · <model>` once configured.
3. Click **Ch.01 — The Broken Gate**. You'll see a briefing (a hidden second chamber, statues that watch back, contradictory orders from senior hunters) and one **Hunter decision** ("How do you move through the second chamber?") with four options — *Trust the raid leader*, *Watch the statues*, *Read the damaged tablets*, *Drag an injured hunter to cover*.
4. Pick an option and press **Issue the Quest →**. The System Voice streams a numbered Quest brief into the feed pane (token by token).
5. One of the steps is **deliberately flawed** — it violates the chapter's Trigger/Guardrail learning goal. The flawed line is surfaced under "Catch the flaw" with a red bar. Rewrite that step in your own words and submit.
6. If your rewrite carries enough of the senior-hunter answer, the System acknowledges and you unlock the next chapter. Six chapters later you're inside the Rupture War.

**Without a key:** the Quest comes from hand-authored `scripted.tokens` baked into each chapter. UX is identical to the live path.

**With a key:** the Quest is generated live by your chosen model. Same UI, same loop, same correction game — just non-deterministic, fresh wording each time.

> **Caveat — Next 15.5.18 RSC bundler bug:** running `next dev` against the home route triggers a known "segment-explorer-node" RSC bundler error in this Next.js version. The production build is unaffected. Until upstream is patched, prefer:
> ```bash
> cd apps/web
> npm run build && npm run start -- --port 3838
> ```
> instead of `npm run dev`. Everything below assumes that path.

## Stop the service

If the dev/prod server is running in the **foreground** of a terminal, press **`Ctrl-C`** and it shuts down cleanly.

If you launched it in the **background** (with trailing `&`, `nohup`, or `disown`), use any of these:

```bash
# Option A — kill anything matching the next process name
pkill -f "next start"          # or "next dev" if you used dev mode

# Option B — kill by port (most precise)
lsof -t -i :3838 | xargs -r kill          # graceful
lsof -t -i :3838 | xargs -r kill -9       # force, if it ignores the first one

# Option C — kill by PID (you saw it when you launched the server)
kill <pid>
```

Confirm it's actually gone:

```bash
pgrep -fa "next start"          # should print nothing
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3838/api/status
# → 000  (no connection — server is down)
```

To **revoke a live LLM key** at the same time:

```bash
rm -f apps/web/.game-config.json     # removes the setup-page-written key
unset GAME_LLM_ENV_ATTEST            # disables the .env fallback in this shell
# (or remove the *_API_KEY lines from .env if you want it gone permanently)
```

Next launch will then come up in **Scripted (no key)** mode.

## Environment build (Ubuntu)

The intended one-time setup:

```bash
# 1. Extract the tarball (or git clone)
# 2. Install OS deps + enable corepack (which provides pnpm)
bash env/setup-ubuntu.sh

# 3. Seed env vars
cp .env.example .env
# Edit .env if you want the live LLM mode (see "Configure an LLM provider" below)

# 4. (Optional) re-index the codebase with CodeGraph
bash scripts/index-codebase.sh

# 5. Install JS deps
pnpm install
```

### If `pnpm` is not available

`env/setup-ubuntu.sh` runs `corepack enable`, which exposes `pnpm` on PATH. If your environment skipped that (sandboxes, container images, restricted shells), the project also builds cleanly with `npm`:

```bash
cd apps/web
npm install --no-audit --no-fund
```

This was the install path verified during implementation.

### Peer dependency caveat (fixed)

Early `next@15.0.0` releases pinned a release-candidate React 19 peer (`19.0.0-rc-65a56d0e-20241020`) and refuse to install against stable `react@19.0.0`. The workspace now pins `next: ^15.1.0` and `react: ^19.0.0`, which resolve cleanly. If you ever see `ERESOLVE ... peer react@"^18.2.0 || 19.0.0-rc-..." from next@15.0.0`, bump `next` to any `^15.1.0`.

### `.env` location

Next.js reads `.env` from the package it's serving — `apps/web/.env`. The repo-root `.env` is symlinked there:

```
apps/web/.env -> ../../.env
```

That symlink is committed. Put new env vars in the repo-root `.env` and they reach Next.js without further work.

## Verify the build

```bash
cd apps/web
npx next build                  # 6 routes: /, /chapters/[id], /setup, /api/plan, /api/setup, /api/status
npx next start --port 3838 &    # production server; sidesteps the Next 15.5.18 dev bug

# 1. Status reports scripted mode by default
curl -s http://localhost:3838/api/status
# → {"configured":false,"provider":"scripted","adultAttested":false}

# 2. Home page renders Solo Leveling branding
curl -s http://localhost:3838/ | grep -oE "Solo Leveling|Ch\.0[1-6]" | sort -u

# 3. SSE Quest stream in scripted mode
curl -sN -X POST http://localhost:3838/api/plan \
  -H "Content-Type: application/json" \
  -d '{"chapterId":"ch01-broken-gate","choices":{"approach":"observe-statues"}}'
# → data: {"kind":"meta","provider":"scripted"}
#   data: {"kind":"delta","text":"[SYSTEM]"}
#   data: {"kind":"delta","text":" First"}
#   ...
#   data: {"kind":"done"}
```

Type-check + lint:

```bash
npx tsc --noEmit
```

## Configure an LLM provider (optional)

Two paths — pick one. **You only need one of them, and the game works fine with none.**

### Path A — `.env` env-fallback (CLI, fastest)

Add to repo-root `.env`:

```bash
NVIDIA_API_KEY="nvapi-..."             # or OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY
GAME_LLM_ENV_ATTEST=1                  # required — affirms the installer is 18+
# Optional overrides:
# NVIDIA_MODEL="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning"   # default — fast
# NVIDIA_MODEL="moonshotai/kimi-k2.6"                            # alternative — slower but VLM-capable
```

Restart the server. The home page mode pill flips to `Live LLM — openai-compat · nvidia/nemotron-...`.

Precedence: `NVIDIA_API_KEY` → `OPENAI_API_KEY` → `ANTHROPIC_API_KEY` → `GEMINI_API_KEY`. First match wins. Default NVIDIA endpoint is `https://integrate.api.nvidia.com/v1`.

`GAME_LLM_ENV_ATTEST=1` mirrors the 18+ checkbox on the setup page — Anthropic and Gemini TOS require an adult key-holder, so the game refuses to call any live provider without this affirmation.

### Path B — the in-game setup page

Open `http://localhost:3838/setup`. Pick a provider radio, paste your key, check the 18+ box, save. The browser POSTs to `/api/setup`; the server writes `apps/web/.game-config.json` with `chmod 0600`; the key is **never sent back to the browser** on any subsequent request.

Recipes:

| Goal | Provider radio | Key | Model | Base URL |
|------|----------------|-----|-------|----------|
| OpenAI native | OpenAI / OpenAI-compatible | `sk-...` from platform.openai.com | `gpt-4o-mini` (default) | *leave blank* |
| **NVIDIA NIM — Nemotron Nano (default, fast)** | OpenAI / OpenAI-compatible | `nvapi-...` from build.nvidia.com | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | `https://integrate.api.nvidia.com/v1` |
| **NVIDIA NIM — Kimi K2.6 (slower, clean output, VLM-capable)** | OpenAI / OpenAI-compatible | same key | `moonshotai/kimi-k2.6` | `https://integrate.api.nvidia.com/v1` |
| Ollama (local) | OpenAI / OpenAI-compatible | any string (Ollama doesn't check) | e.g. `llama3.2:3b` | `http://localhost:11434/v1` |
| vLLM (local) | OpenAI / OpenAI-compatible | whatever vLLM expects | model name vLLM is serving | your vLLM URL ending in `/v1` |
| OpenRouter | OpenAI / OpenAI-compatible | `sk-or-...` from openrouter.ai | e.g. `anthropic/claude-3.5-sonnet` | `https://openrouter.ai/api/v1` |
| Anthropic native | Anthropic | `sk-ant-...` | `claude-3-5-sonnet-latest` (default) | *(hidden)* |
| Gemini native | Gemini | key from aistudio.google.com | `gemini-1.5-flash` (default) | *(hidden)* |

Revert to scripted mode: pick **Scripted** at `/setup` and save, or delete `apps/web/.game-config.json` (and unset `GAME_LLM_ENV_ATTEST`).

### Why the default is Nemotron Nano

User-driven. Nemotron Nano (30B-A3B MoE, reasoning) is the fastest end-to-end among the NVIDIA NIM options we tested; Kimi K2.6 is cleaner but noticeably slower.

> **Reasoning-model caveat (handled).** Nemotron Nano emits a chain-of-thought trace in `delta.reasoning_content` before the final answer. The openai SDK strict-types this field away — we found this the hard way, so the openai-compat adapter is now a raw-fetch SSE parser. For models whose name contains `reasoning`, `-r1`, `thinking`, `nemotron`, or `qwq`, the adapter:
> 1. Sends `chat_template_kwargs: { thinking: false }` (NIM and some vLLM builds honor it)
> 2. Surfaces `reasoning_content` and `reasoning` as fallbacks alongside `content`
> 3. Buffers the full response, finds the **last** `[SYSTEM]` marker, and replays only the cleaned Quest with small per-token delays so the UI keeps its streaming feel.
>
> Net effect: the player sees a brief "…" then the clean Quest. Total wall-clock for a Nemotron Nano Quest is ~25-30s on `integrate.api.nvidia.com`.

### Security posture

- API keys live **only** in `apps/web/.game-config.json` (mode 0600) or process env. Both are server-side.
- `.game-config.json` is in `.gitignore`. `.env` is in `.gitignore` by default; if you commit env vars, never commit the key.
- The browser receives no part of any key on any request. `/api/status` returns a redacted view.
- No `NEXT_PUBLIC_*` env vars carry keys. No `localStorage`/`sessionStorage` use. No key-in-URL.
- LLM calls go from browser → local Next.js server → upstream provider. The server adds the key just before calling the provider.
- Override the config file location with `GAME_CONFIG_PATH=/some/secure/path/game-config.json` if you need to keep it outside the repo on a multi-user box.

## Hardware

See `infra/machine-requirements.md`.

## Tarball

Source archive for fresh Ubuntu machines (excludes `node_modules`, `.next`, `.env`, `.game-config.json`, etc. — see `scripts/tarball-excludes.txt`):

```bash
pnpm tarball      # or: bash scripts/make-tarball.sh
# writes ../dnd-reworked.tar.gz next to the repo by default

# optional overrides:
# TARBALL_NAME=my-bundle.tar.gz TARBALL_OUTPUT=/tmp/my-bundle.tar.gz bash scripts/make-tarball.sh
# TARBALL_INCLUDE_GIT=1 bash scripts/make-tarball.sh   # include .git history
```

## Architecture (one-pager)

```
Browser
  └── /chapters/[id]  →  ChapterRunner (client)
        ├── shows briefing + Hunter decision radios from /docs/chapters/<id>.md
        └── fetch POST /api/plan  (SSE)
              └── Next.js route handler (Node runtime, force-dynamic)
                    ├── reads .game-config.json — or .env if GAME_LLM_ENV_ATTEST=1
                    ├── picks adapter:
                    │     • openai-compat (raw fetch — OpenAI native + NVIDIA NIM + Ollama + vLLM + OpenRouter)
                    │       └── for reasoning models: buffer trace → extract [SYSTEM] block → replay tokenized
                    │     • anthropic (Messages API, content_block_delta)
                    │     • gemini (generateContentStream)
                    │     • scripted (default; replays chapter.scripted.tokens at 35ms)
                    └── streams text/event-stream → browser
                          • data: {"kind":"meta","provider":"...","model":"..."}
                          • data: {"kind":"delta","text":"..."}
                          • data: {"kind":"done"}
                          • data: {"kind":"error","message":"..."}
```

Canonical content lives in markdown:

- `/docs/story-bible.md` — world, factions, characters, tone, authenticity guardrails
- `/docs/story-beats.md` — Acts I–VI campaign spine
- `/docs/systems-map.md` — the 7-step pattern and 5-layer model as gameplay
- `/docs/chapters/chapter-0N-...md` — chapter-by-chapter source-of-truth
- `packages/content/src/chapters.ts` — runtime export consumed by the app
- `.planning/phases/05-llm-integration-optional/05-AI-SPEC.md` — full AI design contract (framework rationale, eval rubric ingredients, regulatory context)
