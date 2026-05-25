# Integration Notes

## Best authoring format

Markdown is the right authoring format for this stage because it is easy to edit, diff, review, and transform into code-facing data. Narrative docs and game design docs are most useful when they remain living documents that can be updated as the project changes.[cite:29][cite:17]

## Recommended repo structure

```text
/docs
  README.md
  game-overview.md
  story-bible.md
  story-beats.md
  systems-map.md
  integration-notes.md
  /chapters
    chapter-01-broken-gate.md
    chapter-02-system-awakening.md
    chapter-03-red-gate-trials.md
    chapter-04-shadow-guild.md
    chapter-05-city-blackout.md
    chapter-06-rupture-war.md
```

## Best way to integrate into an npm game

Keep the markdown as the source of truth and generate runtime content from it. Do not hand-wire lore directly across UI components, route files, and combat systems. Structured markdown is easier for tooling to parse and for collaborators to maintain over time.[cite:29][cite:17]

## Claude Code workflow

1. Read all files in `/docs`.
2. Convert every chapter into a schema such as:

```ts
{
  id: string,
  title: string,
  purpose: string,
  storySummary: string,
  learningGoal: string,
  scenes: { id: string, summary: string }[],
  choices: { id: string, label: string, effectFlags: string[], next: string }[],
  winState: string,
  failState: string,
  rewards: string[],
  tags: string[]
}
```

3. Export those objects into `src/content/story/` as JSON or TypeScript.
4. Keep branching logic and rendering in code, but keep narrative canon in markdown.
5. When story changes, edit markdown first, then regenerate data files.

## Prompt to give Claude Code

```text
Read every markdown file in /docs and /docs/chapters.
Create typed JSON or TypeScript content files for my existing game.
Preserve chapter IDs, scene IDs, choices, flags, learning goals, and progression rewards.
Make the result easy to plug into a scene manager, dialogue UI, or quest system.
Do not invent copyrighted Solo Leveling dialogue or exact canon scenes.
Retain the tone of lethal gates, secret growth, shadow-command escalation, and earned power.
```

## Integration advice

- Use `story-bible.md` for codex and lore UI.
- Use `story-beats.md` for progression screens and chapter ordering.
- Use chapter files for runtime scene content.
- Use `systems-map.md` to label mechanics tutorials and upgrade trees.
- Keep one shared enum for the seven steps and one for the five layers.
- Tag quests with both, so your UI can show “this mission teaches Reason + TDD.”
