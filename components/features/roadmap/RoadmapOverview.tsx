import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PhaseCard } from './PhaseCard'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Phase } from '@/types/roadmap'

type TaskRow = { status: string }
type SprintRow = { id: string; sprint_number: number; status: string; title: string; task?: TaskRow[] }
type PhaseRow = Phase & { sprint?: SprintRow[] }
type RoadmapRow = {
  id: string
  current_phase: number
  current_sprint: number
  phase?: PhaseRow[]
  idea: { title: string }
}
type ActiveSprintRow = {
  id: string
  title: string
  task?: TaskRow[]
}

export function RoadmapOverview({ roadmap, activeSprint, isCompleted }: { roadmap: RoadmapRow; activeSprint: ActiveSprintRow | null; isCompleted?: boolean }) {
  // Only count tasks from unlocked phases so progress never regresses as new sprints generate
  const unlockedPhaseTasks = roadmap.phase
    ?.filter(p => p.status !== 'locked')
    .flatMap(p => p.sprint?.flatMap(s => s.task || []) || []) || []
  const completedTasks = unlockedPhaseTasks.filter(t => t.status === 'completed').length
  const progressPercent = unlockedPhaseTasks.length > 0
    ? Math.round((completedTasks / unlockedPhaseTasks.length) * 100)
    : 0

  const currentPhase = roadmap.phase?.find(p => p.phase_number === roadmap.current_phase)
  const hasMultipleSprintsInCurrentPhase = (currentPhase?.sprint?.length || 0) > 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{roadmap.idea.title}</h1>
        <p className="text-muted-foreground mt-1">
          Phase {roadmap.current_phase} of 5
          {hasMultipleSprintsInCurrentPhase && ` · Sprint ${roadmap.current_sprint}`}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {activeSprint && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {hasMultipleSprintsInCurrentPhase ? 'Active Sprint' : 'Current Focus'}
            </p>
            <p className="font-semibold">
              {hasMultipleSprintsInCurrentPhase ? activeSprint.title : activeSprint.title.replace(/^Sprint \d+: /, '')}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeSprint.task?.filter(t => t.status === 'completed').length || 0}/{activeSprint.task?.length || 5} tasks complete
            </p>
          </div>
          <Button asChild>
            <Link href={`/roadmap/${roadmap.id}/sprint/${activeSprint.id}`}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {isCompleted && (
        <Link
          href={`/roadmap/${roadmap.id}?complete=true`}
          className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/5 p-4 hover:bg-green-500/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">All 5 phases complete</p>
              <p className="text-xs text-muted-foreground mt-0.5">View your journey summary and next steps</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your 5 Phases</h2>
        {roadmap.phase?.sort((a, b) => a.phase_number - b.phase_number).map((phase) => (
          <PhaseCard key={phase.id} phase={phase} roadmapId={roadmap.id} />
        ))}
      </div>
    </div>
  )
}
