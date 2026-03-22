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
  } catch (error: any) {
    return { success: false, error: error.message }
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

  return {
    summary: JSON.parse(data.completion_summary),
    generated_at: data.completion_summary_generated_at,
    choice_made: data.post_completion_choice,
    idea_title: (data.idea as any)?.title,
  }
}
