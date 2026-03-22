export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SprintTaskList } from '@/components/features/roadmap/SprintTaskList'

export default async function SprintPage({ params }: { params: Promise<{ roadmapId: string; sprintId: string }> }) {
  const { roadmapId, sprintId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: sprint }, { data: roadmap }] = await Promise.all([
    supabase
      .from('sprint')
      .select('*, phase(*, sprint(id, sprint_number, status, title)), task(*, task_reflection(*))')
      .eq('id', sprintId)
      .single(),
    supabase
      .from('roadmap')
      .select('current_phase, current_sprint')
      .eq('id', roadmapId)
      .single()
  ])

  if (!sprint || !roadmap) notFound()

  const isLatestSprint = 
    sprint.phase.phase_number === roadmap.current_phase && 
    sprint.sprint_number === roadmap.current_sprint

  const sortedTasks = sprint.task?.sort((a, b) => a.task_number - b.task_number)
  const sprintsInPhase = [...(sprint.phase.sprint || [])].sort((a, b) => a.sprint_number - b.sprint_number)
  const hasMultipleSprints = sprintsInPhase.length > 1
  const currentSprintIndex = sprintsInPhase.findIndex((s) => s.id === sprintId)
  const prevSprint = currentSprintIndex > 0 ? sprintsInPhase[currentSprintIndex - 1] : null
  const nextSprint = currentSprintIndex < sprintsInPhase.length - 1 && sprintsInPhase[currentSprintIndex + 1]?.status !== 'locked'
    ? sprintsInPhase[currentSprintIndex + 1]
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link 
        href={`/roadmap/${roadmapId}`}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Roadmap
      </Link>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Phase {sprint.phase.phase_number}
          {hasMultipleSprints && ` · Sprint ${sprint.sprint_number} of ${sprintsInPhase.length}`}
        </p>
        <h1 className="text-xl font-bold mt-1">
          {hasMultipleSprints ? sprint.title : sprint.title.replace(/^Sprint \d+: /, '')}
        </h1>
        {hasMultipleSprints && (
          <div className="flex items-center gap-3 mt-3">
            {prevSprint ? (
              <Link
                href={`/roadmap/${roadmapId}/sprint/${prevSprint.id}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Sprint {prevSprint.sprint_number}
              </Link>
            ) : <span />}
            {nextSprint && (
              <Link
                href={`/roadmap/${roadmapId}/sprint/${nextSprint.id}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
              >
                Sprint {nextSprint.sprint_number}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
      <SprintTaskList
        tasks={sortedTasks}
        sprintId={sprintId}
        roadmapId={roadmapId}
        isLatestSprint={isLatestSprint}
        isLastSprintInPhase={currentSprintIndex === sprintsInPhase.length - 1}
      />
    </div>
  )
}
