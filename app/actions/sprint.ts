'use server'

import { createClient } from '@/lib/supabase/server'
import { RoadmapWithPhases, SprintWithTasks } from '@/types/roadmap'
import { revalidatePath } from 'next/cache'

export async function getRoadmapOverview(roadmapId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('roadmap')
    .select(`
      *,
      idea:ideas (
        id,
        title,
        description,
        score,
        score_breakdown
      ),
      phase (
        *,
        sprint (
          *,
          task (*)
        )
      )
    `)
    .eq('id', roadmapId)
    .single()

  if (error || !data) {
    console.error('Error fetching roadmap overview:', error?.message || error)
    return null
  }

  return data
}

export async function getActiveSprintForRoadmap(roadmapId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sprint')
    .select(`
      *,
      task (*)
    `)
    .eq('roadmap_id', roadmapId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) {
    console.error('Error fetching active sprint:', error.message, error)
    return null
  }

  return data
}
export async function completeTaskWithReflection(taskId: string, reflection: string, roadmapId: string, sprintId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    // 1. Update task status
    const { error: taskError } = await supabase
      .from('task')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (taskError) throw taskError

    // 2. Insert reflection
    const { error: reflectionError } = await supabase
      .from('task_reflection')
      .insert({
        task_id: taskId,
        user_id: user.id,
        content: reflection
      })

    if (reflectionError) throw reflectionError

    // 3. Check if sprint is complete
    const { data: remainingTasks } = await supabase
      .from('task')
      .select('id')
      .eq('sprint_id', sprintId)
      .eq('status', 'pending')

    const isSprintComplete = !remainingTasks || remainingTasks.length === 0

    revalidatePath(`/roadmap/${roadmapId}`, 'layout')
    return { success: true, sprint_complete: isSprintComplete }
  } catch (error: any) {
    console.error('Error completing task:', error)
    return { success: false, error: error.message || 'Failed to complete task' }
  }
}

export async function updateTaskReflection(taskId: string, reflection: string, roadmapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    // 1. Find the specific reflection record first
    const { data: reflections, error: findError } = await supabase
      .from('task_reflection')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .limit(1)

    if (findError) throw findError

    if (!reflections || reflections.length === 0) {
      return { success: false, error: 'No reflection found to update' }
    }

    const reflectionId = reflections[0].id

    // 2. Update specifically by ID - this is the most reliable way to fulfill RLS checks
    const { error: updateError } = await supabase
      .from('task_reflection')
      .update({
        content: reflection
      })
      .eq('id', reflectionId)

    if (updateError) {
      console.error('[UpdateReflection] Update Error:', updateError)
      throw updateError
    }

    revalidatePath(`/roadmap/${roadmapId}`, 'layout')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating reflection:', error)
    return { success: false, error: error.message || 'Failed to update reflection' }
  }
}
