# Requirements: Anime Agentic AI Game

**Defined:** 2026-05-25
**Last updated:** 2026-05-25 (split LLM mode into its own phase)
**Core Value:** A teen finishes a mission and can explain how an AI agent plans, acts, and gets corrected.

## v1 Requirements

### Mapping

- [ ] **MAP-01**: Repo is indexed via CodeGraph so downstream phases can query structure
- [ ] **MAP-02**: A short summary of components, ownership, and seams exists in `.planning/`

### Spec

- [ ] **SPEC-01**: A current spec captures the playable MVP slice (one mission, end-to-end) in both scripted and LLM-on modes
- [ ] **SPEC-02**: Acceptance criteria for the slice are testable and observable in the running app

### Planning

- [ ] **PLAN-01**: Work is broken into ordered phases with goals and dependencies
- [ ] **PLAN-02**: Phase 4 (scripted slice) and Phase 5 (LLM integration) each have a concrete task breakdown before code is written

### Slice (scripted mode — Phase 4)

- [ ] **SLICE-01**: One mission renders on the home page mission board
- [ ] **SLICE-02**: A player can open the mission, assign squad roles, and review a scripted agent plan baked into mission content
- [ ] **SLICE-03**: A player can correct a scripted mistake in the agent plan and unlock the next mission
- [ ] **SLICE-04**: The slice runs locally via `pnpm dev` from a clean clone with **zero API keys configured**

### LLM Integration (optional mode — Phase 5)

- [ ] **LLM-01**: A server-side adapter routes plan-generation calls to one of: Anthropic, OpenAI, Gemini, or any OpenAI-compatible endpoint (user-supplied `base_url` + `model`)
- [ ] **LLM-02**: A first-run setup page lets the user pick a provider and enter a key; the server writes it to a file with mode 600 — the browser never receives the key value
- [ ] **LLM-03**: Game functions identically when no key is configured; scripted mode is the default and remains fully supported
- [ ] **LLM-04**: Settings UI lets the user swap provider and model (including OpenAI-compat `base_url` + `model` overrides) without restarting the app
- [ ] **LLM-05**: Plan generation streams to the player token-by-token via SSE (or fetch streams) from the server route, regardless of upstream provider
- [ ] **LLM-06**: At least one mission demonstrates both paths — same UX with a real LLM-generated plan when configured, scripted plan when not

### Verify (Phase 6)

- [ ] **VER-01**: MVP acceptance criteria from `specs/mvp-spec.md` are demonstrated in-app, in **both** scripted and LLM-on modes
- [ ] **VER-02**: A short verification record (`VERIFICATION.md`) captures what was checked, including a key-revocation test (rotating the key takes effect on next call, no client-side cache)

## v2 Requirements

### Content

- **CONT-01**: 5+ missions wired through the same loop
- **CONT-02**: Mission authoring docs for non-engineers

### Tooling

- **TOOL-01**: Tarball packaging script tested on fresh Ubuntu
- **TOOL-02**: Vision/VLM models supported through the OpenAI-compat adapter (analyze image/video in-mission)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first; mobile later |
| Multiplayer | Adds backend complexity; not core to learning loop |
| User accounts | Local state sufficient for MVP |
| Browser-accessible API keys | Security risk — keys are server-side only |
| Heavy single-vendor AI framework (Claude Agent SDK / OpenAI Agents SDK) | Locks the app to one provider; violates the dual-mode + provider-pluggable requirement |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAP-01 | Phase 1 | Pending |
| MAP-02 | Phase 1 | Pending |
| SPEC-01 | Phase 2 | Pending |
| SPEC-02 | Phase 2 | Pending |
| PLAN-01 | Phase 3 | Pending |
| PLAN-02 | Phase 3 | Pending |
| SLICE-01 | Phase 4 | Pending |
| SLICE-02 | Phase 4 | Pending |
| SLICE-03 | Phase 4 | Pending |
| SLICE-04 | Phase 4 | Pending |
| LLM-01 | Phase 5 | Pending |
| LLM-02 | Phase 5 | Pending |
| LLM-03 | Phase 5 | Pending |
| LLM-04 | Phase 5 | Pending |
| LLM-05 | Phase 5 | Pending |
| LLM-06 | Phase 5 | Pending |
| VER-01 | Phase 6 | Pending |
| VER-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-25*
*Last updated: 2026-05-25 after LLM-integration split*
