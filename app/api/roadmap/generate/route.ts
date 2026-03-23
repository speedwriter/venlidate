import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateObjectWithFallback } from '@/lib/ai/models'
import { buildRoadmapGenerationPrompt, PHASE_DEFINITIONS, GeneratedSprintSchema } from '@/lib/prompts/roadmap-generator'
import { ScoreBreakdown } from '@/types/roadmap'
import { getUserTier, TIER_LIMITS } from '@/lib/utils/subscriptions'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tier = await getUserTier(user.id)
    if (!TIER_LIMITS[tier].canAccessRoadmap) {
      return NextResponse.json({ error: 'Upgrade to Pro to access the 5-phase roadmap.' }, { status: 403 })
    }

    const { idea_id } = await req.json()
    if (!idea_id) return NextResponse.json({ error: 'idea_id required' }, { status: 400 })

    // Fetch idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', idea_id)
      .eq('user_id', user.id)
      .single()
    if (ideaError || !idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 })

    // Check roadmap doesn't already exist
    const { data: existing } = await supabase
      .from('roadmap')
      .select('id')
      .eq('idea_id', idea_id)
      .single()
    if (existing) return NextResponse.json({ error: 'Roadmap already exists', roadmap_id: existing.id }, { status: 409 })

    const scoreBreakdown = idea.score_breakdown as ScoreBreakdown
    const prompt = buildRoadmapGenerationPrompt(idea.title, idea.description, scoreBreakdown)

    // Generate Sprint 1 with fallback chain
    const { object: generatedSprint } = await generateObjectWithFallback({
      schema: GeneratedSprintSchema,
      prompt,
    })

    // Create roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmap')
      .insert({ user_id: user.id, idea_id, generated_at: new Date().toISOString() })
      .select()
      .single()
    if (roadmapError) throw roadmapError

    // Pre-seed all 5 phases
    const phasesToInsert = PHASE_DEFINITIONS.map(p => ({
      roadmap_id: roadmap.id,
      phase_number: p.number,
      title: p.title,
      description: p.description,
      focus_area: p.focus_area,
      status: p.number === 1 ? 'active' : 'locked',
      unlocked_at: p.number === 1 ? new Date().toISOString() : null,
    }))
    const { data: phases, error: phaseError } = await supabase
      .from('phase')
      .insert(phasesToInsert)
      .select()
    if (phaseError) throw phaseError

    const phase1 = phases.find(p => p.phase_number === 1)!

    // Create Sprint 1 as active
    const { data: sprint, error: sprintError } = await supabase
      .from('sprint')
      .insert({
        phase_id: phase1.id,
        roadmap_id: roadmap.id,
        sprint_number: 1,
        title: generatedSprint.title,
        status: 'active',
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (sprintError) throw sprintError

    // Insert 5 tasks
    const tasksToInsert = generatedSprint.tasks.map((t, i) => ({
      sprint_id: sprint.id,
      roadmap_id: roadmap.id,
      user_id: user.id,
      task_number: i + 1,
      title: t.title,
      description: t.description,
      why_this_matters: t.why_this_matters,
      resource_url: t.resource_url || null,
    }))
    const { error: taskError } = await supabase.from('task').insert(tasksToInsert)
    if (taskError) throw taskError

    // Mark idea as roadmap generated
    await supabase.from('ideas').update({ roadmap_generated: true }).eq('id', idea_id)

    return NextResponse.json({ success: true, roadmap_id: roadmap.id })
  } catch (error) {
    console.error('Roadmap generation error:', error)
    return NextResponse.json({ error: 'Roadmap generation failed. Please try again.' }, { status: 500 })
  }
}
