import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Lock, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Phase } from '@/types/roadmap'

type SprintInPhase = {
  id: string
  sprint_number: number
  status: string
  title: string | null
  task?: { status: string }[]
}

export function PhaseCard({ phase, roadmapId }: { phase: Phase & { sprint?: SprintInPhase[] }; roadmapId: string }) {
  const isLocked = phase.status === 'locked'
  const isCompleted = phase.status === 'completed'
  const isActive = phase.status === 'active'

  const sortedSprints = [...(phase.sprint || [])].sort((a, b) => a.sprint_number - b.sprint_number)
  const totalTasks = sortedSprints.flatMap(s => s.task || []).length
  const completedTasks = sortedSprints.flatMap(s => s.task || []).filter(t => t.status === 'completed').length
  const hasMultipleSprints = sortedSprints.length > 1

  const header = (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
        {isActive && <Circle className="h-4 w-4 text-primary fill-primary/20" />}
        {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Phase {phase.phase_number}</span>
          {isCompleted && <Badge variant="secondary" className="text-xs">Complete</Badge>}
          {isActive && <Badge className="text-xs">Active</Badge>}
        </div>
        <p className="font-medium">{phase.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{phase.focus_area}</p>
        {(isActive || isCompleted) && totalTasks > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{completedTasks}/{totalTasks} tasks complete</p>
        )}
      </div>
    </div>
  )

  // Multiple sprints: render the card as non-clickable with individual sprint links
  if (!isLocked && hasMultipleSprints) {
    return (
      <div className={cn(
        'rounded-lg border p-4',
        isActive && 'border-primary/40 bg-primary/5',
        isCompleted && 'bg-muted/20',
      )}>
        {header}
        <div className="mt-3 pt-3 border-t space-y-1 pl-7">
          {sortedSprints.map((sprint) => {
            const sprintTasks = sprint.task || []
            const sprintCompleted = sprintTasks.filter(t => t.status === 'completed').length
            const isSprintLocked = sprint.status === 'locked'
            const label = sprint.title?.replace(/^Sprint \d+:\s*/, '') || `Sprint ${sprint.sprint_number}`

            if (isSprintLocked) {
              return (
                <div key={sprint.id} className="flex items-center justify-between text-sm text-muted-foreground opacity-50 px-2 py-1">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    {label}
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={sprint.id}
                href={`/roadmap/${roadmapId}/sprint/${sprint.id}`}
                className="flex items-center justify-between text-sm px-2 py-1.5 rounded-md hover:bg-primary/10 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  {sprint.status === 'completed'
                    ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                    : <Circle className="h-3 w-3 text-primary" />}
                  {label}
                </span>
                {sprintTasks.length > 0 && (
                  <span className="text-xs text-muted-foreground">{sprintCompleted}/{sprintTasks.length}</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Single sprint: link the whole card
  const firstSprintId = sortedSprints[0]?.id
  const content = (
    <div className={cn(
      'rounded-lg border p-4 transition-all',
      isLocked && 'opacity-50 bg-muted/30',
      isActive && 'border-primary/40 bg-primary/5',
      isCompleted && 'bg-muted/20',
      !isLocked && 'hover:border-primary/40 hover:shadow-sm cursor-pointer'
    )}>
      {header}
    </div>
  )

  if (isLocked || !firstSprintId) return content

  return (
    <Link href={`/roadmap/${roadmapId}/sprint/${firstSprintId}`}>
      {content}
    </Link>
  )
}
