# Venlidate - Startup Idea Validator

## Overview
Venlidate is a SaaS platform that validates startup ideas using AI-powered analysis across 7 critical business fundamentals. The platform features an idea marketplace where users can browse and share validated ideas, creating a community-driven repository of startup concepts.

## Features

### Core Validation
- **AI-Powered Analysis**: Leverages Google's Gemini 2.0 Flash for comprehensive idea evaluation
- **7-Dimension Scoring**: Evaluates ideas across Market Opportunity, Problem-Solution Fit, Competitive Advantage, Business Model Viability, Execution Feasibility, Market Timing, and Scalability Potential
- **Traffic Light System**: Visual scoring (Red: 0-40, Yellow: 41-69, Green: 70-100)
- **Iteration Tracking**: Monitor score changes over time as you refine your idea
- **Comparable Companies**: AI-generated list of similar successful companies
- **Actionable Recommendations**: Specific next steps to improve your idea

### Idea Marketplace
- **Public Browse**: Explore 500+ validated startup ideas
- **Tiered Access**: Free users see limited details, Pro/Premium users access full analysis
- **Community Sharing**: Share your validated ideas (anonymously or with attribution)
- **Admin Moderation**: Quality-controlled curation of shared ideas
- **Social Sharing**: Built-in Twitter/LinkedIn sharing with OG images
- **SEO Optimized**: Individual idea pages with dynamic meta tags

### Monetization & Gamification
- **Freemium Model**: 3 tiers (Free, Pro $39/mo, Premium $79/mo)
- **Quota System**: Monthly validation limits based on subscription tier
- **Free Credits**: Earn validation credits by sharing ideas with the community
- **Karma System**: Track contributions (ideas shared, validations earned)
- **PDF Export**: Download professional validation reports (Pro/Premium)
- **Idea Comparison**: Side-by-side analysis of multiple ideas (Pro: 3, Premium: 5)

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts (for iteration history)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Vercel AI SDK + Google Gemini 2.0 Flash
- **PDF Generation**: jsPDF
- **Deployment**: Vercel

### Database Schema
- `ideas` - User-submitted startup ideas
- `validations` - AI validation results with 7-dimension scores
- `user_subscriptions` - Subscription tier and quota tracking
- `user_karma` - Community contribution tracking
- `shared_ideas` - Public marketplace ideas (with moderation status)
- `admin_users` - Admin role management

## Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google AI Studio API key (for Gemini)
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd venlidate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Google AI
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   
   # Cron (for cleanup jobs)
   CRON_SECRET=your_random_secret
   
   # App URL (for OG images)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run database migrations**
   ```bash
   # If using Supabase CLI locally
   npx supabase db push
   
   # Or run migrations manually in Supabase dashboard
   # Files are in: supabase/migrations/
   ```

5. **Generate TypeScript types**
   ```bash
   npx supabase gen types typescript --local > types/database.ts
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Stripe Webhook Testing (Local Development)

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Start webhook forwarding: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret from the output and add it to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
5. In another terminal, start your Next.js dev server: `npm run dev`
6. Test the integration by triggering events:
   - `stripe trigger checkout.session.completed`
   - `stripe trigger customer.subscription.deleted`
   - `stripe trigger invoice.payment_failed`

Keep `stripe listen` running while testing locally.

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI Studio API key
- `CRON_SECRET` - Secret for authenticating cron job requests

### Optional
- `NEXT_PUBLIC_APP_URL` - Full app URL (defaults to localhost in dev)

## Deployment

### Deploy to Vercel

1. **Connect repository**
   - Import your GitHub repository in Vercel
   - Select the `venlidate` project

2. **Configure environment variables**
   - Add all required environment variables in Vercel dashboard
   - Set `NEXT_PUBLIC_APP_URL` to your production domain

3. **Deploy**
   - Vercel will automatically build and deploy
   - First deployment may take 2-3 minutes

4. **Run production migrations**
   - Go to your Supabase dashboard
   - Run all migrations from `supabase/migrations/` in order
   - Or use Supabase CLI: `npx supabase db push --linked`

5. **Set up cron job** (optional, for report cleanup)
   - In Vercel dashboard, go to Cron Jobs
   - Add job: `0 0 * * *` (daily at midnight)
   - URL: `https://your-domain.com/api/cron/cleanup-reports`
   - Add `Authorization: Bearer YOUR_CRON_SECRET` header

