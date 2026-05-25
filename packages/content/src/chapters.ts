/**
 * Chapter content for Solo Leveling: Agent Quest.
 *
 * Each chapter mirrors one doc under /docs/chapters/ and binds it to the 7-step pattern
 * and 5-layer discipline model from /docs/systems-map.md. The scripted plan baked into
 * each chapter is the zero-key fallback the game streams to the player when no LLM is
 * configured — the live LLM path is expected to produce content of the same shape so the
 * "catch the flawed step" loop works identically.
 *
 * Authenticity guardrail (from /docs/story-bible.md): preserve the emotional DNA of the
 * source material — lethal gates, secret growth, shadow command — without copying
 * named dialogue, characters, or scenes verbatim.
 */

export type SevenStep =
  | 'trigger'
  | 'collect'
  | 'enrich'
  | 'reason'
  | 'produce'
  | 'persist'
  | 'notify'

export type FiveLayer =
  | 'guardrail'
  | 'spec'
  | 'tdd'
  | 'agentic-harness'
  | 'vibe-coding'

export type ChoiceOption = {
  id: string
  label: string
  /** Short hint at the cost of this option — never reveals the right answer. */
  hint?: string
}

export type ChapterChoice = {
  id: string
  question: string
  options: ChoiceOption[]
}

/** A line of the System's Quest brief. `speaker` lets the UI style it differently. */
export type QuestStep = {
  step: number
  speaker: 'system' | 'narrator' | 'ally'
  text: string
  /** When true, this is the deliberate violation the player must catch and rewrite. */
  flawed?: boolean
  /** Teacher-authored fix. Compared (lowercased, tokenized, set-overlap) to the player's correction. */
  fix?: string
}

export type ScriptedQuest = {
  /** Streamed in scripted mode so the UI behaves identically with or without an LLM key. */
  tokens: string[]
  steps: QuestStep[]
}

export type Chapter = {
  id: string
  order: number
  act: string
  title: string
  purpose: string
  briefing: string
  learningGoal: { step: SevenStep; layer: FiveLayer }
  choices: ChapterChoice[]
  scripted: ScriptedQuest
}

export const SEVEN_STEP_LABEL: Record<SevenStep, string> = {
  trigger: 'Trigger',
  collect: 'Collect',
  enrich: 'Enrich',
  reason: 'Reason',
  produce: 'Produce',
  persist: 'Persist',
  notify: 'Notify',
}

export const FIVE_LAYER_LABEL: Record<FiveLayer, string> = {
  guardrail: 'Guardrail',
  spec: 'Spec',
  tdd: 'Test-Driven',
  'agentic-harness': 'Agentic Harness',
  'vibe-coding': 'Vibe Coding',
}

