// File: app/api/roadmap/extend/route.ts
// Called when user selects "Continue" (option 3)
// Generates Phase 6-10 dynamically

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { buildExtendedPhasePrompt, ExtendedPhaseSchema } from '@/lib/prompts/extended-phase-generator'

type TaskForContext = {
  title: string
  sprint: { phase: { phase_number: number } | null } | null
  task_reflection: { content: string } | null
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { roadmap_id } = await req.json()

    const { data: roadmap } = await supabase
      .from('roadmap')
      .select('*, idea:ideas(*)')
      .eq('id', roadmap_id)
      .eq('user_id', user.id)
      .single()
    if (!roadmap) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!roadmap.completion_summary) return NextResponse.json({ error: 'Complete Phase 5 first' }, { status: 400 })

    // Determine next phase number
    const { data: existingPhases } = await supabase
      .from('phase')
      .select('phase_number')
      .eq('roadmap_id', roadmap_id)
      .order('phase_number', { ascending: false })
      .limit(1)

    const nextPhaseNumber = (existingPhases?.[0]?.phase_number || 5) + 1
    if (nextPhaseNumber > 10) {
      return NextResponse.json({ error: 'Maximum 10 phases reached' }, { status: 400 })
    }

    const completionSummary = JSON.parse(roadmap.completion_summary)

    // Fetch all reflections for context
    const { data: tasks } = await supabase
      .from('task')
      .select('title, sprint(phase(phase_number)), task_reflection(content)')
      .eq('roadmap_id', roadmap_id)
      .order('created_at', { ascending: true })

    const allReflections = ((tasks || []) as unknown as TaskForContext[])
      .filter(t => t.task_reflection)
      .map(t => ({
        phase: t.sprint?.phase?.phase_number || 0,
        task_title: t.title,
        reflection: t.task_reflection?.content || '',
      }))

    const prompt = buildExtendedPhasePrompt(
      roadmap.idea.title,
      roadmap.idea.description,
      completionSummary,
      allReflections,
      nextPhaseNumber
    )

    const { object: extended } = await generateObject({
      model: google('gemini-2.5-flash-lite'),
      schema: ExtendedPhaseSchema,
      prompt,
    })

    // Insert new phase
    const { data: newPhase, error: phaseError } = await supabase
      .from('phase')
      .insert({
        roadmap_id,
        phase_number: nextPhaseNumber,
        title: extended.phase_title,
        description: extended.phase_description,
        focus_area: extended.phase_focus_area,
        status: 'active',
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (phaseError || !newPhase) throw phaseError ?? new Error('Phase creation failed')

    // Insert Sprint 1
    const { data: newSprint, error: sprintError } = await supabase
      .from('sprint')
      .insert({
        phase_id: newPhase.id,
        roadmap_id,
        sprint_number: 1,
        title: extended.sprint.title,
        status: 'active',
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (sprintError || !newSprint) throw sprintError ?? new Error('Sprint creation failed')

    // Insert 5 tasks
    const { error: taskError } = await supabase.from('task').insert(
      extended.sprint.tasks.map((t, i) => ({
        sprint_id: newSprint.id,
        roadmap_id,
        user_id: user.id,
        task_number: i + 1,
        title: t.title,
        description: t.description,
        why_this_matters: t.why_this_matters,
        resource_url: t.resource_url || null,
      }))
    )
    if (taskError) throw taskError

    // Update roadmap status back to active + increment counters
    await supabase.from('roadmap').update({
      status: 'active',
      current_phase: nextPhaseNumber,
      current_sprint: 1,
      phase_count: nextPhaseNumber,
      post_completion_choice: 'continue',
    }).eq('id', roadmap_id)

    return NextResponse.json({ success: true, phase_id: newPhase!.id })
  } catch (error) {
    console.error('Extend roadmap error:', error)
    return NextResponse.json({ error: 'Failed to extend roadmap. Please try again.' }, { status: 500 })
  }
}
