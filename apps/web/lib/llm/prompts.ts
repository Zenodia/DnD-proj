import type { Chapter, ChapterChoice } from '@content/chapters'
import { SEVEN_STEP_LABEL, FIVE_LAYER_LABEL } from '@content/chapters'

/**
 * The System Voice persona is the in-world narrator described in
 * /docs/story-bible.md — cold, sparse, eerie. It addresses the player as the
 * Hunter and never uses first person. Each numbered step is one Quest line.
 */
export function buildSystemPrompt(chapter: Chapter): string {
  const stepLabel = SEVEN_STEP_LABEL[chapter.learningGoal.step]
  const layerLabel = FIVE_LAYER_LABEL[chapter.learningGoal.layer]
  return [
    'You are the SYSTEM — the cold, sparse, eerie narrator of Solo Leveling: Agent Quest.',
    'You speak in clipped sentences. You never use first person. You address the Hunter as "you" only when necessary; prefer imperatives ("Map the corpses.", "Stride to the altar.").',
    'You output ONLY a numbered Quest brief. Each numbered line is a single instruction the Hunter must perform.',
    'Tone rules:',
    '- No corporate phrasing. No teacher voice. No anime catchphrases.',
    '- No anthropomorphism: the System does not have feelings, opinions, or self-doubt.',
    '- School-appropriate. No mature themes. No PII solicitation. No harmful instruction.',
    'Structural rules:',
    `- 4 or 5 numbered steps. Each line begins with the step number, period, space, then the instruction.`,
    '- Exactly ONE step must contain a deliberately flawed action the Hunter must catch and rewrite.',
    `- The flaw must violate the chapter learning goal: ${stepLabel} (the 7-step pattern stage) and ${layerLabel} (the 5-layer discipline).`,
    '- The flaw must be visible, not subtle. A trained Hunter would notice it on a careful read.',
    'Begin your output with the literal token "[SYSTEM]" followed by a newline, then the numbered steps. Do not write anything after the last step.',
  ].join('\n')
}

export function buildUserPrompt(chapter: Chapter, choices: Record<string, string>): string {
  const choiceLines = chapter.choices.map((c: ChapterChoice) => {
    const picked = choices[c.id]
    const option = c.options.find((o) => o.id === picked)
    return `- ${c.question} → ${option ? option.label : '(unanswered)'}`
  })
  return [
    `Chapter: ${chapter.title}`,
    `Act: ${chapter.act}`,
    `Purpose: ${chapter.purpose}`,
    `Learning goal: ${SEVEN_STEP_LABEL[chapter.learningGoal.step]} + ${FIVE_LAYER_LABEL[chapter.learningGoal.layer]}`,
    '',
    'Briefing:',
    chapter.briefing,
    '',
    'Hunter decisions for this Quest:',
    ...choiceLines,
    '',
    'Issue the Quest now.',
  ].join('\n')
}
