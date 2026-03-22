import { z } from 'zod'
import { ScoreBreakdown } from '@/types/roadmap'

// Guardrail: the logical post-MVP progression stages
// LLM picks from and adapts these — prevents hallucinated or regressive phases
const POST_MVP_STAGE_GUARDRAILS = `
VALID PHASE FOCUS AREAS FOR PHASES 6-10 (choose the most relevant given founder context):
- Retention & repeatability: reduce churn, improve onboarding, get to 10 consistent paying customers
- Unit economics: understand CAC, LTV, payback period, identify if the business is viable at scale
- Scalable acquisition: build a repeatable channel (SEO, outbound, partnerships, paid) beyond founder-led sales
- Product depth: build the 2-3 features that paying customers are asking for most
- Team & delegation: identify the first hire or contractor needed to remove the founder as bottleneck
- Fundraising preparation: build the narrative, metrics, and materials needed for a pre-seed or seed round
- Revenue expansion: upsell, cross-sell, or expand to adjacent customer segments
- Operational infrastructure: CRM, support, billing, contracts — the boring stuff that breaks at scale
- Market positioning: sharpen ICP, messaging, and competitive differentiation based on real customer data

GUARDRAILS — phases 6-10 MUST:
- Progress forward only — never revisit problem/solution fit or customer discovery
- Each phase must be meaningfully different from the previous
- Tasks must be executable by a solo founder or tiny team
- Each phase should represent 4-8 weeks of focused work
- Phases must build on each other logically (e.g. fix retention before scaling acquisition)
`

export function buildExtendedPhasePrompt(
  ideaTitle: string,
  ideaDescription: string,
  completionSummary: { what_you_built: string; key_lessons: string[]; where_you_stand: string },
  allReflections: { phase: number; task_title: string; reflection: string }[],
  nextPhaseNumber: number
): string {
  const recentReflections = allReflections.slice(-10)
    .map(r => `Phase ${r.phase} — "${r.task_title}": ${r.reflection}`)
    .join('\n')

  return `You are an expert startup coach helping a founder scale beyond their first paying customers.

IDEA: "${ideaTitle}"
DESCRIPTION: "${ideaDescription}"

WHERE THIS FOUNDER STANDS:
${completionSummary.where_you_stand}

KEY LESSONS FROM THEIR JOURNEY:
${completionSummary.key_lessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}

RECENT FOUNDER REFLECTIONS:
${recentReflections}

${POST_MVP_STAGE_GUARDRAILS}

You are generating Phase ${nextPhaseNumber} of their extended roadmap (post-MVP scaling).

Based on where this founder actually is — their specific challenges, lessons learned, and current momentum — determine:
1. The single most important focus area for Phase ${nextPhaseNumber} from the valid options above
2. A specific, personalised phase title and description
3. Sprint 1 of this phase: exactly 5 tasks that move this founder forward on that focus area

The tasks must:
- Be specific to THIS founder's situation, not generic startup advice
- Build progressively (each task prepares for the next)
- Be completable by a solo founder within 1-3 days each
- Reflect what this founder has already learned (don't repeat lessons they've logged)

Return ONLY valid JSON, no markdown, no preamble:
{
  "phase_title": "Phase ${nextPhaseNumber}: [specific title]",
  "phase_description": "What this phase is about and why it's the right focus now (2-3 sentences)",
  "phase_focus_area": "one of the valid focus areas above",
  "sprint": {
    "title": "Sprint 1: [specific title]",
    "tasks": [
      {
        "title": "task title (max 10 words)",
        "description": "specific action for this founder (2-4 sentences)",
        "why_this_matters": "why now, given where they are (1-2 sentences)",
        "resource_url": null
      }
    ]
  }
}`
}

export const ExtendedPhaseSchema = z.object({
  phase_title: z.string(),
  phase_description: z.string(),
  phase_focus_area: z.string(),
  sprint: z.object({
    title: z.string(),
    tasks: z.array(z.object({
      title: z.string(),
      description: z.string(),
      why_this_matters: z.string(),
      resource_url: z.string().nullable().optional(),
    })).length(5),
  }),
})
