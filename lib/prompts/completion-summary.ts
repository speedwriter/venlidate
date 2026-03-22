import { z } from 'zod'

export function buildCompletionSummaryPrompt(
  ideaTitle: string,
  ideaDescription: string,
  allReflections: { phase: number; sprint: number; task_title: string; reflection: string }[]
): string {
  const reflectionLog = allReflections
    .map(r => `Phase ${r.phase} Sprint ${r.sprint} — "${r.task_title}": ${r.reflection}`)
    .join('\n')

  return `You are an expert startup coach writing a personalised debrief for a founder who just completed their 5-phase validation roadmap.

IDEA: "${ideaTitle}"
DESCRIPTION: "${ideaDescription}"

FOUNDER'S COMPLETE REFLECTION LOG (read every entry carefully — your entire response must be grounded in these):
${reflectionLog}

---

Write three sections. Every sentence must be derived from the reflection log above — do NOT restate the idea description or make up details not present in the reflections.

1. WHAT YOU BUILT
Write 2-3 sentences describing what this founder actually did and discovered across their journey. Reference specific actions, people they spoke to, experiments they ran, or signals they got — as evidenced by their reflections. Do not describe the idea itself. Describe what the founder *did*.

2. KEY LESSONS
Write exactly 3 lessons. Each lesson must:
- Be drawn from a specific moment or task visible in the reflection log (name the task or phase if it helps ground it)
- State the lesson as a concrete, transferable insight — not a platitude
- Avoid generic advice like "talk to customers" or "validate before building" unless tied to something specific this founder experienced

Bad example: "Talking to customers early is important."
Good example: "When you ran your first 5 customer interviews in Phase 2, you found that the pain point wasn't X — it was Y. That reframe shaped everything after it."

3. WHERE YOU STAND NOW
Write 3 sentences — one for each of these:
- Sentence 1: What real momentum or proof do they have coming out of this (based on their Phase 4/5 reflections)?
- Sentence 2: What is the single biggest unresolved challenge or risk, specific to what their reflections revealed?
- Sentence 3: What should their focus be for the next 90 days, given everything they learned?

Tone: direct, founder-to-founder, honest. No hype, no corporate language, no excessive encouragement.

Return ONLY a valid JSON object, no markdown, no preamble:
{
  "what_you_built": "paragraph text",
  "key_lessons": ["lesson 1", "lesson 2", "lesson 3"],
  "where_you_stand": "paragraph text"
}`
}

export const CompletionSummarySchema = z.object({
  what_you_built: z.string(),
  key_lessons: z.array(z.string()).length(3),
  where_you_stand: z.string(),
})
