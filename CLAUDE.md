# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # TypeScript check + production build
npm run lint       # ESLint
npx supabase start # Start local Supabase (Docker required)
npx supabase db push  # Apply migrations
npx supabase gen types typescript --local > types/database.ts  # Regenerate DB types after schema changes
```

There are no automated tests. Manual testing only — see `TESTING_CHECKLIST.md`.

## Architecture

**Venlidate** is an AI-powered startup idea validator (Next.js 15 App Router + Supabase + Vercel AI SDK).

### Request flow

1. All pages under `/(dashboard)` and `/admin` are protected. Auth is enforced by Next.js middleware + Supabase SSR.
2. **Server Components** fetch data directly from Supabase (using `lib/supabase/server.ts`).
3. **Client Components** (`'use client'`) are limited to forms, charts, and interactive elements. They never call Supabase directly — they call Server Actions.
4. **Server Actions** (`app/actions/*.ts`) handle all mutations. Pattern: authenticate → validate input → DB op → `revalidatePath()` → return `{ success, data?, error? }`.
5. **API routes** (`app/api/`) are only used for LLM generation that requires streaming or complex orchestration (roadmap/sprint generation).

### AI layer

`lib/ai/models.ts` exports `generateTextWithFallback()`, which tries a 4-model chain in order: Gemini 2.5 Flash Lite → Gemini 2.5 Flash → OpenRouter (Gemini 2.5 Flash) → DeepSeek. All validation prompts go through this.

`lib/ai/validator.ts` → `validateIdea()` runs 7 sequential LLM calls (one per dimension), then 3 more calls for red flags, comparable companies, and recommendations. Action plans are generated only for pro/premium users. All AI responses are parsed defensively — `extractJSON()` + `safeParseJSON()` handle markdown fences and truncated output.

Roadmap generation (`app/api/roadmap/generate/route.ts`) uses `generateObject()` with a Zod schema (`GeneratedSprintSchema`) directly against `gemini-2.5-flash-lite` — no fallback chain here.

### Validation scoring

```
overallScore = (painkiller*2 + revenue*1.5 + acquisition*1.5 + moat*1 + founderFit*1 + timeToRevenue*1 + scalability*1.5) / 9.5
```
Traffic light: Red 0–40, Yellow 41–69, Green 70–100.

After validation, `idea.score_breakdown` stores a JSONB snapshot mapping dimension names to scores (used by Phase 2 roadmap generation).

### Phase 2: Roadmap

Post-validation execution engine. DB tables: `roadmap`, `phase`, `sprint`, `task`, `task_reflection`.

- 5 pre-seeded phases (defined in `lib/prompts/roadmap-generator.ts` as `PHASE_DEFINITIONS`), only Phase 1 unlocked initially
- Sprints are generated on-demand (not pre-generated) — each sprint uses prior task reflections as context
- Tasks are sequential within a sprint; task completion requires a reflection (min 10 chars)
- Sprint completion triggers next sprint generation via `POST /api/roadmap/sprint/generate`
- Types live in `types/roadmap.ts`

### Subscription & quota system

`lib/utils/subscriptions.ts` is the central authority. Three tiers (free/pro/premium) with limits from `TIER_LIMITS` in `types/subscriptions.ts`. Key rules:
- Re-validating the same idea in the same month doesn't consume quota
- Free credits (`user_karma.free_validation_credits`) are consumed after quota is exhausted
- Free tier reports expire (inaccessible) after 30 days; pro/premium have permanent access

### Key environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # Server-side only — never expose to client
GOOGLE_GENERATIVE_AI_API_KEY
OPENROUTER_API_KEY
DEEPSEEK_API_KEY
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
CRON_SECRET
NEXT_PUBLIC_APP_URL
```

### Critical constraints

- Never pre-generate all sprints — generate on unlock only
- Never re-run AI validation on page load — always read from `validations` table
- Never use `lib/supabase/client.ts` for authenticated/mutating operations — use `lib/supabase/server.ts`
- Never use `lib/supabase/admin.ts` (service role) except in cron/webhook API routes
- Always verify `user_id` ownership before any DB mutation — RLS is a second layer, not the first
- After any schema change, regenerate `types/database.ts`
