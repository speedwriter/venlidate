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