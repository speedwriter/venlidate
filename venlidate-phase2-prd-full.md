# Venlidate Phase 2: Idea-to-MVP Execution Engine
## PRD + Project Context Primer + Atomic Implementation Prompts

---

## PHASE 2: CLEAN PRD

### 1. App Goal

Extend Venlidate's post-validation user journey by generating a personalised, LLM-powered 5-phase execution roadmap that takes a validated idea from score to paying customers. Users progress through gated 5-task sprints — completing tasks unlocks the next sprint — with each sprint derived from their specific validation score gaps, keeping them accountable and retained on the platform.

---

### 2. User Roles

| Role | Permissions |
|------|-------------|
| `authenticated_user` | Create roadmaps from own validated ideas, view/complete own tasks, submit task reflections, progress through sprints |
| `admin` | View all roadmaps, prompt management, analytics (future) |

Single-tenant per user. All data scoped to `auth.uid()`.

---

### 3. Core Entities (Data Model)

```
Entities:
- idea: id, user_id, title, description, score (int), score_breakdown (jsonb), status, created_at, updated_at
  [EXISTING — extend with roadmap_generated boolean]

- roadmap: id, user_id, idea_id, phase_count (default 5), current_phase (int), current_sprint (int), status (active/completed/paused), generated_at, created_at, updated_at

- phase: id, roadmap_id, phase_number (1-5), title, description, focus_area, status (locked/active/completed), unlocked_at, completed_at, created_at

- sprint: id, phase_id, roadmap_id, sprint_number (int), title, status (locked/active/completed), unlocked_at, completed_at, created_at

- task: id, sprint_id, roadmap_id, user_id, task_number (1-5), title, description, why_this_matters, resource_url (nullable), status (pending/completed), completed_at, created_at, updated_at

- task_reflection: id, task_id, user_id, content (text), created_at

Relationships:
- roadmap.user_id → auth.users (one-to-many)
- roadmap.idea_id → idea.id (one-to-one)
- phase.roadmap_id → roadmap.id (one-to-many)
- sprint.phase_id → phase.id (one-to-many)
- sprint.roadmap_id → roadmap.id (one-to-many)
- task.sprint_id → sprint.id (one-to-many)
- task.user_id → auth.users (one-to-many)
- task_reflection.task_id → task.id (one-to-one)
```

---

### 4. The 5 Phases (Fixed Framework)

| Phase | Title | Focus |
|-------|-------|-------|
| 1 | Problem Validation | Confirm the problem is real and painful |
| 2 | Customer Discovery | Find and talk to 10 potential customers |
| 3 | Prototype & Signal | Build a no/low-code prototype, get feedback |
| 4 | First Revenue | Charge someone before building the full product |
| 5 | MVP Launch | Ship, iterate, acquire first 10 paying customers |

Each phase contains N sprints. Each sprint contains exactly 5 tasks. Sprint content is LLM-generated, personalised to the user's idea + score breakdown + prior task reflections.

---

### 5. Essential Features (MVP Scope)

1. **Roadmap Generation** — Post-validation CTA triggers LLM roadmap creation from idea + score breakdown. **Only available for ideas scoring 70+.**
2. **Phase Overview** — Visual 5-phase progress bar; locked phases shown greyed out
3. **Sprint View** — Active sprint shows 5 tasks in sequence; completed tasks checked off
4. **Task Completion with Reflection** — Mark task done + one-line "what did you learn?" input
5. **Sprint Unlock Gate** — Completing all 5 tasks in a sprint unlocks next sprint (LLM-generated on unlock)
6. **Phase Unlock Gate** — Completing all sprints in a phase unlocks next phase
7. **Roadmap Dashboard** — Summary view: current phase, sprint, tasks remaining, % complete
8. **Re-generation on Stall** — If no activity for 14 days, prompt user to revalidate or pivot
9. **Score Gap Personalisation** — LLM prompt ingests score_breakdown to weight sprint content toward weakest dimensions
10. **Reflection Feed** — Lightweight log of user's own reflections per idea, visible to user only

**Out of scope for this phase:**
- Cohorts / peer accountability
- Email/push notifications
- Admin analytics dashboard
- Pivot Engine (stall detection automation)

---

### 6. Authentication Strategy

**Option B: Supabase Auth (existing)**
Venlidate already uses Supabase Auth. Phase 2 inherits the same session/middleware pattern. No changes to auth layer required.

---

### 7. Technology Stack

```
- Framework: Next.js 15 (App Router) — EXISTING
- Language: TypeScript — EXISTING
- Database: Supabase (PostgreSQL) — EXISTING
- Auth: Supabase Auth — EXISTING
- Styling: Tailwind CSS + shadcn/ui — EXISTING
- AI: Vercel AI SDK + Gemini 2.0 Flash — for roadmap + sprint generation
- New env vars: GOOGLE_GENERATIVE_AI_API_KEY (if not already set)
```

---

### 8. File Structure (New Files Only)

```
/app
  /(dashboard)
    /roadmap
      /[roadmapId]
        /page.tsx                        # Roadmap overview / phase progress
        /phase
          /[phaseId]
            /page.tsx                    # Phase detail + sprint list
        /sprint
          /[sprintId]
            /page.tsx                    # Sprint task view
  /api
    /roadmap
      /generate/route.ts                 # POST: LLM roadmap generation
      /sprint/generate/route.ts          # POST: LLM next sprint generation

/app/actions
  /roadmap.ts                            # generateRoadmap, getRoadmap, updateRoadmapStatus
  /sprint.ts                             # unlockNextSprint, completeTask, submitReflection

/components
  /features
    /roadmap
      /RoadmapOverview.tsx               # Phase progress bar + status cards
      /PhaseCard.tsx                     # Individual phase card (locked/active/done)
      /SprintTaskList.tsx                # 5-task sprint view
      /TaskItem.tsx                      # Single task + reflection input
      /GenerateRoadmapCTA.tsx            # Post-validation prompt to generate roadmap
      /ReflectionFeed.tsx                # User's reflection log

/lib
  /prompts
    /roadmap-generator.ts                # Master prompt builder (idea + score → roadmap)
    /sprint-generator.ts                 # Sprint prompt builder (phase + reflections → next 5 tasks)

/types
  /roadmap.ts                            # Roadmap, Phase, Sprint, Task, TaskReflection types
```

