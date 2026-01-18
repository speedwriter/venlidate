-- Users (handled by Supabase Auth)
-- user.id, user.email, user.created_at

-- Ideas submitted by users
ideas:
  id: uuid PRIMARY KEY
  user_id: uuid (FK → auth.users)
  title: text
  problem: text
  target_customer: text
  painkiller_moment: text
  revenue_model: text
  unfair_advantage: text
  distribution_channel: text
  time_commitment: text (enum: 'nights_weekends', 'part_time', 'full_time')
  status: text (enum: 'draft', 'validated', 'archived')
  created_at: timestamptz
  updated_at: timestamptz

-- AI-generated validation results
validations:
  id: uuid PRIMARY KEY
  idea_id: uuid (FK → ideas)
  user_id: uuid (FK → auth.users)
  
  -- Overall scoring
  overall_score: integer (0-100)
  traffic_light: text (enum: 'red', 'yellow', 'green')
  
  -- 7 Dimension scores (0-10 each)
  painkiller_score: integer
  painkiller_reasoning: text
  
  revenue_model_score: integer
  revenue_model_reasoning: text
  
  acquisition_score: integer
  acquisition_reasoning: text
  
  moat_score: integer
  moat_reasoning: text
  
  founder_fit_score: integer
  founder_fit_reasoning: text
  
  time_to_revenue_score: integer
  time_to_revenue_reasoning: text
  time_to_revenue_estimate: text
  
  scalability_score: integer
  scalability_reasoning: text
  
  -- AI-generated insights
  red_flags: jsonb (array of flag objects)
  comparable_companies: jsonb (array of company examples)
  recommendations: jsonb (array of recommendation strings)
  
  -- Metadata
  model_used: text (default: 'gemini-2.0-flash-exp')
  processing_time_ms: integer
  created_at: timestamptz

-- Community benchmark aggregates (for percentile calculations)
benchmark_data:
  id: uuid PRIMARY KEY
  month: text (format: 'YYYY-MM')
  total_validations: integer
  avg_overall_score: numeric
  score_distribution: jsonb (histogram data)
  updated_at: timestamptz
```

**Relationships:**
- `ideas.user_id` → `auth.users.id` (one user, many ideas)
- `validations.idea_id` → `ideas.id` (one idea, many validations for iteration tracking)
- `validations.user_id` → `auth.users.id` (for RLS policies)

---

### 4. Essential Features (MVP Scope)

**Priority 1: Core Validation Flow**
1. User authentication (email/password signup and login)
2. Idea intake form (7-question guided questionnaire)
3. AI validation engine (analyze idea across 7 dimensions)
4. Generate detailed validation report with scores and reasoning
5. Display traffic light system (red/yellow/green)

**Priority 2: User Dashboard**
6. View all validated ideas in a dashboard
7. Click into any idea to see full validation report
8. Archive/delete ideas
9. Re-validate existing idea (creates new validation for iteration tracking)

**Priority 3: Insights & Benchmarks**
10. Show iteration history (how scores changed over time)
11. Display community percentile ranking
12. Show comparable companies (AI-generated examples)
13. Provide personalized recommendations

**Priority 4: Beta Monetization**
14. Pricing page (show future pricing, no Stripe yet)
15. "Founder's Club" waitlist CTA (capture emails for early-bird pricing)

---

### 5. Authentication Strategy

**Supabase Auth** (email/password)
- Email/password signup with email confirmation
- Login/logout
- Password reset flow
- Session management with cookies
- No OAuth in MVP (can add Google/GitHub later)

---

### 6. Technology Stack
```
Framework: Next.js 15 (App Router)
Language: TypeScript (strict mode)
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
Styling: Tailwind CSS + shadcn/ui
AI: Vercel AI SDK + Gemini 2.0 Flash
Deployment: Vercel
Analytics: Vercel Analytics (optional)
```

**Key Dependencies:**
- `@supabase/supabase-js` - Database client
- `@supabase/ssr` - Server-side auth
- `ai` - Vercel AI SDK
- `@ai-sdk/google` - Gemini integration
- `zod` - Form validation
- `react-hook-form` - Form management
- `recharts` - Charts for score visualization
- `lucide-react` - Icons

---

### 7. File Structure
```
/app
  /(auth)
    /login
      /page.tsx
    /signup
      /page.tsx
    /reset-password
      /page.tsx
  /(dashboard)
    /dashboard
      /page.tsx              # Ideas list
      /[ideaId]
        /page.tsx            # Single idea detail + validation report
    /new-idea
      /page.tsx              # Idea intake form
    /pricing
      /page.tsx              # Pricing page (no Stripe yet)
  /actions
    /auth.ts                 # Auth server actions
    /ideas.ts                # CRUD for ideas
    /validations.ts          # AI validation logic
  /api
    /webhook
      /route.ts              # Future: Stripe webhooks
  /layout.tsx
  /page.tsx                  # Landing page
  
/components
  /ui                        # shadcn base components
    /button.tsx
    /card.tsx
    /form.tsx
    /input.tsx
    /badge.tsx
    /progress.tsx
    /tabs.tsx
  /features
    /idea-form.tsx           # Multi-step intake form
    /validation-report.tsx   # Score display + reasoning
    /score-card.tsx          # Individual dimension card
    /traffic-light.tsx       # Red/yellow/green indicator
    /iteration-chart.tsx     # Chart showing score history
    /benchmark-badge.tsx     # Percentile ranking display
    /comparable-companies.tsx # AI-generated examples

/lib
  /supabase
    /client.ts               # Client-side Supabase
    /server.ts               # Server-side Supabase
    /middleware.ts           # Auth middleware
  /ai
    /validator.ts            # Core AI validation logic
    /prompts.ts              # Dimension-specific prompts
  /utils
    /scoring.ts              # Calculate overall score
    /benchmarks.ts           # Percentile calculations
    /formatting.ts           # Date/number formatting

/types
  /database.ts               # Supabase generated types
  /validations.ts            # Validation result types

/supabase
  /migrations
    /001_initial_schema.sql

/public
  /og-image.png

.cursorrules
.env.local
.gitignore
package.json
tsconfig.json
tailwind.config.ts
next.config.js
README.md