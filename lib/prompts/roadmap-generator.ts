import { ScoreBreakdown } from '@/types/roadmap'
import { z } from 'zod'

export const PHASE_DEFINITIONS = [
  { number: 1, title: 'Problem Validation', focus_area: 'Confirm the problem is real and acutely painful for a specific person', description: 'Get out of the building. Talk to real people. Validate that the pain you think exists is the pain that actually exists.' },
  { number: 2, title: 'Customer Discovery', focus_area: 'Find and deeply interview 10 target customers', description: 'Map who your customer really is. Understand their workflow, frustrations, and what a solution is worth to them.' },
  { number: 3, title: 'Prototype & Signal', focus_area: 'Build the simplest possible representation of your solution and get feedback', description: 'No-code, mockups, landing page, or manual concierge. The goal is signal, not software.' },
  { number: 4, title: 'First Revenue', focus_area: 'Get someone to pay before you build the full product', description: 'Pre-sell, charge for the concierge version, or take a deposit. Money is the only real validation.' },
  { number: 5, title: 'MVP Launch', focus_area: 'Ship a functional MVP and acquire your first 10 paying customers', description: 'Build only what is needed to deliver the core value. Acquire, onboard, and retain paying users.' },
]

export function getWeakestDimensions(breakdown: ScoreBreakdown): string[] {
  if (!breakdown) return []
  const sorted = Object.entries(breakdown)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([key]) => key.replace(/_/g, ' '))
  return sorted
}

export function buildRoadmapGenerationPrompt(
  ideaTitle: string,
  ideaDescription: string,
  scoreBreakdown: ScoreBreakdown
): string {
  const safeBreakdown = scoreBreakdown || {} as ScoreBreakdown
  const weakDimensions = getWeakestDimensions(safeBreakdown)
  const phase = PHASE_DEFINITIONS[0]

  return `You are an expert startup coach helping a founder execute on their validated idea.

IDEA: "${ideaTitle}"
DESCRIPTION: "${ideaDescription}"

VALIDATION SCORE BREAKDOWN:
${Object.entries(safeBreakdown).map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v}/10`).join('\n')}

WEAKEST DIMENSIONS (prioritise addressing these): ${weakDimensions.length ? weakDimensions.join(', ') : 'None'}

CURRENT PHASE: Phase 1 — ${phase.title}
PHASE FOCUS: ${phase.focus_area}
PHASE CONTEXT: ${phase.description}

Generate Sprint 1 of Phase 1 for this specific founder and idea. Create exactly 5 tasks.

Tasks must be:
- Specific and actionable (not generic startup advice)
- Tied directly to THIS idea and THIS founder's weak score dimensions  
- Completable in 1-3 days each
- Progressive (each task builds on the previous)
- Grounded in the Phase 1 objective: confirming the problem is real

Return ONLY a valid JSON object with this exact structure — no markdown, no preamble:
{
  "title": "[descriptive sprint title]",
  "tasks": [
    {
      "title": "Task title (max 10 words)",
      "description": "What to do and how to do it (2-4 sentences, specific to this idea)",
      "why_this_matters": "Why this specific task matters for this idea (1-2 sentences)",
      "resource_url": "optional relevant URL or null"
    }
  ]
}`
}

export const GeneratedSprintSchema = z.object({
  title: z.string(),
  next_step: z.enum(['NEXT_PHASE', 'ITERATE']).describe('Whether the founder is ready for the next phase or needs to iterate on the current phase focus'),
  iteration_reason: z.string().optional().describe('Reason for recommending another sprint in the same phase'),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string(),
    why_this_matters: z.string(),
    resource_url: z.string().nullable().optional(),
  })).length(5),
})
