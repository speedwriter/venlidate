// File: app/api/roadmap/complete/route.ts
// Called when Phase 5 final sprint completes
// Generates completion summary and sets roadmap status

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { buildCompletionSummaryPrompt, CompletionSummarySchema } from '@/lib/prompts/completion-summary'

type TaskForCompletion = {
  title: string
  task_number: number
  sprint: { sprint_number: number; phase: { phase_number: number } | null } | null
  task_reflection: { content: string } | null
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { roadmap_id } = await req.json()

    // Fetch roadmap + idea
    const { data: roadmap } = await supabase
      .from('roadmap')
      .select('*, idea:ideas(*)')
      .eq('id', roadmap_id)
      .eq('user_id', user.id)
      .single()
    if (!roadmap) return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })

    // Fetch all reflections across all phases in order
    const { data: tasks } = await supabase
      .from('task')
      .select('title, task_number, sprint(sprint_number, phase(phase_number)), task_reflection(content)')
      .eq('roadmap_id', roadmap_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    const allReflections = ((tasks || []) as TaskForCompletion[])
      .filter(t => t.task_reflection)
      .map(t => ({
        phase: t.sprint?.phase?.phase_number || 0,
        sprint: t.sprint?.sprint_number || 0,
        task_title: t.title,
        reflection: t.task_reflection?.content || '',
      }))

    // Generate completion summary
    const prompt = buildCompletionSummaryPrompt(
      roadmap.idea.title,
      roadmap.idea.description,
      allReflections
    )

    const { object: summary } = await generateObject({
      model: google('gemini-2.5-flash-lite'),
      schema: CompletionSummarySchema,
      prompt,
    })

    // Store summary and mark roadmap complete
    const summaryText = JSON.stringify(summary)
    await supabase.from('roadmap').update({
      status: 'completed',
      completion_summary: summaryText,
      completion_summary_generated_at: new Date().toISOString(),
    }).eq('id', roadmap_id)

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('Completion summary error:', error)
    return NextResponse.json({ error: 'Failed to generate completion summary. Please try again.' }, { status: 500 })
  }
}
