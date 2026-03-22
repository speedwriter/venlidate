// File: app/api/roadmap/sprint/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { buildNextSprintPrompt, GeneratedSprintSchema } from '@/lib/prompts/sprint-generator'
import { buildCompletionSummaryPrompt, CompletionSummarySchema } from '@/lib/prompts/completion-summary'
import { ScoreBreakdown } from '@/types/roadmap'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { completed_sprint_id, roadmap_id } = await req.json()

    // Fetch roadmap + idea
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmap')
      .select('*, idea:ideas(*)')
      .eq('id', roadmap_id)
      .eq('user_id', user.id)
      .single()
    
    if (roadmapError || !roadmap) {
      console.error('Roadmap fetch error:', roadmapError || 'No roadmap data')
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    // Safety check for joined idea data
    const idea = Array.isArray(roadmap.idea) ? roadmap.idea[0] : roadmap.idea
    if (!idea) {
      console.error('Idea relation not found for roadmap:', roadmap_id)
      return NextResponse.json({ error: 'Idea context missing' }, { status: 404 })
    }

    // Fetch completed sprint + its phase
    const { data: completedSprint } = await supabase
      .from('sprint')
      .select('*, phase(*)')
      .eq('id', completed_sprint_id)
      .single()
    if (!completedSprint) return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
    
    const currentPhaseNumber = completedSprint.phase.phase_number
    const currentSprintNumber = completedSprint.sprint_number

    // --- RESET LOGIC FOR REVISITING EARLIER PHASES ---
    // 1. Find all phases with phase_number > currentPhaseNumber
    const { data: futurePhases } = await supabase
      .from('phase')
      .select('id')
      .eq('roadmap_id', roadmap_id)
      .gt('phase_number', currentPhaseNumber)
    
    const futurePhaseIds = futurePhases?.map(p => p.id) || []

    // 2. Find all sprints in current phase with sprint_number > currentSprintNumber
    const { data: futureSprintsInCurrentPhase } = await supabase
      .from('sprint')
      .select('id')
      .eq('phase_id', completedSprint.phase_id)
      .gt('sprint_number', currentSprintNumber)
    
    const futureSprintIdsInCurrentPhase = futureSprintsInCurrentPhase?.map(s => s.id) || []

    // 3. Find all sprints in future phases
    const { data: futureSprintsInFuturePhases } = await supabase
      .from('sprint')
      .select('id')
      .in('phase_id', futurePhaseIds)
    
    const futureSprintIdsInFuturePhases = futureSprintsInFuturePhases?.map(s => s.id) || []
    
    const allFutureSprintIds = [...futureSprintIdsInCurrentPhase, ...futureSprintIdsInFuturePhases]

    console.log(`[NextSprintGen] Current: P${currentPhaseNumber} S${currentSprintNumber}. Future sprints found: ${allFutureSprintIds.length}`)

    if (allFutureSprintIds.length > 0) {
      try {
        // 1. Get all task IDs for these future sprints
        const { data: futureTasks } = await supabase
          .from('task')
          .select('id')
          .in('sprint_id', allFutureSprintIds)
        
        const futureTaskIds = futureTasks?.map(t => t.id) || []
        console.log(`[NextSprintGen] Deleting ${futureTaskIds.length} tasks and their reflections`)

        if (futureTaskIds.length > 0) {
          // 2. Delete reflections for these tasks
          const { error: relError } = await supabase.from('task_reflection').delete().in('task_id', futureTaskIds)
          if (relError) console.error('[NextSprintGen] Error deleting reflections:', relError)
          
          // 3. Delete tasks
          const { error: taskError } = await supabase.from('task').delete().in('id', futureTaskIds)
          if (taskError) console.error('[NextSprintGen] Error deleting tasks:', taskError)
        }
        
        // 4. Delete future sprints
        console.log('[NextSprintGen] Deleting future sprints:', allFutureSprintIds)
        const { error: sprintError } = await supabase.from('sprint').delete().in('id', allFutureSprintIds)
        if (sprintError) console.error('[NextSprintGen] Error deleting sprints:', sprintError)
        
        // 5. Reset future phases to locked
        if (futurePhaseIds.length > 0) {
          console.log('[NextSprintGen] Resetting phases to locked:', futurePhaseIds)
          const { error: phaseError } = await supabase.from('phase').update({
            status: 'locked',
            completed_at: null,
            unlocked_at: null
          }).in('id', futurePhaseIds)
          if (phaseError) console.error('[NextSprintGen] Error resetting phases:', phaseError)
        }
      } catch (err) {
        console.error('[NextSprintGen] Fatal error during history reset:', err)
      }
    }
    // --- END RESET LOGIC ---

    // Fetch all prior reflections for this roadmap (for context)
    const { data: reflections } = await supabase
      .from('task_reflection')
      .select('content, task(title)')
      .eq('user_id', user.id)
      .in('task_id',
        (await supabase.from('task').select('id').eq('roadmap_id', roadmap_id)).data?.map(t => t.id) || []
      )

    const priorReflections = (reflections || []).map(r => ({
      task_title: (r.task as any)?.title || '',
      reflection: r.content,
    }))

    const scoreBreakdown = (idea.score_breakdown || {}) as ScoreBreakdown
    const nextSprintNumber = completedSprint.sprint_number + 1

    const phaseOverride = currentPhaseNumber > 5
      ? { title: completedSprint.phase.title, focus_area: completedSprint.phase.focus_area }
      : undefined

    const prompt = buildNextSprintPrompt(
      idea.title,
      idea.description,
      scoreBreakdown,
      currentPhaseNumber,
      nextSprintNumber,
      priorReflections,
      phaseOverride
    )

    const { object: generatedSprint } = await generateObject({
      model: google('gemini-2.5-flash-lite'),
      schema: GeneratedSprintSchema,
      prompt,
    })

    // Determine if next sprint is in same phase or new phase based on AI recommendation
    const isPhaseComplete = generatedSprint.next_step === 'NEXT_PHASE'
    const nextPhaseNumber = isPhaseComplete ? currentPhaseNumber + 1 : currentPhaseNumber

    if (nextPhaseNumber > 5) {
      // Mark sprint and phase as completed
      await supabase.from('sprint').update({
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', completed_sprint_id)

      await supabase.from('phase').update({
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', completedSprint.phase_id)

      // Generate completion summary
      const { data: tasks } = await supabase
        .from('task')
        .select('title, task_number, sprint(sprint_number, phase(phase_number)), task_reflection(content)')
        .eq('roadmap_id', roadmap_id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      const allReflections = (tasks || [])
        .filter(t => t.task_reflection)
        .map(t => ({
          phase: (t.sprint as any)?.phase?.phase_number || 0,
          sprint: (t.sprint as any)?.sprint_number || 0,
          task_title: t.title,
          reflection: (t.task_reflection as any)?.content || '',
        }))

      const completionPrompt = buildCompletionSummaryPrompt(idea.title, idea.description, allReflections)
      const { object: summary } = await generateObject({
        model: google('gemini-2.5-flash-lite'),
        schema: CompletionSummarySchema,
        prompt: completionPrompt,
      })

      await supabase.from('roadmap').update({
        status: 'completed',
        completion_summary: JSON.stringify(summary),
        completion_summary_generated_at: new Date().toISOString(),
      }).eq('id', roadmap_id)

      return NextResponse.json({ success: true, roadmap_complete: true })
    }

    // Get or unlock next phase
    let targetPhase
    if (isPhaseComplete) {
      console.log('Phase complete. Transitioning to phase:', nextPhaseNumber)
      const { data: nextPhase } = await supabase
        .from('phase')
        .select()
        .eq('roadmap_id', roadmap_id)
        .eq('phase_number', nextPhaseNumber)
        .single()

      if (!nextPhase) {
        console.error('Next phase not found:', nextPhaseNumber)
        throw new Error(`Phase ${nextPhaseNumber} not found in database.`)
      }

      await supabase.from('phase').update({
        status: 'active',
        unlocked_at: new Date().toISOString()
      }).eq('id', nextPhase.id)

      await supabase.from('phase').update({
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', completedSprint.phase_id)

      targetPhase = nextPhase
    } else {
      console.log('Staying in current phase:', currentPhaseNumber)
      targetPhase = completedSprint.phase
    }

    const targetPhaseNumber = isPhaseComplete ? nextPhaseNumber : currentPhaseNumber
    // If iterating, we might want to keep the sprint number or increment it. Let's increment it within the phase.
    const targetSprintNumber = isPhaseComplete ? 1 : nextSprintNumber

    // Mark completed sprint as done
    await supabase.from('sprint').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', completed_sprint_id)

    // FINAL SAFETY: Delete any existing sprint that might conflict with the one we're about to insert
    console.log(`[NextSprintGen] Cleaning up potential conflict for P${targetPhase!.id} S${targetSprintNumber}`)
    const { data: conflictSprint } = await supabase
      .from('sprint')
      .select('id')
      .eq('phase_id', targetPhase!.id)
      .eq('sprint_number', targetSprintNumber)
      .maybeSingle()

    if (conflictSprint) {
      console.log('[NextSprintGen] Conflict found, deleting sprint:', conflictSprint.id)
      const { data: conflictTasks } = await supabase.from('task').select('id').eq('sprint_id', conflictSprint.id)
      const taskIds = conflictTasks?.map(t => t.id) || []
      if (taskIds.length > 0) {
        await supabase.from('task_reflection').delete().in('task_id', taskIds)
        await supabase.from('task').delete().in('id', taskIds)
      }
      await supabase.from('sprint').delete().eq('id', conflictSprint.id)
    }

    // Insert next sprint
    const { data: newSprint, error: newSprintError } = await supabase
      .from('sprint')
      .insert({
        phase_id: targetPhase!.id,
        roadmap_id,
        sprint_number: targetSprintNumber,
        title: generatedSprint.title,
        status: 'active',
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (newSprintError) {
      console.error('Error creating new sprint:', newSprintError)
      throw newSprintError
    }

    // Insert 5 tasks
    const tasksToInsert = generatedSprint.tasks.map((t, i) => ({
      sprint_id: newSprint.id,
      roadmap_id,
      user_id: user.id,
      task_number: i + 1,
      title: t.title,
      description: t.description,
      why_this_matters: t.why_this_matters,
      resource_url: t.resource_url || null,
    }))
    const { error: tasksError } = await supabase.from('task').insert(tasksToInsert)
    if (tasksError) {
      console.error('Error creating tasks:', tasksError)
      throw tasksError
    }

    // Update roadmap counters
    await supabase.from('roadmap').update({
      current_phase: targetPhaseNumber,
      current_sprint: targetSprintNumber,
    }).eq('id', roadmap_id)

    console.log('Successfully generated sprint:', newSprint.id)
    return NextResponse.json({ success: true, sprint_id: newSprint.id })
  } catch (error: any) {
    console.error('Sprint generation error:', error)
    return NextResponse.json({ error: error.message || 'Sprint generation failed' }, { status: 500 })
  }
}
