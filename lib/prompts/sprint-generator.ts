import { ScoreBreakdown, GeneratedSprint } from '@/types/roadmap'
import { PHASE_DEFINITIONS, getWeakestDimensions, GeneratedSprintSchema } from './roadmap-generator'
import { z } from 'zod'

export function buildNextSprintPrompt(
  ideaTitle: string,
  ideaDescription: string,
  scoreBreakdown: ScoreBreakdown,
  phaseNumber: number,
  sprintNumber: number,
  priorReflections: { task_title: string; reflection: string }[],
  phaseOverride?: { title: string; focus_area: string }
): string {
  const phase = phaseOverride ?? PHASE_DEFINITIONS[phaseNumber - 1]
  const weakDimensions = getWeakestDimensions(scoreBreakdown)
  const reflectionContext = priorReflections.length > 0
    ? `\nFOUNDER'S PRIOR REFLECTIONS (use these to personalise the next sprint):\n${priorReflections.map(r => `- After "${r.task_title}": "${r.reflection}"`).join('\n')}`
    : '\nNo prior reflections yet.'

  return `You are an expert startup coach helping a founder execute on their validated idea.

IDEA: "${ideaTitle}"
DESCRIPTION: "${ideaDescription}"

VALIDATION SCORE BREAKDOWN:
${scoreBreakdown ? Object.entries(scoreBreakdown).map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v}/10`).join('\n') : 'No score breakdown available'}

WEAKEST DIMENSIONS: ${weakDimensions.join(', ')}

CURRENT PHASE: Phase ${phaseNumber} — ${phase.title}
PHASE FOCUS: ${phase.focus_area}
GENERATING: Sprint ${sprintNumber} of Phase ${phaseNumber}
${reflectionContext}

Using the founder's reflections, generate Sprint ${sprintNumber} that:
- Directly addresses gaps or learnings from prior sprints
- Advances the Phase ${phaseNumber} objective: ${phase.focus_area}
- Is personalised to THIS idea and what THIS founder has learned
- Contains exactly 5 progressive tasks

CRITICAL DECISION:
Evaluate if the founder has sufficiently validated the Phase ${phaseNumber} objective based on their reflections. 
- If they have "signal" and are ready to move on, set "next_step" to "NEXT_PHASE".
- If their reflections show they are stuck, confused, or need more data for Phase ${phaseNumber}, set "next_step" to "ITERATE" and provide a reason.

Return ONLY valid JSON, no markdown, no preamble:
{
  "title": "[descriptive title based on where this founder is]",
  "next_step": "NEXT_PHASE" or "ITERATE",
  "iteration_reason": "if iterating, why?",
  "tasks": [
    {
      "title": "Task title (max 10 words)",
      "description": "Specific action for this founder at this stage (2-4 sentences)",
      "why_this_matters": "Why this matters given what they've learned (1-2 sentences)",
      "resource_url": "optional URL or null"
    }
  ]
}`
}

export { GeneratedSprintSchema }
