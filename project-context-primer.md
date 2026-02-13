# Startup Idea Validator - Cursor Rules

The name of this tool is called Venlidate

## Project Overview
A SaaS tool that uses AI to analyze startup ideas against 7 business model fundamentals, providing scored validation reports (0-100) to help entrepreneurs prioritize ideas and avoid wasting time on non-viable concepts.

## Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict mode)
- Database: Supabase PostgreSQL
- Auth: Supabase Auth (email/password)
- Styling: Tailwind CSS + shadcn/ui
- AI: Vercel AI SDK + Gemini 2.5 Flash Lite
- Deployment: Vercel

## File Structure
```
/app
  /(auth)              # Auth pages (login, signup, reset)
  /(dashboard)         # Protected dashboard pages
  /actions             # Server Actions only
  /api                 # API routes (future webhooks)
  /layout.tsx
  /page.tsx            # Landing page
/components
  /ui                  # shadcn base components
  /features            # Feature-specific components
/lib
  /supabase            # Supabase client setup
  /ai                  # AI validation logic
  /utils               # Utility functions
/types
  /database.ts         # Generated from Supabase
  /validations.ts      # Validation result types
/supabase
  /migrations          # SQL migration files
```

## Code Style & Patterns

### Component Patterns
- Default to Server Components
- Only use 'use client' when necessary (forms, interactivity, charts)
- Keep components focused and single-purpose
- Use TypeScript for all files
- No 'any' types except in rare edge cases

