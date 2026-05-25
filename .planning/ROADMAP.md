# Roadmap: Anime Agentic AI Game

**Created:** 2026-05-25
**Last updated:** 2026-05-25 (split scripted slice from LLM integration)
**Mode:** mvp (vertical slice first, then optional LLM layer)
**Total phases:** 6

## Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Map repo with codegraph | Existing repo is indexed and summarized | MAP-01, MAP-02 | Pending |
| 2 | Write spec | A current, testable MVP spec exists covering scripted + LLM modes | SPEC-01, SPEC-02 | Pending |
| 3 | Plan phases | Each phase has a concrete plan before code | PLAN-01, PLAN-02 | Pending |
| 4 | Implement scripted slice | One mission playable end-to-end with zero API keys | SLICE-01..04 | Pending |
| 5 | LLM integration (optional) | Provider-pluggable, server-side, streaming LLM layer with first-run setup | LLM-01..06 | Pending |
| 6 | Verify | Both modes demonstrated against MVP acceptance | VER-01, VER-02 | Pending |

## Phase Details

### Phase 1: Map repo with codegraph
**Goal:** Index the existing repo with CodeGraph and write a short structural summary so later phases reason from real code, not assumptions.
**Mode:** mvp
**Requirements:** MAP-01, MAP-02
**UI hint:** no
**Success Criteria:**
1. `scripts/index-codebase.sh` runs cleanly and produces a CodeGraph index
2. `.planning/codebase/` (or equivalent) contains a short summary of `apps/`, `packages/`, and `codegraph/` boundaries
3. Future phases can answer "where does X live" via CodeGraph queries instead of grep

### Phase 2: Write spec
**Goal:** Produce a current MVP spec covering both scripted mode (no key) and LLM-on mode (user-supplied key), with testable acceptance criteria.
**Mode:** mvp
**Requirements:** SPEC-01, SPEC-02
**UI hint:** yes
**Success Criteria:**
1. Spec describes the one-mission playable loop in teen-readable language
2. Spec calls out which behaviors are scripted vs LLM-driven and where they diverge (they shouldn't, UX-wise)
3. Spec supersedes or extends `specs/mvp-spec.md` and is the single source of truth for Phases 4 and 5

### Phase 3: Plan phases
**Goal:** Break the scripted slice and the LLM integration into ordered, dependency-aware tasks.
**Mode:** mvp
**Requirements:** PLAN-01, PLAN-02
**UI hint:** no
**Success Criteria:**
1. Phase 4 and Phase 5 each have concrete task lists with file-level hints
2. Dependencies between scripted slice and LLM integration are explicit (the LLM layer drops into the slice's plan-display seam)
3. Plan check pass confirms the plans would deliver the spec's acceptance criteria

### Phase 4: Implement scripted slice
**Goal:** Ship one mission end-to-end in `pnpm dev` — board, role assignment, scripted plan review, scripted correction, next-mission unlock — with **zero API keys**.
**Mode:** mvp
**Requirements:** SLICE-01, SLICE-02, SLICE-03, SLICE-04
**UI hint:** yes
**Success Criteria:**
1. From a clean clone, `pnpm install && pnpm dev` shows a mission on the board with no env vars set
2. A user can complete the loop (assign roles → review plan → correct mistake → unlock) without console errors
3. The plan-display component exposes a seam (props or context) that Phase 5's LLM stream can drop into without rewriting the UI

### Phase 5: LLM integration (optional)
**Goal:** Add an optional LLM layer that streams real model output into the plan-review UX, supporting Anthropic, OpenAI, Gemini, and any OpenAI-compatible `base_url`, with keys handled server-side and a first-run setup page. **This phase gets an AI-SPEC.**
**Mode:** mvp
**Requirements:** LLM-01, LLM-02, LLM-03, LLM-04, LLM-05, LLM-06
**UI hint:** yes
**Dependencies:** Phase 4 (the slice provides the plan-display seam)
**Success Criteria:**
1. With a key configured (any of the 4 provider modes), the plan-review screen streams real model output that drives the same correction loop as scripted mode
2. With no key configured, the slice still works identically — scripted mode is unchanged
3. The first-run setup page writes the key to a server-side file with mode 600; browser DevTools never reveal the key value
4. A model-swap UI (settings) lets the user change provider and model — including OpenAI-compat `base_url` + `model` overrides like NVIDIA NIM — without restarting the app

### Phase 6: Verify
**Goal:** Demonstrate the slice against MVP acceptance criteria in **both** modes and capture the result.
**Mode:** mvp
**Requirements:** VER-01, VER-02
**UI hint:** no
**Success Criteria:**
1. Each MVP acceptance criterion from the spec is demonstrated twice — once scripted, once with an LLM key
2. `.planning/phases/06-verify/VERIFICATION.md` records both runs and includes a key-revocation check (no client-side cache of the key value)
3. Any gaps are logged as v2 requirements or new phases — not silently dropped

## Dependency Graph

```
1 (map) → 2 (spec) → 3 (plan) → 4 (scripted slice) → 5 (LLM integration) → 6 (verify)
```

Phase 5 depends on Phase 4's plan-display seam. Phase 6 verifies both modes, so it gates on 4 AND 5.

---
*Last updated: 2026-05-25 after LLM-integration split*