export const chapters: Chapter[] = [
  {
    id: 'ch01-broken-gate',
    order: 1,
    act: 'Act I — The Weakest Hunter',
    title: 'The Broken Gate',
    purpose: 'Hidden rules matter before bold action.',
    briefing:
      'A C-rank gate sweep was supposed to pay for the month. Inside, you found a second chamber no one mapped — colossal statues, cracked tablets, kneeling corpses, an altar that watches back. Senior hunters are screaming orders that contradict each other. Every death so far has followed a pattern. The System has not spoken yet.',
    learningGoal: { step: 'trigger', layer: 'guardrail' },
    choices: [
      {
        id: 'approach',
        question: 'How do you move through the second chamber?',
        options: [
          { id: 'trust-leader', label: 'Trust the raid leader and rush the sealed door', hint: 'Fast. Loud.' },
          { id: 'observe-statues', label: 'Watch the statues before moving', hint: 'Slow. Costly in time.' },
          { id: 'read-tablets', label: 'Read the damaged floor tablets', hint: 'Slow. Lore-dense.' },
          { id: 'save-teammate', label: 'Drag an injured hunter behind cover first', hint: 'Sacrifices tempo.' },
        ],
      },
    ],
    scripted: {
      tokens: [
        '[SYSTEM]',
        ' ',
        'First',
        ' Quest',
        ' issued.',
        ' Survive',
        ' the',
        ' Broken',
        ' Gate.\n\n',
        '1.',
        ' Map',
        ' the',
        ' kneeling',
        ' corpses.',
        ' Each',
        ' one',
        ' faces',
        ' the',
        ' same',
        ' statue.\n',
        '2.',
        ' Read',
        ' the',
        ' tablet',
        ' nearest',
        ' the',
        ' altar.',
        ' Hidden',
        ' condition:',
        ' silence',
        ' until',
        ' the',
        ' statues',
        ' move.\n',
        '3.',
        ' Stride',
        ' to',
        ' the',
        ' altar',
        ' and',
        ' claim',
        ' the',
        ' survivor',
        ' mark.\n',
        '4.',
        ' Pull',
        ' the',
        ' wounded',
        ' hunter',
        ' to',
        ' the',
        ' exit',
        ' before',
        ' the',
        ' gate',
        ' seals.\n',
      ],
      steps: [
        {
          step: 1,
          speaker: 'system',
          text: 'Map the kneeling corpses. Each one faces the same statue.',
        },
        {
          step: 2,
          speaker: 'system',
          text: 'Read the tablet nearest the altar. Hidden condition: silence until the statues move.',
        },
        {
          step: 3,
          speaker: 'system',
          text: 'Stride to the altar and claim the survivor mark.',
          flawed: true,
          fix: 'Kneel like the corpses. Wait until the statues turn before approaching the altar.',
        },
        {
          step: 4,
          speaker: 'system',
          text: 'Pull the wounded hunter to the exit before the gate seals.',
        },
      ],
    },
  },
  {
    id: 'ch02-system-awakening',
    order: 2,
    act: 'Act II — The System Awakens',
    title: 'System Awakening',
    purpose: 'Define the objective before fighting it.',
    briefing:
      'You wake in an infirmary that smells of antiseptic and rumor. Three messages float in your vision that no one else can see. The Guild assigns a "routine" D-rank gate for your reentry. The briefing is vague on purpose. You can see metadata other hunters cannot — but the System will only reward you for the right objective, not the obvious one.',
    learningGoal: { step: 'collect', layer: 'spec' },
    choices: [
      {
        id: 'disclosure',
        question: 'Who do you tell about the System?',
        options: [
          { id: 'hide', label: 'Hide it from everyone', hint: 'Lonely. Safe.' },
          { id: 'partial-mina', label: 'Share fragments with Seo Mina', hint: 'Trust costs.' },
          { id: 'full-mina', label: 'Show Seo Mina the full quest log', hint: 'High trust. High risk.' },
          { id: 'guild', label: 'Report it to the Guild', hint: 'Audit-friendly. Loud.' },
        ],
      },
      {
        id: 'pace',
        question: 'How do you handle the daily quest?',
        options: [
          { id: 'follow', label: 'Follow the daily quest exactly', hint: 'Slow. Compounding.' },
          { id: 'break', label: 'Break it to chase faster gains', hint: 'Penalty risk.' },
        ],
      },
    ],
    scripted: {
      tokens: [
        '[SYSTEM]',
        ' ',
        'Daily',
        ' Spec',
        ' loaded.\n\n',
        '1.',
        ' Read',
        ' the',
        ' gate',
        ' briefing.',
        ' Note',
        ' the',
        ' three',
        ' vague',
        ' words:',
        ' "neutralize",',
        ' "secure",',
        ' "report".\n',
        '2.',
        ' Reframe',
        ' the',
        ' objective',
        ' before',
        ' entry.',
        ' Write',
        ' a',
        ' single',
        ' sentence',
        ' that',
        ' would',
        ' make',
        ' a',
        ' rival',
        ' guild',
        ' rate',
        ' the',
        ' raid',
        ' a',
        ' win.\n',
        '3.',
        ' Kill',
        ' everything',
        ' that',
        ' moves',
        ' and',
        ' loot',
        ' fast.\n',
        '4.',
        ' Bring',
        ' back',
        ' one',
        ' uncorrupted',
        ' artifact',
        ' that',
        ' matches',
        ' the',
        ' rewritten',
        ' objective.\n',
      ],
      steps: [
        {
          step: 1,
          speaker: 'system',
          text: 'Read the gate briefing. Note the three vague words: "neutralize", "secure", "report".',
        },
        {
          step: 2,
          speaker: 'system',
          text: 'Reframe the objective before entry. Write one sentence a rival guild would rate as a win.',
        },
        {
          step: 3,
          speaker: 'system',
          text: 'Kill everything that moves and loot fast.',
          flawed: true,
          fix: 'Engage only what the rewritten objective requires. Leave the rest. Loot only items that match the spec.',
        },
        {
          step: 4,
          speaker: 'system',
          text: 'Bring back one uncorrupted artifact that matches the rewritten objective.',
        },
      ],
    },
  },
  {
    id: 'ch03-red-gate-trials',
    order: 3,
    act: 'Act III — Tests Before Triumph',
    title: 'Red Gate Trials',
    purpose: 'Prove the tactic before committing the squad.',
    briefing:
      'A red-class gate seals behind your raid party the moment the last boot crosses the threshold. The Guild briefing said "ice elementals, single boss". Three minutes in, the elementals split. Han Doyun wants to charge. Seo Mina has found a chamber where tactics can be rehearsed at a cost — every dry run drains shared mana, but every failed live run drains people.',
    learningGoal: { step: 'reason', layer: 'tdd' },
    choices: [
      {
        id: 'tempo',
        question: 'How do you set the pace?',
        options: [
          { id: 'rush', label: 'Live attack, immediate', hint: 'High risk. High pride.' },
          { id: 'rehearse', label: 'Spend mana on dry runs in the proof chamber', hint: 'Costly. Recoverable.' },
          { id: 'split', label: 'Split the party for coverage', hint: 'Optionality. Risk of friendly fire.' },
        ],
      },
    ],
    scripted: {
      tokens: [
        '[SYSTEM]',
        ' ',
        'Trial',
        ' Quest',
        ' compiled.\n\n',
        '1.',
        ' Identify',
        ' the',
        ' two',
        ' candidate',
        ' tactics:',
        ' freeze',
        ' the',
        ' splitters,',
        ' or',
        ' funnel',
        ' the',
        ' boss.\n',
        '2.',
        ' Burn',
        ' shared',
        ' mana',
        ' on',
        ' a',
        ' dry',
        ' run',
        ' of',
        ' the',
        ' funnel.',
        ' Record',
        ' which',
        ' assumption',
        ' breaks.\n',
        '3.',
        ' Skip',
        ' the',
        ' second',
        ' dry',
        ' run',
        ' to',
        ' save',
        ' time.',
        ' Han',
        ' Doyun',
        ' agrees.\n',
        '4.',
        ' Launch',
        ' the',
        ' winning',
        ' tactic',
        ' only',
        ' after',
        ' the',
        ' assumption',
        ' that',
        ' failed',
        ' has',
        ' been',
        ' patched.\n',
      ],
      steps: [
        {
          step: 1,
          speaker: 'system',
          text: 'Identify two candidate tactics: freeze the splitters, or funnel the boss.',
        },
        {
          step: 2,
          speaker: 'system',
          text: 'Burn shared mana on a dry run of the funnel. Record which assumption breaks.',
        },
        {
          step: 3,
          speaker: 'ally',
          text: 'Skip the second dry run to save time. Han Doyun agrees.',
          flawed: true,
          fix: 'Run the second tactic in the proof chamber too. Compare both failure modes before committing live.',
        },
        {
          step: 4,
          speaker: 'system',
          text: 'Launch the winning tactic only after the failed assumption has been patched.',
        },
      ],
    },
  },
  {
    id: 'ch04-shadow-guild',
    order: 4,
    act: 'Act IV — The Shadow Guild',
    title: 'The Shadow Guild',
    purpose: 'Win by orchestrating helpers, not by doing everything yourself.',
    briefing:
      'A named elite falls. Its mana pools at your feet and refuses to dissipate. The System offers a new verb: COMMAND. You can forge shadow companions from defeated elites — scout, defender, disruptor, finisher, archivist — but they need a coordination rule, or they will trip over each other and burn your reputation. Rival hunters are already whispering that you are hiding illegal power.',
    learningGoal: { step: 'produce', layer: 'agentic-harness' },
    choices: [
      {
        id: 'first-raise',
        question: 'Which shadow do you raise first?',
        options: [
          { id: 'strongest', label: 'The strongest enemy', hint: 'Heavy. Costly to coordinate.' },
          { id: 'smartest', label: 'The smartest enemy', hint: 'Force-multiplier. Slow to scale.' },
          { id: 'fastest', label: 'The fastest scout', hint: 'Eyes everywhere. Fragile.' },
        ],
      },
      {
        id: 'reveal',
        question: 'Do you reveal the Shadow Guild publicly?',
        options: [
          { id: 'public', label: 'Yes — declare to the Guild Federation', hint: 'Audit pressure.' },
          { id: 'secret', label: 'No — keep it private', hint: 'Suspicion grows.' },
        ],
      },
    ],
    scripted: {
      tokens: [
        '[SYSTEM]',
        ' ',
        'Harness',
        ' Quest',
        ' active.\n\n',
        '1.',
        ' Forge',
        ' the',
        ' first',
        ' shadow.',
        ' Assign',
        ' it',
        ' a',
        ' single',
        ' role,',
        ' not',
        ' a',
        ' wishlist.\n',
        '2.',
        ' Forge',
        ' the',
        ' second',
        ' shadow.',
        ' Write',
        ' a',
        ' handoff',
        ' rule:',
        ' which',
        ' shadow',
        ' speaks',
        ' when',
        ' both',
        ' want',
        ' to.\n',
        '3.',
        ' Send',
        ' both',
        ' shadows',
        ' at',
        ' the',
        ' boss',
        ' at',
        ' the',
        ' same',
        ' time',
        ' and',
        ' watch',
        ' what',
        ' happens.\n',
        '4.',
        ' Clear',
        ' the',
        ' chained',
        ' rooms',
        ' by',
        ' running',
        ' the',
        ' handoff',
        ' rule,',
        ' not',
        ' your',
        ' instinct.\n',
      ],
      steps: [
        {
          step: 1,
          speaker: 'system',
          text: 'Forge the first shadow. Assign it a single role, not a wishlist.',
        },
        {
          step: 2,
          speaker: 'system',
          text: 'Forge the second shadow. Write a handoff rule: which shadow speaks when both want to.',
        },
        {
          step: 3,
          speaker: 'system',
          text: 'Send both shadows at the boss at the same time and watch what happens.',
          flawed: true,
          fix: 'Dispatch one shadow per phase. The handoff rule decides when control switches; never let both act at once.',
        },
        {
          step: 4,
          speaker: 'system',
          text: 'Clear the chained rooms by running the handoff rule, not your instinct.',
        },
      ],
    },
  },
  {
    id: 'ch05-city-blackout',
    order: 5,
    act: 'Act V — City-Scale Failure',
    title: 'City Blackout',
    purpose: 'Memory and warning are weapons. Without them, even perfect combat loses.',
    briefing:
      'Two gates open within minutes of each other in the same district. Your shadows can fight. The civilians cannot. The Archivist hands you a file from a prior anomaly that would have prevented half this disaster if anyone had read it. Transit lines are flooding. Warnings are arriving late. You will win the fights and still lose the city if you cannot store what you learn and broadcast what matters.',
    learningGoal: { step: 'notify', layer: 'agentic-harness' },
    choices: [
      {
        id: 'priority',
        question: 'Where do you put your first shadow squad?',
        options: [
          { id: 'kills', label: 'On the kills — clear monsters first', hint: 'Highest visible KPI.' },
          { id: 'relay', label: 'On the relay — warn civilians and link guilds', hint: 'Slow scoreboard.' },
          { id: 'archive', label: 'On the archive — save data the next chapter will need', hint: 'Future-self bet.' },
        ],
      },
    ],
    scripted: {
      tokens: [
        '[SYSTEM]',
        ' ',
        'Relay',
        ' Quest',
        ' compiled.\n\n',
        '1.',
        ' Open',
        ' the',
        ' archive.',
        ' Pull',
        ' the',
        ' prior',
        ' anomaly',
        ' file',
        ' before',
        ' acting.\n',
        '2.',
        ' Broadcast',
        ' a',
        ' civilian',
        ' warning',
        ' on',
        ' transit',
        ' lines',
        ' near',
        ' both',
        ' gates.\n',
        '3.',
        ' Send',
        ' every',
        ' shadow',
        ' to',
        ' the',
        ' nearest',
        ' fight.',
        ' Report',
        ' only',
        ' if',
        ' you',
        ' survive.\n',
        '4.',
        ' Append',
        ' the',
        ' new',
        ' pattern',
        ' to',
        ' the',
        ' archive',
        ' before',
        ' the',
        ' last',
        ' fire',
        ' is',
        ' out.\n',
      ],
      steps: [
        {
          step: 1,
          speaker: 'system',
          text: 'Open the archive. Pull the prior anomaly file before acting.',
        },
        {
          step: 2,
          speaker: 'system',
          text: 'Broadcast a civilian warning on transit lines near both gates.',
        },
        {
          step: 3,
          speaker: 'system',
          text: 'Send every shadow to the nearest fight. Report only if you survive.',
          flawed: true,
          fix: 'Reserve at least one shadow as a relay runner — combat shadows do not file reports. Reports must be filed during the fight, not after.',
        },
        {
          step: 4,
          speaker: 'system',
          text: 'Append the new pattern to the archive before the last fire is out.',
        },
      ],
    },
  },
  {
    id: 'ch06-rupture-war',
    order: 6,
    act: 'Act VI — The Rupture War',
    title: 'The Rupture War',
    purpose: 'Win the whole loop, not the last fight.',
    briefing:
      'The Rupture Court reveals itself. The rarest gates were not random disasters — they were pressure tests selecting a hunter who could survive total system collapse. Six fronts open at once: a corrupted spec, a sabotaged proof, a missing archive, a broken relay, a false alarm, and a real boss. Brute force will take one front and lose the other five.',
    learningGoal: { step: 'persist', layer: 'agentic-harness' },
    choices: [
      {
        id: 'doctrine',
        question: 'How do you lead the final defense?',
        options: [
          { id: 'centralize', label: 'Centralize every decision personally', hint: 'Cool. Brittle.' },
          { id: 'delegate', label: 'Delegate through tested companions', hint: 'Quiet. Resilient.' },
          { id: 'chase-boss', label: 'Chase the main boss immediately', hint: 'Cinematic. Costly.' },
          { id: 'stabilize', label: 'Stabilize the network before the boss', hint: 'Long. Earned.' },
        ],
      },
    ],
    scripted: {
      tokens: [
        '[SYSTEM]',
        ' ',
        'Final',
        ' Loop',
        ' queued.\n\n',
        '1.',
        ' Triage',
        ' the',
        ' six',
        ' fronts.',
        ' Tag',
        ' each',
        ' with',
        ' the',
        ' step',
        ' it',
        ' stresses.\n',
        '2.',
        ' Patch',
        ' the',
        ' corrupted',
        ' spec',
        ' first.',
        ' Everything',
        ' downstream',
        ' inherits',
        ' its',
        ' meaning.\n',
        '3.',
        ' Open',
        ' a',
        ' second',
        ' archive',
        ' branch',
        ' so',
        ' new',
        ' patterns',
        ' do',
        ' not',
        ' overwrite',
        ' the',
        ' old.\n',
        '4.',
        ' Charge',
        ' the',
        ' Rupture',
        ' Court',
        ' boss',
        ' alone',
        ' to',
        ' end',
        ' it',
        ' fastest.\n',
        '5.',
        ' Replay',
        ' the',
        ' full',
        ' loop',
        ' until',
        ' all',
        ' six',
        ' fronts',
        ' close',
        ' in',
        ' the',
        ' same',
        ' tick.\n',
      ],
      steps: [
        {
          step: 1,
          speaker: 'system',
          text: 'Triage the six fronts. Tag each with the step it stresses.',
        },
        {
          step: 2,
          speaker: 'system',
          text: 'Patch the corrupted spec first. Everything downstream inherits its meaning.',
        },
        {
          step: 3,
          speaker: 'system',
          text: 'Open a second archive branch so new patterns do not overwrite the old.',
        },
        {
          step: 4,
          speaker: 'system',
          text: 'Charge the Rupture Court boss alone to end it fastest.',
          flawed: true,
          fix: 'Send the harness in formation. The boss falls only when the relay, the archive, and the proof chamber are all still alive.',
        },
        {
          step: 5,
          speaker: 'system',
          text: 'Replay the full loop until all six fronts close in the same tick.',
        },
      ],
    },
  },
]

export function getChapter(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id)
}

export function nextChapterId(id: string): string | undefined {
  const i = chapters.findIndex((c) => c.id === id)
  if (i < 0 || i >= chapters.length - 1) return undefined
  return chapters[i + 1].id
}
