export type RoadmapStatus = 'active' | 'completed' | 'paused'
export type PhaseStatus = 'locked' | 'active' | 'completed'
export type SprintStatus = 'locked' | 'active' | 'completed'
export type TaskStatus = 'pending' | 'completed'

export type Roadmap = {
  id: string
  user_id: string
  idea_id: string
  phase_count: number
  current_phase: number
  current_sprint: number
  status: RoadmapStatus
  generated_at: string | null
  created_at: string
  updated_at: string
}

export type Phase = {
  id: string
  roadmap_id: string
  phase_number: number
  title: string
  description: string
  focus_area: string
  status: PhaseStatus
  unlocked_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type Sprint = {
  id: string
  phase_id: string
  roadmap_id: string
  sprint_number: number
  title: string
  status: SprintStatus
  unlocked_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  sprint_id: string
  roadmap_id: string
  user_id: string
  task_number: number
  title: string
  description: string
  why_this_matters: string
  resource_url: string | null
  status: TaskStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type TaskReflection = {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
}

// Composite types for UI
export type TaskWithReflection = Task & {
  task_reflection: TaskReflection | null
}

export type SprintWithTasks = Sprint & {
  tasks: TaskWithReflection[]
}

export type PhaseWithSprints = Phase & {
  sprints: SprintWithTasks[]
}

export type RoadmapWithPhases = Roadmap & {
  phases: PhaseWithSprints[]
  idea: {
    id: string
    title: string
    description: string
    score: number
    score_breakdown: ScoreBreakdown
  }
}

export type ScoreBreakdown = {
  problem_clarity: number
  market_size: number
  competitive_advantage: number
  technical_feasibility: number
  go_to_market: number
  founder_fit: number
  market_timing: number
}

// LLM generation types
export type GeneratedTask = {
  title: string
  description: string
  why_this_matters: string
  resource_url?: string
}

export type GeneratedSprint = {
  title: string
  tasks: GeneratedTask[]
}
