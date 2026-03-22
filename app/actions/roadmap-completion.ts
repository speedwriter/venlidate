// File: app/actions/roadmap-completion.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordPostCompletionChoice(
  roadmapId: string,
  choice: 'course' | 'pivot' | 'continue'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    await supabase.from('roadmap')
      .update({ post_completion_choice: choice })
      .eq('id', roadmapId)
      .eq('user_id', user.id)

    revalidatePath(`/roadmap/${roadmapId}`)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function getCompletionSummary(roadmapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('roadmap')
    .select('completion_summary, completion_summary_generated_at, post_completion_choice, idea:ideas(title)')
    .eq('id', roadmapId)
    .eq('user_id', user.id)
    .single()

  if (!data?.completion_summary) return null

  let summary
  try {
    summary = JSON.parse(data.completion_summary)
  } catch {
    console.error('[getCompletionSummary] Failed to parse completion_summary for roadmap:', roadmapId)
    return null
  }

  const idea = data.idea as { title?: string } | null
  return {
    summary,
    generated_at: data.completion_summary_generated_at,
    choice_made: data.post_completion_choice,
    idea_title: idea?.title,
  }
}
