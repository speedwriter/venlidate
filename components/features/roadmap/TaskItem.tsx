'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Lock, Circle, Loader2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskWithReflection } from '@/types/roadmap'

interface TaskItemProps {
  task: TaskWithReflection
  isActive: boolean
  isLocked: boolean
  isCompleting: boolean
  taskNumber: number
  onComplete: (taskId: string, reflection: string) => void
  onUpdateReflection: (taskId: string, reflection: string) => Promise<void>
}

export function TaskItem({ task, isActive, isLocked, isCompleting, taskNumber, onComplete, onUpdateReflection }: TaskItemProps) {
  const [reflection, setReflection] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.task_reflection?.content || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const isCompleted = task.status === 'completed'

  async function handleUpdate() {
    setIsUpdating(true)
    await onUpdateReflection(task.id, editValue)
    setIsUpdating(false)
    setIsEditing(false)
  }

  return (
    <Card className={cn(
      'transition-all',
      isLocked && 'opacity-40',
      isActive && 'border-primary/40 shadow-sm',
      isCompleted && 'bg-muted/20'
    )}>
      <CardHeader className={cn("pb-2", isCompleted && "cursor-pointer")} onClick={isCompleted ? () => setIsExpanded(v => !v) : undefined}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {isActive && <Circle className="h-5 w-5 text-primary" />}
            {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Task {taskNumber}</span>
              {isCompleted && <Badge variant="secondary" className="text-xs">Done</Badge>}
            </div>
            <p className={cn("font-medium mt-0.5", isCompleted && "text-muted-foreground")}>
              {task.title}
            </p>
          </div>
          {isCompleted && (
            <div className="mt-0.5 shrink-0 text-muted-foreground">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
        </div>
      </CardHeader>

      {(isActive || (isCompleted && isExpanded)) && (
        <CardContent className="pt-0 pl-11">
          <p className="text-sm text-muted-foreground">{task.description}</p>
          <p className="text-sm mt-2 text-foreground/70">
            <span className="font-medium">Why this matters: </span>{task.why_this_matters}
          </p>
          {task.resource_url && (
            <a href={task.resource_url} target="_blank" rel="noopener noreferrer"
              className="text-sm text-primary flex items-center gap-1 mt-2 hover:underline">
              <ExternalLink className="h-3 w-3" /> Helpful resource
            </a>
          )}

          {isCompleted && task.task_reflection && (
            <div className="mt-3 bg-muted/40 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-medium">Your reflection</p>
                {!isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      setIsEditing(true)
                      setEditValue(task.task_reflection?.content || '')
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="min-h-[80px] text-sm bg-background"
                    disabled={isUpdating}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleUpdate}
                      disabled={isUpdating || editValue.trim().length < 10}
                    >
                      {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm italic">&quot;{task.task_reflection.content}&quot;</p>
              )}
            </div>
          )}

          {isActive && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">What did you learn or do? <span className="text-destructive">*</span></label>
                <Textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="One honest sentence about what you found out or did..."
                  className="mt-1.5 min-h-[80px] resize-none"
                  disabled={isCompleting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {reflection.trim().length < 10 ? `${10 - reflection.trim().length} more characters needed` : 'Looks good'}
                </p>
              </div>
              <Button
                onClick={() => onComplete(task.id, reflection)}
                disabled={isCompleting || reflection.trim().length < 10}
                size="sm"
              >
                {isCompleting ? (
                  <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Completing...</>
                ) : 'Mark Complete'}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