### Data Fetching
- Server Components: fetch data directly from Supabase
- Client Components: use Server Actions for mutations
- Always handle loading and error states
- Use revalidatePath() after mutations
- Cache validation results (they don't change once generated)

### Server Actions
- All Server Actions in /app/actions directory
- Always use 'use server' directive
- Always validate user authentication first
- Always validate input data with Zod
- Return structured responses: `{ success: boolean, data?: any, error?: string }`
- Handle errors with try/catch
- Never expose raw database errors to client

### Database
- All tables must have: id (uuid), created_at, updated_at
- Enable RLS on all tables (multi-user app)
- Use foreign keys for relationships
- Create indexes for: user_id, idea_id, created_at
- Never expose database credentials in client code
- Use Supabase server client for all authenticated queries

### AI Integration
- Default model: gemini-2.5-flash-lite
- Always use Vercel AI SDK for AI operations
- Store GOOGLE_GENERATIVE_AI_API_KEY in environment variables (not NEXT_PUBLIC_)
- Set reasonable token limits (max_tokens: 2000)
- Handle AI errors gracefully (fallback to generic message)
- Cache AI responses in database (validations table)
- Never re-generate same validation unless user explicitly re-validates

### Error Handling
- Never throw raw errors to the client
- Always return error objects from Server Actions
- Show user-friendly error messages in UI
- Log errors to console for debugging
- Handle AI timeouts and rate limits

### Type Safety
- Generate types from Supabase: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts`
- Import database types from @/types/database
- Create custom types for validation results in @/types/validations.ts
- Use Zod for form validation and runtime checks

## Anti-Patterns (Never Do This)
- ❌ Don't use pages directory patterns
- ❌ Don't fetch data in Client Components
- ❌ Don't store GOOGLE_GENERATIVE_AI_API_KEY in NEXT_PUBLIC_ variables
- ❌ Don't skip RLS policies
- ❌ Don't use client-side Supabase client for authenticated operations
- ❌ Don't re-run AI validation on every page load (cache in database)
- ❌ Don't ignore TypeScript errors
- ❌ Don't create files without explicit instructions
- ❌ Don't use inline styles (use Tailwind classes)
- ❌ Don't build payment integration yet (MVP is free beta)

## Validation Engine Specifics

### 7 Dimensions (each scored 0-10)
1. Painkiller vs. Vitamin
2. Revenue Model Viability
3. Customer Acquisition Feasibility
4. Competitive Moat
5. Founder-Market Fit
6. Time-to-Revenue Reality
7. Scalability

### Overall Score Calculation
- Weighted average: `(painkiller * 2 + revenue * 1.5 + acquisition * 1.5 + moat * 1 + founder_fit * 1 + time_to_revenue * 1 + scalability * 1.5) / 9.5`
- Round to nearest integer (0-100)

### Traffic Light System
- Red (0-40): High risk - fundamental flaws
- Yellow (41-69): Proceed with caution
- Green (70-100): Strong foundation

### AI Prompt Structure
Each dimension has a specific prompt template in /lib/ai/prompts.ts:
- Include user's form responses
- Ask for score (0-10) + reasoning (2-3 sentences)
- Request specific red flags if score < 5
- Return structured JSON

### Benchmark Calculation
- Query validations table for current month
- Calculate percentile: `(validations with score < user_score / total_validations) * 100`
- Update benchmark_data table daily (cron job or manual trigger)

## Context Instructions
When modifying:
- Server Actions → also update the component that calls it
- Database schema → regenerate TypeScript types
- AI prompts → test with multiple idea types
- Authentication → check middleware and RLS policies
- Validation logic → update both backend and display components

## Testing Approach
Manual testing only for MVP:
1. Test auth flow (signup, login, logout, password reset)
2. Test idea submission with various inputs
3. Test AI validation with different idea types
4. Test dashboard loading and display
5. Test iteration history (submit same idea twice with changes)
6. Test edge cases (empty fields, very long text, special characters)

## Environment Variables Required
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GOOGLE_GENERATIVE_AI_API_KEY=

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Workflow
1. Start Supabase locally: `npx supabase start`
2. Run migrations: `npx supabase db push`
3. Generate types: `npx supabase gen types typescript --local > types/database.ts`
4. Run dev server: `npm run dev`
5. Test auth flow before building features
6. Build one feature at a time following atomic prompts
```

---

## Phase 3: Project Context Primer

This Next.js 15 application implements an AI-powered startup idea validation platform using a structured three-layer architecture. The data layer uses Supabase PostgreSQL with Row Level Security policies enforcing user isolation across ideas and validations tables. The AI validation engine leverages Gemini 2.5 Flash Lite through Vercel AI SDK, executing seven dimension-specific prompts that return structured JSON containing scores (0-10) and reasoning strings. These validations are cached in the database to prevent redundant API calls.

The application uses Server Components by default for optimal performance, with Client Components reserved for forms (react-hook-form integration), charts (recharts for iteration history), and interactive elements. Authentication flows through Supabase Auth with middleware protecting all `/dashboard` routes. Server Actions in the `/app/actions` directory handle all mutations, implementing a consistent pattern: validate auth, validate input with Zod, execute database operation, revalidate path, return structured result.

The scoring algorithm computes a weighted average across seven dimensions, with painkiller, revenue model, acquisition, and scalability receiving higher weights (1.5-2x) than moat, founder fit, and time-to-revenue (1x each). The overall score maps to a traffic light system where 0-40 triggers red warnings, 41-69 shows yellow caution, and 70-100 displays green confidence. Benchmark percentiles calculate by comparing user scores against monthly aggregates stored in benchmark_data table.

The idea intake form uses a multi-step wizard pattern with client-side validation before server submission. Upon submission, a Server Action triggers the AI validation engine, which executes seven sequential prompts (one per dimension), aggregates results, calculates overall score, and inserts a validation record linked to the idea. The dashboard displays ideas with their latest validation scores, supporting iteration tracking through multiple validations per idea. Users can re-validate ideas to see score evolution over time.

Critical technical constraints: Never execute AI validation synchronously on page load (always cache), never expose service role key to client, always enforce RLS policies on multi-tenant tables, always validate user ownership before mutations, always use server-side Supabase client for authenticated operations, and always return user-friendly errors from Server Actions without exposing database internals.

