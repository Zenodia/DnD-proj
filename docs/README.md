# Solo Leveling Agent Quest Docs

This docs pack is a narrative source-of-truth for an interactive web game inspired by the structure, escalation, and emotional rhythm of *Solo Leveling*, while redirecting the plot toward teaching agentic application design through play.[cite:3][cite:2]

The intended audience already knows the original *Solo Leveling* story, so this adaptation keeps the familiar beats that make the series fun: the weakest starter, a lethal opening dungeon, a System-like guide, escalating gates, stronger enemies, a growing summoned force, and a shift from survival to world-scale responsibility.[cite:3]

## Folder map

- `game-overview.md` — product framing, audience, design pillars, and adaptation rules.
- `story-bible.md` — world, tone, factions, characters, and canon guardrails.
- `story-beats.md` — full campaign arc.
- `systems-map.md` — how the 7-step pattern and 5 layers map into gameplay.
- `integration-notes.md` — how to use these docs with a baseline npm game and Claude Code.
- `chapters/` — chapter-ready markdown files for content integration.

## Recommended workflow

1. Treat these markdown files as the canonical narrative layer.
2. Ask Claude Code to convert each chapter into structured runtime data.
3. Keep implementation-specific state and rendering logic in code.
4. Update the markdown first when the story changes, then regenerate code-facing assets.

## Suggested ingestion prompt for Claude Code

```text
Read all markdown files in /docs.
Extract chapters, scene IDs, learning goals, choices, flags, fail states, rewards, and next-scene links.
Convert them into strongly typed JSON or TypeScript objects for the game engine.
Preserve the Solo Leveling-inspired tone, but do not introduce copyrighted dialogue or direct scene copies.
Keep the seven-step pattern and five-layer teaching model explicit in the exported data.
```