## Admin Setup

To access admin features (moderate shared ideas, create curated content):

1. **Create your user account** via the signup flow

2. **Get your user ID** from Supabase dashboard:
   - Go to Authentication > Users
   - Copy your user UUID

3. **Grant admin role** in SQL Editor:
   ```sql
   INSERT INTO admin_users (user_id, role)
   VALUES ('your-user-uuid-here', 'superadmin');
   ```

4. **Access admin dashboard**
   - Navigate to `/admin/shared-ideas`
   - Moderate pending submissions
   - Create curated ideas

## Testing

### Manual Testing
Use the comprehensive [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) to verify all features before launch.

### Automated Testing (Optional)
```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run smoke tests
npx playwright test scripts/pre-launch-test.ts
```

## Project Structure

```
venlidate/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── ideas/               # Public marketplace
│   ├── admin/               # Admin-only pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Feature components
├── lib/                     # Utility functions
│   ├── actions/             # Server actions
│   ├── utils/               # Helper functions
│   └── supabase/            # Supabase clients
├── supabase/
│   └── migrations/          # Database migrations
├── types/                   # TypeScript types
├── public/                  # Static assets
└── scripts/                 # Utility scripts

```

## Key Features Implementation

### Validation Flow
1. User submits idea form (7 fields)
2. Server action calls Gemini API with structured prompt
3. AI returns JSON with 7 dimension scores + reasoning
4. Results saved to `validations` table
5. User redirected to validation report page

### Quota System
- Tracked in `user_subscriptions.validations_this_month`
- Resets monthly via cron job
- Free credits in `user_karma.free_validation_credits` take priority
- Enforced in `canUserValidate()` helper function

### Sharing & Credits
- User shares idea → `shared_ideas` record created (status: pending)
- User receives 1 free credit immediately
- Admin approves → status changes to "approved" → visible on `/ideas`
- User unshares → credit removed

## Common Tasks

### Update Subscription Tier (Manual)
```sql
UPDATE user_subscriptions
SET tier = 'pro'  -- or 'premium'
WHERE user_id = 'user-uuid-here';
```

### Reset Monthly Quota (Manual)
```sql
UPDATE user_subscriptions
SET validations_this_month = 0;
```

### View All Shared Ideas
```sql
SELECT * FROM shared_ideas
WHERE status = 'approved'
ORDER BY created_at DESC;
```

## Viewing Cancellation Analytics

Admins can view cancellation feedback at `/admin/analytics/cancellations`.

This dashboard shows:
- **Breakdown of cancellation reasons**: Visual chart and percentage distribution.
- **Recent user feedback**: Table of latest comments with user tier and reason.
- **Key insights**: Top reasons for churn at a glance.

Use this data to:
- Identify product gaps
- Adjust pricing strategy
- Prioritize feature development
- Improve user onboarding

## Troubleshooting

### "Cannot coerce result to single JSON object"
- Check that your query returns exactly one row
- Use `.single()` only when expecting one result
- Use `.maybeSingle()` if result might not exist

### Validation fails with no error
- Check Gemini API key is valid
- Verify API quota not exceeded
- Check browser console for detailed error

### RLS policy errors
- Ensure user is authenticated
- Check `user_id` matches in database
- Verify RLS policies allow the operation

### Free credits not working
- Check `user_karma.free_validation_credits > 0`
- Verify `canUserValidate()` checks credits first
- Ensure `used_free_credit` flag set correctly

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run build` to check for TypeScript errors
4. Run `npm run lint` to check for code style issues
5. Test locally using the testing checklist
6. Submit a pull request (use the PR template)

## License

[Your License Here - e.g., MIT]

## Support

For issues or questions:
- Open a GitHub issue
- Email: [your-email@example.com]
- Twitter: [@yourhandle]

## Roadmap

- [ ] Advanced filtering (by industry, score range)
- [ ] Search functionality for marketplace
- [ ] Save favorite ideas
- [ ] Email notifications for validation completion
- [ ] Stripe integration for paid subscriptions
- [ ] API access for Pro/Premium users
- [ ] Collaboration features (team workspaces)
- [ ] AI chat for idea refinement

---

Built with ❤️ by [Your Name]
