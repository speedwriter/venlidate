'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TaskItem } from './TaskItem'
import { completeTaskWithReflection, updateTaskReflection } from '@/app/actions/sprint'
import { TaskWithReflection } from '@/types/roadmap'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SprintTaskListProps {
  tasks: TaskWithReflection[]
  sprintId: string
  roadmapId: string
  isLatestSprint?: boolean
  isLastSprintInPhase?: boolean
}

export function SprintTaskList({ tasks, sprintId, roadmapId, isLatestSprint = true, isLastSprintInPhase = true }: SprintTaskListProps) {
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const router = useRouter()

  const firstPendingTask = tasks.find(t => t.status === 'pending')

  async function handleComplete(taskId: string, reflection: string) {
    setCompletingId(taskId)
    setError(null)
    const result = await completeTaskWithReflection(taskId, reflection, roadmapId, sprintId)
    
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to complete task')
    }
    setCompletingId(null)
  }

  async function handleUpdateReflection(taskId: string, reflection: string) {
    setError(null)
    const result = await updateTaskReflection(taskId, reflection, roadmapId)
    if (!result.success) {
      setError(result.error || 'Failed to update reflection')
      return
    }
    router.refresh()
  }

  async function handleGenerateNext() {
    if (!isLatestSprint) {
      setShowWarning(true)
      return
    }
    await runGenerate()
  }

  async function runGenerate() {
    setIsGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/roadmap/sprint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_sprint_id: sprintId, roadmap_id: roadmapId }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate next sprint')
      }

      if (data.roadmap_complete) {
        router.push(`/roadmap/${roadmapId}?complete=true`)
        return
      }
      if (data.sprint_id) {
        router.push(`/roadmap/${roadmapId}/sprint/${data.sprint_id}`)
        return
      }
    } catch (e) {
      console.error('Sprint generation failed', e)
      setError('Failed to generate next sprint. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const allTasksComplete = tasks.every(t => t.status === 'completed')

  const nextStepLabel = isLastSprintInPhase ? 'next phase' : 'next sprint'

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          isActive={task.id === firstPendingTask?.id}
          isLocked={task.status === 'pending' && task.id !== firstPendingTask?.id}
          isCompleting={completingId === task.id}
          taskNumber={index + 1}
          onComplete={handleComplete}
          onUpdateReflection={handleUpdateReflection}
        />
      ))}

      {allTasksComplete && (
        <div className="pt-6 border-t mt-8">
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Sprint Completed!</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                All tasks are done. Discuss your progress with your AI coach to unlock the {nextStepLabel}.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleGenerateNext}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing your progress...
                </>
              ) : (
                <>Discuss with my AI coach</>
              )}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite future progress?</AlertDialogTitle>
            <AlertDialogDescription>
              Discussing with your AI coach from an earlier sprint will regenerate all subsequent sprints. Any progress made after this point will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runGenerate}>Continue anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