---

---

## PHASE 2.5: .CURSORRULES FILE

```markdown
# Venlidate Phase 2 — Cursor Rules

## Project Overview
Venlidate is a startup idea validation SaaS built on Next.js 15 + Supabase. Phase 2 adds a post-validation execution engine: an LLM-powered personalised roadmap that takes users from validated idea to first paying customer through gated 5-task sprints across 5 phases.

## Tech Stack
- Framework: Next.js 15 App Router
- Language: TypeScript (strict mode)
- Database: Supabase (PostgreSQL) with RLS
- Auth: Supabase Auth (existing middleware)
- Styling: Tailwind CSS + shadcn/ui
- AI: Vercel AI SDK + Gemini 2.0 Flash (`gemini-2.0-flash-exp`)

## New File Structure (Phase 2 additions)
```
/app/(dashboard)/roadmap/[roadmapId]/page.tsx
/app/(dashboard)/roadmap/[roadmapId]/phase/[phaseId]/page.tsx
/app/(dashboard)/roadmap/[roadmapId]/sprint/[sprintId]/page.tsx
/app/api/roadmap/generate/route.ts
/app/api/roadmap/sprint/generate/route.ts
/app/actions/roadmap.ts
/app/actions/sprint.ts
/components/features/roadmap/*.tsx
/lib/prompts/roadmap-generator.ts
/lib/prompts/sprint-generator.ts
/types/roadmap.ts
```

## Core Data Flow
1. User completes idea validation → score + score_breakdown stored on `idea` table
2. User clicks "Build My Roadmap" → POST /api/roadmap/generate → Gemini generates Phase 1 Sprint 1 (5 tasks)
3. Tasks stored in `task` table linked to sprint → sprint linked to phase → phase linked to roadmap
4. User completes all 5 tasks (each with a reflection) → sprint status = completed
5. Sprint completion triggers → POST /api/roadmap/sprint/generate → Gemini generates next sprint
6. Phase completion (all sprints done) → next phase unlocked

## Gating Logic
- Tasks are sequential within a sprint (task_number 1→5)
- Sprint unlock: all 5 tasks in current sprint status = completed
- Phase unlock: all sprints in current phase status = completed
- Next sprint is generated ON UNLOCK (not pre-generated) — ingests prior reflections

## LLM Prompt Strategy
- `roadmap-generator.ts`: Takes idea.title, idea.description, idea.score_breakdown (jsonb) → outputs Phase 1 Sprint 1 tasks as JSON array
- `sprint-generator.ts`: Takes phase context, prior task reflections, score gaps → outputs next 5 tasks as JSON array
- All LLM responses must return ONLY valid JSON. No markdown fences, no preamble.
- Response schema: `{ tasks: [{ title, description, why_this_matters, resource_url? }] }`

## Code Patterns
- Server Components for all read/display pages
- Server Actions in /app/actions for all mutations
- API routes (/app/api) ONLY for streaming LLM generation
- Always validate auth.uid() in every server action
- Return { success: boolean, data?: any, error?: string } from all actions
- revalidatePath() after every mutation

## Anti-Patterns
- ❌ Never pre-generate all sprints at once — generate on unlock only
- ❌ Never store LLM raw output — parse to typed JSON before insert
- ❌ Never skip RLS on roadmap/phase/sprint/task tables
- ❌ Never allow task completion without a reflection (min 10 chars)
- ❌ Never use client-side Supabase for mutations
```

---

---

## PHASE 3: PROJECT CONTEXT PRIMER

```markdown
## Venlidate Phase 2 — Project Context Primer

Venlidate Phase 2 extends an existing Next.js 15 + Supabase validation SaaS with a post-validation execution engine. The core mechanic: a user's validated idea + Gemini-generated 7-dimension score breakdown feeds a personalised 5-phase roadmap, broken into gated 5-task sprints. Completing all 5 tasks (each requiring a reflection) unlocks the next sprint, which is generated on-demand by Gemini using accumulated context.

**Architecture:**
Next.js 15 App Router. Server Components as default. Server Actions for all mutations. Two API routes for streaming LLM generation (roadmap init, sprint unlock). Supabase PostgreSQL for persistence. RLS on all new tables scoped to auth.uid(). Existing auth middleware unchanged.

**Database Design:**
Six tables: idea (extended), roadmap, phase, sprint, task, task_reflection. Roadmap is the root entity. Phases are fixed (5, pre-seeded on roadmap creation). Sprints and tasks are dynamically generated by LLM. Sprint generation is lazy — triggered only when prior sprint completes, ingesting reflections as context for next generation.

**LLM Integration:**
Two prompt builders in /lib/prompts. roadmap-generator.ts builds the initial prompt from idea title, description, and score_breakdown jsonb. sprint-generator.ts builds subsequent prompts from phase context + array of prior reflections + score gap weighting. Both return strict JSON only. Gemini 2.0 Flash via Vercel AI SDK generateObject() with Zod schema for type-safe parsing.

**Key Technical Decisions:**
- generateObject() over generateText() — enforces typed JSON response, eliminates parsing errors
- Lazy sprint generation — reduces LLM costs, keeps context window focused, allows reflection-informed personalisation
- Phase pre-seeding — 5 phases inserted as locked rows at roadmap creation, avoiding LLM hallucination on phase structure
- Optimistic UI on task completion — instant checkbox feedback before server confirmation

**Environment Variables Required:**
```
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=        (existing)
NEXT_PUBLIC_SUPABASE_ANON_KEY=   (existing)
SUPABASE_SERVICE_ROLE_KEY=       (existing)
```
```

---

---

## PHASE 4: ATOMIC IMPLEMENTATION PROMPTS

---

### Prompt 1 — Database Schema: Core Roadmap Tables

**Feature: Roadmap Data Model**

**Description:**
Create all new Supabase tables for the Phase 2 execution engine. This is the foundation — all subsequent prompts depend on this schema being correct. Run in Supabase SQL Editor.

**Acceptance Criteria:**
- [ ] Tables created: roadmap, phase, sprint, task, task_reflection
- [ ] idea table extended with roadmap_generated boolean
- [ ] RLS enabled and policies created on all new tables
- [ ] Indexes created on user_id and foreign key columns
- [ ] Updated_at trigger function applied to all tables

**Files to Create/Modify:**
- `supabase/migrations/phase2_roadmap_schema.sql` — full schema

**Database Setup:**
```sql
-- ============================================================
-- VENLIDATE PHASE 2: ROADMAP SCHEMA
-- Run in Supabase SQL Editor
-- ============================================================

-- Extend existing idea table
ALTER TABLE idea 
ADD COLUMN IF NOT EXISTS roadmap_generated boolean DEFAULT false;

-- ============================================================
-- ROADMAP TABLE
-- ============================================================
CREATE TABLE roadmap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  idea_id uuid REFERENCES idea(id) ON DELETE CASCADE NOT NULL,
  phase_count int DEFAULT 5 NOT NULL,
  current_phase int DEFAULT 1 NOT NULL,
  current_sprint int DEFAULT 1 NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')) NOT NULL,
  generated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE roadmap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roadmaps" ON roadmap FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON roadmap FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON roadmap FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_roadmap_user ON roadmap(user_id);
CREATE INDEX idx_roadmap_idea ON roadmap(idea_id);

-- ============================================================
-- PHASE TABLE
-- ============================================================
CREATE TABLE phase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid REFERENCES roadmap(id) ON DELETE CASCADE NOT NULL,
  phase_number int NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  title text NOT NULL,
  description text NOT NULL,
  focus_area text NOT NULL,
  status text DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')) NOT NULL,
  unlocked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(roadmap_id, phase_number)
);

ALTER TABLE phase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own phases" ON phase FOR SELECT USING (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = phase.roadmap_id AND r.user_id = auth.uid())
);
CREATE POLICY "Users can update own phases" ON phase FOR UPDATE USING (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = phase.roadmap_id AND r.user_id = auth.uid())
);
CREATE POLICY "Users can insert own phases" ON phase FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = phase.roadmap_id AND r.user_id = auth.uid())
);
CREATE INDEX idx_phase_roadmap ON phase(roadmap_id);

-- ============================================================
-- SPRINT TABLE
-- ============================================================
CREATE TABLE sprint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid REFERENCES phase(id) ON DELETE CASCADE NOT NULL,
  roadmap_id uuid REFERENCES roadmap(id) ON DELETE CASCADE NOT NULL,
  sprint_number int NOT NULL,
  title text NOT NULL,
  status text DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')) NOT NULL,
  unlocked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phase_id, sprint_number)
);

ALTER TABLE sprint ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sprints" ON sprint FOR SELECT USING (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = sprint.roadmap_id AND r.user_id = auth.uid())
);
CREATE POLICY "Users can update own sprints" ON sprint FOR UPDATE USING (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = sprint.roadmap_id AND r.user_id = auth.uid())
);
CREATE POLICY "Users can insert own sprints" ON sprint FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = sprint.roadmap_id AND r.user_id = auth.uid())
);
CREATE INDEX idx_sprint_phase ON sprint(phase_id);
CREATE INDEX idx_sprint_roadmap ON sprint(roadmap_id);

-- ============================================================
-- TASK TABLE
-- ============================================================
CREATE TABLE task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid REFERENCES sprint(id) ON DELETE CASCADE NOT NULL,
  roadmap_id uuid REFERENCES roadmap(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  task_number int NOT NULL CHECK (task_number BETWEEN 1 AND 5),
  title text NOT NULL,
  description text NOT NULL,
  why_this_matters text NOT NULL,
  resource_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')) NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sprint_id, task_number)
);

ALTER TABLE task ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON task FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON task FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON task FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_task_sprint ON task(sprint_id);
CREATE INDEX idx_task_user ON task(user_id);
CREATE INDEX idx_task_roadmap ON task(roadmap_id);

-- ============================================================
-- TASK REFLECTION TABLE
-- ============================================================
CREATE TABLE task_reflection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES task(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL CHECK (char_length(content) >= 10),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE task_reflection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reflections" ON task_reflection FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON task_reflection FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_reflection_task ON task_reflection(task_id);
CREATE INDEX idx_reflection_user ON task_reflection(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER (apply to all new tables)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_roadmap_updated_at BEFORE UPDATE ON roadmap FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_phase_updated_at BEFORE UPDATE ON phase FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sprint_updated_at BEFORE UPDATE ON sprint FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON task FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### Prompt 2 — TypeScript Types

**Feature: Roadmap Type Definitions**

**Description:**
Generate TypeScript types for all Phase 2 entities. These types are imported across all components, actions, and API routes. Run `supabase gen types typescript` after schema migration and merge with this file.

**Files to Create/Modify:**
- `types/roadmap.ts` — all roadmap domain types

**Implementation:**
```typescript
// File: types/roadmap.ts

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
```

---

### Prompt 3 — LLM Prompt Builders

**Feature: Roadmap & Sprint Prompt Engines**

**Description:**
Build the two prompt constructor functions. These are the core intelligence of Phase 2 — they translate structured user data into personalised LLM instructions. The output quality of every roadmap depends entirely on these prompts.

**Files to Create/Modify:**
- `lib/prompts/roadmap-generator.ts` — initial roadmap prompt
- `lib/prompts/sprint-generator.ts` — subsequent sprint generation prompt

**Implementation:**

```typescript
// File: lib/prompts/roadmap-generator.ts
import { ScoreBreakdown, GeneratedSprint } from '@/types/roadmap'
import { z } from 'zod'

export const PHASE_DEFINITIONS = [
  { number: 1, title: 'Problem Validation', focus_area: 'Confirm the problem is real and acutely painful for a specific person', description: 'Get out of the building. Talk to real people. Validate that the pain you think exists is the pain that actually exists.' },
  { number: 2, title: 'Customer Discovery', focus_area: 'Find and deeply interview 10 target customers', description: 'Map who your customer really is. Understand their workflow, frustrations, and what a solution is worth to them.' },
  { number: 3, title: 'Prototype & Signal', focus_area: 'Build the simplest possible representation of your solution and get feedback', description: 'No-code, mockups, landing page, or manual concierge. The goal is signal, not software.' },
  { number: 4, title: 'First Revenue', focus_area: 'Get someone to pay before you build the full product', description: 'Pre-sell, charge for the concierge version, or take a deposit. Money is the only real validation.' },
  { number: 5, title: 'MVP Launch', focus_area: 'Ship a functional MVP and acquire your first 10 paying customers', description: 'Build only what is needed to deliver the core value. Acquire, onboard, and retain paying users.' },
]

export function getWeakestDimensions(breakdown: ScoreBreakdown): string[] {
  const sorted = Object.entries(breakdown)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([key]) => key.replace(/_/g, ' '))
  return sorted
}

export function buildRoadmapGenerationPrompt(
  ideaTitle: string,
  ideaDescription: string,
  scoreBreakdown: ScoreBreakdown
): string {
  const weakDimensions = getWeakestDimensions(scoreBreakdown)
  const phase = PHASE_DEFINITIONS[0]

  return `You are an expert startup coach helping a founder execute on their validated idea.

IDEA: "${ideaTitle}"
DESCRIPTION: "${ideaDescription}"

VALIDATION SCORE BREAKDOWN:
${Object.entries(scoreBreakdown).map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v}/10`).join('\n')}

WEAKEST DIMENSIONS (prioritise addressing these): ${weakDimensions.join(', ')}

CURRENT PHASE: Phase 1 — ${phase.title}
PHASE FOCUS: ${phase.focus_area}
PHASE CONTEXT: ${phase.description}

Generate Sprint 1 of Phase 1 for this specific founder and idea. Create exactly 5 tasks.

Tasks must be:
- Specific and actionable (not generic startup advice)
- Tied directly to THIS idea and THIS founder's weak score dimensions  
- Completable in 1-3 days each
- Progressive (each task builds on the previous)
- Grounded in the Phase 1 objective: confirming the problem is real

Return ONLY a valid JSON object with this exact structure — no markdown, no preamble:
{
  "title": "Sprint 1: [descriptive sprint title]",
  "tasks": [
    {
      "title": "Task title (max 10 words)",
      "description": "What to do and how to do it (2-4 sentences, specific to this idea)",
      "why_this_matters": "Why this specific task matters for this idea (1-2 sentences)",
      "resource_url": "optional relevant URL or null"
    }
  ]
}`
}

export const GeneratedSprintSchema = z.object({
  title: z.string(),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string(),
    why_this_matters: z.string(),
    resource_url: z.string().nullable().optional(),
  })).length(5),
})
```

```typescript
// File: lib/prompts/sprint-generator.ts
import { ScoreBreakdown, GeneratedSprint } from '@/types/roadmap'
import { PHASE_DEFINITIONS, getWeakestDimensions, GeneratedSprintSchema } from './roadmap-generator'
import { z } from 'zod'

export function buildNextSprintPrompt(
  ideaTitle: string,
  ideaDescription: string,
  scoreBreakdown: ScoreBreakdown,
  phaseNumber: number,
  sprintNumber: number,
  priorReflections: { task_title: string; reflection: string }[]
): string {
  const phase = PHASE_DEFINITIONS[phaseNumber - 1]
  const weakDimensions = getWeakestDimensions(scoreBreakdown)
  const reflectionContext = priorReflections.length > 0
    ? `\nFOUNDER'S PRIOR REFLECTIONS (use these to personalise the next sprint):\n${priorReflections.map(r => `- After "${r.task_title}": "${r.reflection}"`).join('\n')}`
    : '\nNo prior reflections yet.'

  return `You are an expert startup coach helping a founder execute on their validated idea.

IDEA: "${ideaTitle}"
DESCRIPTION: "${ideaDescription}"

VALIDATION SCORE BREAKDOWN:
${Object.entries(scoreBreakdown).map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v}/10`).join('\n')}

WEAKEST DIMENSIONS: ${weakDimensions.join(', ')}

CURRENT PHASE: Phase ${phaseNumber} — ${phase.title}
PHASE FOCUS: ${phase.focus_area}
GENERATING: Sprint ${sprintNumber} of Phase ${phaseNumber}
${reflectionContext}

Using the founder's reflections, generate Sprint ${sprintNumber} that:
- Directly addresses gaps or learnings from prior sprints
- Advances the Phase ${phaseNumber} objective: ${phase.focus_area}
- Is personalised to THIS idea and what THIS founder has learned
- Contains exactly 5 progressive tasks

Return ONLY valid JSON, no markdown, no preamble:
{
  "title": "Sprint ${sprintNumber}: [descriptive title based on where this founder is]",
  "tasks": [
    {
      "title": "Task title (max 10 words)",
      "description": "Specific action for this founder at this stage (2-4 sentences)",
      "why_this_matters": "Why this matters given what they've learned (1-2 sentences)",
      "resource_url": "optional URL or null"
    }
  ]
}`
}

export { GeneratedSprintSchema }
```

---

### Prompt 4 — API Route: Generate Initial Roadmap

**Feature: Roadmap Initialisation API**

**Description:**
POST endpoint called when user clicks "Build My Roadmap" from the validation result page. Generates Phase 1 Sprint 1 via Gemini, creates the roadmap record, pre-seeds all 5 phases as locked rows, creates Sprint 1 as active, inserts 5 tasks.

**Files to Create/Modify:**
- `app/api/roadmap/generate/route.ts`

**Implementation:**
```typescript
// File: app/api/roadmap/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { buildRoadmapGenerationPrompt, PHASE_DEFINITIONS, GeneratedSprintSchema } from '@/lib/prompts/roadmap-generator'
import { ScoreBreakdown } from '@/types/roadmap'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { idea_id } = await req.json()
    if (!idea_id) return NextResponse.json({ error: 'idea_id required' }, { status: 400 })

    // Fetch idea
    const { data: idea, error: ideaError } = await supabase
      .from('idea')
      .select('*')
      .eq('id', idea_id)
      .eq('user_id', user.id)
      .single()
    if (ideaError || !idea) return NextResponse.json({ error: 'Idea not found' }, { status: 404 })

    // Check roadmap doesn't already exist
    const { data: existing } = await supabase
      .from('roadmap')
      .select('id')
      .eq('idea_id', idea_id)
      .single()
    if (existing) return NextResponse.json({ error: 'Roadmap already exists', roadmap_id: existing.id }, { status: 409 })

    const scoreBreakdown = idea.score_breakdown as ScoreBreakdown
    const prompt = buildRoadmapGenerationPrompt(idea.title, idea.description, scoreBreakdown)

    // Generate Sprint 1 via Gemini
    const { object: generatedSprint } = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: GeneratedSprintSchema,
      prompt,
    })

    // Create roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmap')
      .insert({ user_id: user.id, idea_id, generated_at: new Date().toISOString() })
      .select()
      .single()
    if (roadmapError) throw roadmapError

    // Pre-seed all 5 phases
    const phasesToInsert = PHASE_DEFINITIONS.map(p => ({
      roadmap_id: roadmap.id,
      phase_number: p.number,
      title: p.title,
      description: p.description,
      focus_area: p.focus_area,
      status: p.number === 1 ? 'active' : 'locked',
      unlocked_at: p.number === 1 ? new Date().toISOString() : null,
    }))
    const { data: phases, error: phaseError } = await supabase
      .from('phase')
      .insert(phasesToInsert)
      .select()
    if (phaseError) throw phaseError

    const phase1 = phases.find(p => p.phase_number === 1)!

    // Create Sprint 1 as active
    const { data: sprint, error: sprintError } = await supabase
      .from('sprint')
      .insert({
        phase_id: phase1.id,
        roadmap_id: roadmap.id,
        sprint_number: 1,
        title: generatedSprint.title,
        status: 'active',
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (sprintError) throw sprintError

    // Insert 5 tasks
    const tasksToInsert = generatedSprint.tasks.map((t, i) => ({
      sprint_id: sprint.id,
      roadmap_id: roadmap.id,
      user_id: user.id,
      task_number: i + 1,
      title: t.title,
      description: t.description,
      why_this_matters: t.why_this_matters,
      resource_url: t.resource_url || null,
    }))
    const { error: taskError } = await supabase.from('task').insert(tasksToInsert)
    if (taskError) throw taskError

    // Mark idea as roadmap generated
    await supabase.from('idea').update({ roadmap_generated: true }).eq('id', idea_id)

    return NextResponse.json({ success: true, roadmap_id: roadmap.id })
  } catch (error: any) {
    console.error('Roadmap generation error:', error)
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 })
  }
}
```

---

### Prompt 5 — API Route: Generate Next Sprint

**Feature: Sprint Unlock & Generation**

**Description:**
Called when a user completes all 5 tasks in the current sprint. Fetches prior reflections, builds a context-aware prompt, generates the next sprint via Gemini, inserts sprint + tasks, and updates roadmap progress counters.

**Files to Create/Modify:**
- `app/api/roadmap/sprint/generate/route.ts`

**Implementation:**
```typescript
// File: app/api/roadmap/sprint/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { buildNextSprintPrompt, GeneratedSprintSchema } from '@/lib/prompts/sprint-generator'
import { ScoreBreakdown } from '@/types/roadmap'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { completed_sprint_id, roadmap_id } = await req.json()

    // Fetch roadmap + idea
    const { data: roadmap } = await supabase
      .from('roadmap')
      .select('*, idea(*)')
      .eq('id', roadmap_id)
      .eq('user_id', user.id)
      .single()
    if (!roadmap) return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })

    // Fetch completed sprint + its phase
    const { data: completedSprint } = await supabase
      .from('sprint')
      .select('*, phase(*)')
      .eq('id', completed_sprint_id)
      .single()
    if (!completedSprint) return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })

    // Fetch all prior reflections for this roadmap (for context)
    const { data: reflections } = await supabase
      .from('task_reflection')
      .select('content, task(title)')
      .eq('user_id', user.id)
      .in('task_id',
        (await supabase.from('task').select('id').eq('roadmap_id', roadmap_id)).data?.map(t => t.id) || []
      )

    const priorReflections = (reflections || []).map(r => ({
      task_title: (r.task as any)?.title || '',
      reflection: r.content,
    }))

    const scoreBreakdown = roadmap.idea.score_breakdown as ScoreBreakdown
    const currentPhaseNumber = completedSprint.phase.phase_number
    const nextSprintNumber = completedSprint.sprint_number + 1

    // Determine if next sprint is in same phase or new phase
    // For MVP: each phase has 2 sprints; Phase complete after sprint 2
    const SPRINTS_PER_PHASE = 2
    const isPhaseComplete = completedSprint.sprint_number >= SPRINTS_PER_PHASE
    const nextPhaseNumber = isPhaseComplete ? currentPhaseNumber + 1 : currentPhaseNumber

    if (nextPhaseNumber > 5) {
      // Roadmap complete
      await supabase.from('roadmap').update({ status: 'completed' }).eq('id', roadmap_id)
      return NextResponse.json({ success: true, roadmap_complete: true })
    }

    // Get or unlock next phase
    let targetPhase
    if (isPhaseComplete) {
      const { data: nextPhase } = await supabase
        .from('phase')
        .select()
        .eq('roadmap_id', roadmap_id)
        .eq('phase_number', nextPhaseNumber)
        .single()
      await supabase.from('phase').update({
        status: 'active',
        unlocked_at: new Date().toISOString()
      }).eq('id', nextPhase!.id)
      await supabase.from('phase').update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', completedSprint.phase_id)
      targetPhase = nextPhase
    } else {
      targetPhase = completedSprint.phase
    }

    const targetPhaseNumber = isPhaseComplete ? nextPhaseNumber : currentPhaseNumber
    const targetSprintNumber = isPhaseComplete ? 1 : nextSprintNumber

    const prompt = buildNextSprintPrompt(
      roadmap.idea.title,
      roadmap.idea.description,
      scoreBreakdown,
      targetPhaseNumber,
      targetSprintNumber,
      priorReflections
    )

    const { object: generatedSprint } = await generateObject({
      model: google('gemini-2.0-flash-exp'),
      schema: GeneratedSprintSchema,
      prompt,
    })

    // Mark completed sprint as done
    await supabase.from('sprint').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', completed_sprint_id)

    // Insert next sprint
    const { data: newSprint } = await supabase
      .from('sprint')
      .insert({
        phase_id: targetPhase!.id,
        roadmap_id,
        sprint_number: targetSprintNumber,
        title: generatedSprint.title,
        status: 'active',
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Insert 5 tasks
    const tasksToInsert = generatedSprint.tasks.map((t, i) => ({
      sprint_id: newSprint!.id,
      roadmap_id,
      user_id: user.id,
      task_number: i + 1,
      title: t.title,
      description: t.description,
      why_this_matters: t.why_this_matters,
      resource_url: t.resource_url || null,
    }))
    await supabase.from('task').insert(tasksToInsert)

    // Update roadmap counters
    await supabase.from('roadmap').update({
      current_phase: targetPhaseNumber,
      current_sprint: targetSprintNumber,
    }).eq('id', roadmap_id)

    return NextResponse.json({ success: true, sprint_id: newSprint!.id })
  } catch (error: any) {
    console.error('Sprint generation error:', error)
    return NextResponse.json({ error: error.message || 'Sprint generation failed' }, { status: 500 })
  }
}
```

---

### Prompt 6 — Server Actions: Task Completion & Reflection

**Feature: Task Completion with Reflection Gate**

**Description:**
Server actions for completing a task (requires a reflection), checking sprint completion, and triggering next sprint generation. Task completion is atomic: reflection + status update happen together or not at all.

**Files to Create/Modify:**
- `app/actions/sprint.ts`

**Implementation:**
```typescript
// File: app/actions/sprint.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function completeTaskWithReflection(
  taskId: string,
  reflection: string,
  roadmapId: string,
  sprintId: string
): Promise<{ success: boolean; sprint_complete?: boolean; error?: string }> {
  try {
    if (!reflection || reflection.trim().length < 10) {
      return { success: false, error: 'Reflection must be at least 10 characters' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Verify task belongs to user
    const { data: task } = await supabase
      .from('task')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()
    if (!task) return { success: false, error: 'Task not found' }
    if (task.status === 'completed') return { success: false, error: 'Task already completed' }

    // Insert reflection
    const { error: reflError } = await supabase
      .from('task_reflection')
      .insert({ task_id: taskId, user_id: user.id, content: reflection.trim() })
    if (reflError) throw reflError

    // Mark task complete
    const { error: taskError } = await supabase
      .from('task')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId)
    if (taskError) throw taskError

    // Check if all 5 tasks in sprint are complete
    const { data: allTasks } = await supabase
      .from('task')
      .select('status')
      .eq('sprint_id', sprintId)
    
    const allComplete = allTasks?.every(t => t.status === 'completed' || t.id === taskId)
    
    revalidatePath(`/roadmap/${roadmapId}`)
    return { success: true, sprint_complete: allComplete }
  } catch (error: any) {
    console.error('Task completion error:', error)
    return { success: false, error: error.message }
  }
}

export async function getRoadmapOverview(roadmapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('roadmap')
    .select(`
      *,
      idea (id, title, description, score, score_breakdown),
      phase (
        *,
        sprint (
          *,
          task (*, task_reflection(*))
        )
      )
    `)
    .eq('id', roadmapId)
    .eq('user_id', user.id)
    .single()

  return data
}

export async function getActiveSprintForRoadmap(roadmapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('sprint')
    .select('*, task(*, task_reflection(*))')
    .eq('roadmap_id', roadmapId)
    .eq('status', 'active')
    .single()

  return data
}
```

---

### Prompt 7 — UI: Generate Roadmap CTA Component

**Feature: Post-Validation Roadmap CTA**

**Description:**
A component rendered on the idea validation result page when score >= 60 and roadmap_generated is false. Shows a compelling CTA to generate the personalised roadmap. Triggers the generation API and redirects to the roadmap view on success.

**Files to Create/Modify:**
- `components/features/roadmap/GenerateRoadmapCTA.tsx`

**Implementation:**
```typescript
// File: components/features/roadmap/GenerateRoadmapCTA.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'

interface GenerateRoadmapCTAProps {
  ideaId: string
  ideaTitle: string
  score: number
}

export function GenerateRoadmapCTA({ ideaId, ideaTitle, score }: GenerateRoadmapCTAProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerate() {
    setIsGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: ideaId }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        if (res.status === 409 && data.roadmap_id) {
          router.push(`/roadmap/${data.roadmap_id}`)
          return
        }
        throw new Error(data.error || 'Generation failed')
      }
      
      router.push(`/roadmap/${data.roadmap_id}`)
    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Your idea scored {score} — now build it.</CardTitle>
        </div>
        <CardDescription>
          Get a personalised 5-phase roadmap built around "{ideaTitle}" with week-by-week tasks tailored to your specific score gaps. Complete 5 tasks to unlock the next sprint.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full sm:w-auto"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Building your roadmap...
            </>
          ) : (
            <>
              Build My Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
    <p className="text-xs text-muted-foreground mt-1">Takes ~10 seconds. Personalised to your idea.</p>
        <p className="text-xs text-muted-foreground">Only available for ideas scoring 70+.</p>
      </CardContent>
    </Card>
  )
}
```

---

### Prompt 8 — UI: Roadmap Overview Page

**Feature: Roadmap Phase Progress View**

**Description:**
The main roadmap page showing all 5 phases as cards with locked/active/completed states, overall progress percentage, and a prominent link to the active sprint.

**Files to Create/Modify:**
- `app/(dashboard)/roadmap/[roadmapId]/page.tsx`
- `components/features/roadmap/RoadmapOverview.tsx`
- `components/features/roadmap/PhaseCard.tsx`

**Implementation:**
```typescript
// File: app/(dashboard)/roadmap/[roadmapId]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RoadmapOverview } from '@/components/features/roadmap/RoadmapOverview'
import { getRoadmapOverview, getActiveSprintForRoadmap } from '@/app/actions/sprint'

export default async function RoadmapPage({ params }: { params: { roadmapId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [roadmap, activeSprint] = await Promise.all([
    getRoadmapOverview(params.roadmapId),
    getActiveSprintForRoadmap(params.roadmapId),
  ])

  if (!roadmap) notFound()

  return <RoadmapOverview roadmap={roadmap} activeSprint={activeSprint} />
}
```

```typescript
// File: components/features/roadmap/RoadmapOverview.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PhaseCard } from './PhaseCard'
import { ArrowRight } from 'lucide-react'

export function RoadmapOverview({ roadmap, activeSprint }: { roadmap: any; activeSprint: any }) {
  const allTasks = roadmap.phase?.flatMap((p: any) => p.sprint?.flatMap((s: any) => s.task || []) || []) || []
  const completedTasks = allTasks.filter((t: any) => t.status === 'completed').length
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{roadmap.idea.title}</h1>
        <p className="text-muted-foreground mt-1">Phase {roadmap.current_phase} of 5 · Sprint {roadmap.current_sprint}</p>
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
            <p className="text-sm text-muted-foreground">Active Sprint</p>
            <p className="font-semibold">{activeSprint.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeSprint.task?.filter((t: any) => t.status === 'completed').length || 0}/5 tasks complete
            </p>
          </div>
          <Button asChild>
            <Link href={`/roadmap/${roadmap.id}/sprint/${activeSprint.id}`}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your 5 Phases</h2>
        {roadmap.phase?.sort((a: any, b: any) => a.phase_number - b.phase_number).map((phase: any) => (
          <PhaseCard key={phase.id} phase={phase} roadmapId={roadmap.id} />
        ))}
      </div>
    </div>
  )
}
```

```typescript
// File: components/features/roadmap/PhaseCard.tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Lock, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Phase } from '@/types/roadmap'

export function PhaseCard({ phase, roadmapId }: { phase: Phase & { sprint?: any[] }; roadmapId: string }) {
  const isLocked = phase.status === 'locked'
  const isCompleted = phase.status === 'completed'
  const isActive = phase.status === 'active'

  const totalTasks = phase.sprint?.flatMap(s => s.task || []).length || 0
  const completedTasks = phase.sprint?.flatMap(s => s.task || []).filter((t: any) => t.status === 'completed').length || 0

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-all',
      isLocked && 'opacity-50 bg-muted/30',
      isActive && 'border-primary/40 bg-primary/5',
      isCompleted && 'bg-muted/20'
    )}>
      <div className="flex items-start justify-between gap-4">
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
      </div>
    </div>
  )
}
```

---

### Prompt 9 — UI: Sprint Task View

**Feature: Sprint Task List with Reflection Input**

**Description:**
The active sprint view. Shows all 5 tasks with descriptions. Completed tasks are checked off. The current task shows a reflection textarea and a "Complete Task" button. Sprint completion triggers next sprint generation.

**Files to Create/Modify:**
- `app/(dashboard)/roadmap/[roadmapId]/sprint/[sprintId]/page.tsx`
- `components/features/roadmap/SprintTaskList.tsx`
- `components/features/roadmap/TaskItem.tsx`

**Implementation:**
```typescript
// File: app/(dashboard)/roadmap/[roadmapId]/sprint/[sprintId]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SprintTaskList } from '@/components/features/roadmap/SprintTaskList'

export default async function SprintPage({ params }: { params: { roadmapId: string; sprintId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sprint } = await supabase
    .from('sprint')
    .select('*, phase(*), task(*, task_reflection(*))')
    .eq('id', params.sprintId)
    .single()

  if (!sprint) notFound()

  const sortedTasks = sprint.task?.sort((a: any, b: any) => a.task_number - b.task_number)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Phase {sprint.phase.phase_number} · Sprint {sprint.sprint_number}</p>
        <h1 className="text-xl font-bold mt-1">{sprint.title}</h1>
      </div>
      <SprintTaskList
        tasks={sortedTasks}
        sprintId={params.sprintId}
        roadmapId={params.roadmapId}
      />
    </div>
  )
}
```

```typescript
// File: components/features/roadmap/SprintTaskList.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TaskItem } from './TaskItem'
import { completeTaskWithReflection } from '@/app/actions/sprint'
import { TaskWithReflection } from '@/types/roadmap'

interface SprintTaskListProps {
  tasks: TaskWithReflection[]
  sprintId: string
  roadmapId: string
}

export function SprintTaskList({ tasks, sprintId, roadmapId }: SprintTaskListProps) {
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const firstPendingTask = tasks.find(t => t.status === 'pending')

  async function handleComplete(taskId: string, reflection: string) {
    setCompletingId(taskId)
    setError(null)
    
    const result = await completeTaskWithReflection(taskId, reflection, roadmapId, sprintId)
    
    if (!result.success) {
      setError(result.error || 'Failed to complete task')
      setCompletingId(null)
      return
    }

    if (result.sprint_complete) {
      // Trigger next sprint generation
      try {
        const res = await fetch('/api/roadmap/sprint/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed_sprint_id: sprintId, roadmap_id: roadmapId }),
        })
        const data = await res.json()
        if (data.roadmap_complete) {
          router.push(`/roadmap/${roadmapId}?complete=true`)
          return
        }
      } catch (e) {
        console.error('Sprint generation failed', e)
      }
    }

    router.refresh()
    setCompletingId(null)
  }

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
        />
      ))}
    </div>
  )
}
```

```typescript
// File: components/features/roadmap/TaskItem.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Lock, Circle, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TaskWithReflection } from '@/types/roadmap'

interface TaskItemProps {
  task: TaskWithReflection
  isActive: boolean
  isLocked: boolean
  isCompleting: boolean
  taskNumber: number
  onComplete: (taskId: string, reflection: string) => void
}

export function TaskItem({ task, isActive, isLocked, isCompleting, taskNumber, onComplete }: TaskItemProps) {
  const [reflection, setReflection] = useState('')
  const isCompleted = task.status === 'completed'

  return (
    <Card className={cn(
      'transition-all',
      isLocked && 'opacity-40',
      isActive && 'border-primary/40 shadow-sm',
      isCompleted && 'bg-muted/20'
    )}>
      <CardHeader className="pb-2">
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
            <p className={cn("font-medium mt-0.5", isCompleted && "line-through text-muted-foreground")}>
              {task.title}
            </p>
          </div>
        </div>
      </CardHeader>

      {(isActive || isCompleted) && (
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
              <p className="text-xs text-muted-foreground font-medium mb-1">Your reflection</p>
              <p className="text-sm italic">"{task.task_reflection.content}"</p>
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
                <p className="text-xs text-muted-foreground mt-1">{reflection.length}/10 min characters</p>
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
```

---

### Prompt 10 — Integration: Wire CTA into Validation Result Page

**Feature: Connect Roadmap CTA to Existing Validation Flow**

**Description:**
Modify the existing validation result page to render `GenerateRoadmapCTA` when score >= 60 and `roadmap_generated` is false. If a roadmap already exists, show a "Continue Roadmap" link instead.

**Files to Modify:**
- `app/(dashboard)/ideas/[ideaId]/page.tsx` — add roadmap state check and CTA

**Implementation instructions for Cursor:**

In the existing idea detail page Server Component:
1. After fetching the idea, additionally query the roadmap table: `SELECT id FROM roadmap WHERE idea_id = [ideaId] AND user_id = [userId] LIMIT 1`
2. If `idea.score >= 70` AND `!idea.roadmap_generated` AND no roadmap row exists → render `<GenerateRoadmapCTA ideaId={idea.id} ideaTitle={idea.title} score={idea.score} />`
3. If a roadmap row exists → render a "Continue Roadmap →" button linking to `/roadmap/[roadmap.id]`
4. If `idea.score < 70` → render nothing (or a "Strengthen your idea first" message)

Import `GenerateRoadmapCTA` from `@/components/features/roadmap/GenerateRoadmapCTA`

---

### Testing Checklist

```
[ ] Phase 1: Run SQL schema in Supabase — all tables created, RLS enabled
[ ] Phase 2: Generate TypeScript types via `supabase gen types typescript --local > types/database.ts`
[ ] Phase 3: Test roadmap-generator prompt directly in Gemini playground with a sample idea
[ ] Phase 4: POST /api/roadmap/generate with a valid idea_id — verify roadmap, 5 phases, 1 sprint, 5 tasks created in DB
[ ] Phase 5: Complete all 5 tasks via completeTaskWithReflection action — verify sprint_complete = true
[ ] Phase 6: POST /api/roadmap/sprint/generate — verify new sprint + 5 tasks created, prior reflections ingested
[ ] Phase 7: Visit /roadmap/[id] — phase cards render correctly with locked/active states
[ ] Phase 8: Visit /roadmap/[id]/sprint/[sprintId] — tasks render sequentially, locked tasks are greyed
[ ] Phase 9: Complete a task with < 10 char reflection — verify rejection
[ ] Phase 10: Complete all 5 tasks — verify redirect to next sprint, roadmap progress counter updates
[ ] Phase 11: Idea with score >= 60 — CTA renders on validation result page
[ ] Phase 12: Idea with existing roadmap — "Continue Roadmap" link renders instead of CTA
```
