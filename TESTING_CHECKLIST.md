# Venlidate Launch Testing Checklist

## 🔐 Authentication & User Management

### Free Tier User
- [ ] Sign up with email/password → verify email confirmation sent
- [ ] Login with correct credentials → redirect to /dashboard
- [ ] Login with wrong credentials → show error message
- [ ] Forgot password flow → receive reset email → reset successfully
- [ ] Logout → redirect to landing page
- [ ] Access /dashboard while logged out → redirect to /login
- [ ] Auto-create free subscription on signup
- [ ] Auto-create user_karma record on signup

### Subscription Tiers
- [ ] New user defaults to free tier (status: active)
- [ ] Free tier limits enforced (1 validation/month, 1 iteration/idea)
- [ ] Manually upgrade user to Pro in database → verify features unlock
- [ ] Manually upgrade user to Premium → verify all features unlock

---

## ✅ Core Validation Flow

### Idea Creation & Validation
- [ ] Fill out idea form (all 7 fields) → submit successfully
- [ ] Submit with missing fields → show validation errors
- [ ] Submit with very long text (2000+ chars) → accept or truncate gracefully
- [ ] AI validation completes (check 15-30 second wait)
- [ ] All 7 dimension scores generated (0-10 range)
- [ ] Overall score calculated correctly (weighted average)
- [ ] Traffic light assigned correctly (0-40 red, 41-69 yellow, 70-100 green)
- [ ] Validation saved to database with all fields
- [ ] Redirect to /dashboard/[ideaId] after validation

### Validation Report Display
- [ ] All 7 dimension cards display with scores and reasoning
- [ ] Traffic light indicator shows correct color/text
- [ ] Comparable companies section displays (if generated)
- [ ] Recommendations section displays
- [ ] Red flags section displays (if score < 50)
- [ ] Created date shows correctly
- [ ] No UI breaking/overflow issues with long text

### Iteration & History
- [ ] Re-validate same idea → creates new validation record
- [ ] Iteration history chart shows multiple validations over time
- [ ] Line chart displays score changes correctly
- [ ] Can toggle between different validation dates

---

## 📊 Dashboard & Ideas Management

### Ideas List
- [ ] Dashboard shows all user's ideas (newest first)
- [ ] Each idea card shows: title, score (if validated), traffic light, date
- [ ] "Not Validated" badge shows for unvalidated ideas
- [ ] Click idea → navigate to detail page
- [ ] Delete idea → confirm dialog → idea removed (cascade deletes validations)
- [ ] Empty state shows when no ideas exist
- [ ] "New Idea" button prominent and functional

### Comparison Feature
- [ ] Can access comparison from dashboard
- [ ] Select 2-3 ideas as Pro user → comparison view works
- [ ] Try to select 4 ideas as Pro → blocked with upgrade prompt
- [ ] Select up to 5 ideas as Premium → works
- [ ] Side-by-side view displays all dimension scores
- [ ] Highest score per dimension highlighted
- [ ] Mobile responsive (stacks vertically)

---

## 💰 Monetization & Quota System

### Free Tier Limits
- [ ] Validate 1 idea as free user → success
- [ ] Try to validate 2nd idea same month → blocked with error
- [ ] Error message suggests upgrading or sharing to earn credits
- [ ] Try to iterate on idea twice as free user → blocked after 1 iteration
- [ ] After 30 days, old reports show "Archived" banner
- [ ] Upgrade to Pro → archived reports restored

### Pro Tier Features
- [ ] Validate up to 10 ideas in same month → all succeed
- [ ] Try to validate 11th idea → blocked with Premium upgrade prompt
- [ ] Unlimited iterations on any idea → works
- [ ] Compare up to 3 ideas → works
- [ ] Try to compare 4 ideas → blocked
- [ ] Export PDF button visible and functional
- [ ] Reports saved forever (no 30-day limit)

### Premium Tier Features
- [ ] Validate 15+ ideas → no blocking
- [ ] Unlimited iterations → works
- [ ] Compare 5 ideas → works
- [ ] All Pro features available

### Free Validation Credits
- [ ] Share an idea → earn 1 free credit
- [ ] free_validation_credits increments in user_karma
- [ ] Use free credit to validate → credit decrements
- [ ] Free credits take priority over monthly quota
- [ ] Unshare idea → credit removed

---

## 🌐 Idea Marketplace

### Public Browse (/ideas)
- [ ] Visit /ideas logged out → see 20 recent ideas
- [ ] Ideas display with: title, score, traffic light, problem snippet
- [ ] Click "View Details" → modal with limited preview
- [ ] Modal shows signup CTA for full details
- [ ] Social share buttons work (Twitter, LinkedIn)
- [ ] SEO meta tags present (og:title, og:description, og:image)

### Authenticated Browse
- [ ] Login → /ideas shows more ideas (50+)
- [ ] Click idea → see full details (all 7 scores)
- [ ] Pro users can filter by score range
- [ ] Premium users can search by keyword
- [ ] Premium users can filter by industry (if implemented)
- [ ] Save favorite ideas (Pro/Premium only)

### Individual Idea Pages (/ideas/[id])
- [ ] Clean URL works: /ideas/[uuid]
- [ ] Shows full idea details (respecting auth level)
- [ ] OG image generates correctly for social sharing
- [ ] 404 for non-existent or non-approved ideas
- [ ] View count increments on each view

### Sharing Flow
- [ ] "Share with Community" button visible on validation report
- [ ] Click → modal opens with privacy options
- [ ] Default: "Share anonymously" checked
- [ ] Uncheck → name field appears
- [ ] Submit → idea created with status "pending"
- [ ] User receives 1 free validation credit immediately
- [ ] Karma stats update (ideas_shared +1)
- [ ] Can unshare idea → credit removed

### Admin Moderation
- [ ] Login as admin → /admin/shared-ideas accessible
- [ ] Non-admin tries to access → 404 or redirect
- [ ] Pending ideas tab shows all pending submissions
- [ ] Approve idea → status changes to "approved" → appears on /ideas
- [ ] Reject idea → status changes to "rejected" → hidden
- [ ] "Create Curated Idea" tab works
- [ ] Admin validates idea → auto-approved → appears on /ideas immediately

---

## 🎨 UI/UX Polish

### General
- [ ] All pages mobile responsive (test on iPhone, Android viewports)
- [ ] No horizontal scroll on mobile
- [ ] Touch targets minimum 44x44px (buttons, links)
- [ ] Loading spinners show during async operations
- [ ] Success toasts appear and auto-dismiss
- [ ] Error toasts appear and stay until dismissed
- [ ] No console errors in browser dev tools
- [ ] No React warnings in dev console

### Forms
- [ ] All forms show validation errors clearly
- [ ] Submit buttons disable during loading
- [ ] Required fields marked with asterisk or label
- [ ] Textarea auto-expands or has scroll
- [ ] Placeholder text helpful and not too long

### Navigation
- [ ] Header navigation clear and functional
- [ ] Active page highlighted in nav
- [ ] User dropdown shows email and logout option
- [ ] Breadcrumbs show on all dashboard pages
- [ ] Back button works as expected

### Typography & Spacing
- [ ] Consistent font sizes (no random 13px, 17px, etc.)
- [ ] Sufficient line height for readability (1.5-1.6)
- [ ] Consistent spacing (use Tailwind's 4px increments)
- [ ] No text cut off or overflow
- [ ] Colors have sufficient contrast (WCAG AA minimum)

### Empty States
- [ ] Dashboard with no ideas shows helpful empty state
- [ ] /ideas with no approved ideas shows message
- [ ] No comparison selected shows instruction
- [ ] No archived reports shows positive message

---

## 🔒 Security & Privacy

### RLS Policies
- [ ] Users can only see their own ideas (test with 2 accounts)
- [ ] Users can only see their own validations
- [ ] Users can only see their own subscription data
- [ ] Users can only see their own karma
- [ ] Users can see ALL approved shared ideas (public data)
- [ ] Users cannot modify other users' data

### Environment Variables
- [ ] No secrets in NEXT_PUBLIC_ variables
- [ ] GOOGLE_GENERATIVE_AI_API_KEY not exposed to client
- [ ] SUPABASE_SERVICE_ROLE_KEY only used server-side
- [ ] All .env files in .gitignore

### Input Validation
- [ ] SQL injection attempts blocked (Supabase parameterized queries)
- [ ] XSS attempts sanitized (React escapes by default, verify)
- [ ] File upload validation (if applicable)
- [ ] Rate limiting on API routes (future: add if abuse detected)

---

## 📈 Performance

### Load Times
- [ ] Landing page loads < 2 seconds (3G connection)
- [ ] Dashboard loads < 3 seconds
- [ ] Validation completes < 30 seconds (AI processing)
- [ ] /ideas page loads < 2 seconds

### Database Queries
- [ ] No N+1 queries (check Supabase logs)
- [ ] Indexes used for user_id, created_at lookups
- [ ] Pagination implemented for long lists

### Caching
- [ ] Validation results cached (not re-run on page refresh)
- [ ] Shared ideas cached (revalidate on approval)
- [ ] Static pages cached by Vercel

---

## 🚀 SEO & Marketing

### Meta Tags
- [ ] Landing page: title, description, OG tags
- [ ] /ideas page: optimized for "startup ideas" keywords
- [ ] Individual idea pages: dynamic OG images
- [ ] Sitemap.xml includes all public pages
- [ ] robots.txt allows indexing

### Analytics
- [ ] Vercel Analytics installed (or Google Analytics)
- [ ] Track key events: signups, validations, shares, upgrades
- [ ] Track /ideas page views and click-through rate

### Performance Monitoring
- [ ] Vercel Speed Insights enabled
- [ ] Monitor Core Web Vitals (LCP, FID, CLS)
- [ ] Set up error tracking (Sentry or similar)

---

## 🐛 Edge Cases & Error Handling

### Network Errors
- [ ] Validation fails mid-process → show error, allow retry
- [ ] Form submission fails → preserve user input
- [ ] Image upload fails (future) → clear error message

### Data Edge Cases
- [ ] Idea with no validations → show "Not Validated" state
- [ ] Validation with missing fields → handle gracefully (shouldn't happen)
- [ ] User with no subscription record → default to free tier
- [ ] Shared idea with deleted original validation → handle 404

### Browser Compatibility
- [ ] Chrome latest → full functionality
- [ ] Safari latest → full functionality
- [ ] Firefox latest → full functionality
- [ ] Mobile Safari (iOS) → full functionality
- [ ] Chrome Mobile (Android) → full functionality

---

## 📱 Mobile-Specific Testing

### Forms
- [ ] Keyboard doesn't cover submit button
- [ ] Autofill works for email/password
- [ ] Date pickers use native controls
- [ ] Select dropdowns use native controls

### Navigation
- [ ] Hamburger menu (if implemented) works
- [ ] Swipe gestures don't conflict with UI
- [ ] Bottom navigation (if implemented) always visible

### Layout
- [ ] No elements extend beyond viewport width
- [ ] Touch targets sufficiently large
- [ ] Text readable without zooming
- [ ] Images scale appropriately

---

## 🎯 Final Pre-Launch Checklist

### Content
- [ ] All placeholder text replaced with real content
- [ ] No "Lorem ipsum" anywhere
- [ ] No "TODO" comments in code
- [ ] Legal pages created: Privacy Policy, Terms of Service
- [ ] About page created (optional but recommended)

### Admin Setup
- [ ] Your user account has admin role
- [ ] Validated 20-30 curated ideas as admin
- [ ] All curated ideas approved and visible on /ideas
- [ ] Diverse score distribution (30% green, 50% yellow, 20% red)

### Marketing Prep
- [ ] Landing page compelling and clear
- [ ] Pricing page easy to understand
- [ ] /ideas page showcases best ideas first
- [ ] OG images look good on Twitter/LinkedIn preview
- [ ] Signup flow smooth (< 30 seconds)

### Deployment
- [ ] Environment variables set in Vercel
- [ ] Database migrations run in production
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate working
- [ ] Cron jobs configured (report cleanup)

### Monitoring
- [ ] Error tracking active
- [ ] Analytics tracking active
- [ ] Email notifications working (confirmation emails)
- [ ] Backup strategy in place (Supabase auto-backs up)

---

## 🚀 Launch Day Tasks

1. [ ] Final test all critical paths (signup → validate → share)
2. [ ] Announce on Twitter/LinkedIn
3. [ ] Post on Indie Hackers
4. [ ] Submit to Product Hunt (optional, consider timing)
5. [ ] Email existing beta users (if any)
6. [ ] Monitor error logs closely for first 24 hours
7. [ ] Be ready to respond to feedback quickly

---

## 📊 Post-Launch Metrics to Track

### Week 1
- [ ] Total signups
- [ ] Validation completion rate (signups → validations)
- [ ] Sharing rate (validations → shares)
- [ ] /ideas page traffic (organic vs. direct)
- [ ] Free → Pro conversion rate
- [ ] Churn rate (if applicable)

### Month 1
- [ ] MRR (if charging)
- [ ] Active users (validated at least 1 idea)
- [ ] Ideas shared (community contribution)
- [ ] Top traffic sources (SEO, social, direct)
- [ ] Most viewed shared ideas (what resonates?)

---

## 📝 Notes

**Remember: Perfect is the enemy of shipped.** If 90% of checklist passes, launch and iterate.

### Testing Priority
1. **Critical** (must be 100%): Auth, Validation, Monetization, Security
2. **High** (should be 90%+): Dashboard, Marketplace, UI/UX
3. **Medium** (nice to have): Performance, SEO, Edge Cases
4. **Low** (post-launch): Analytics deep dive, advanced features

### How to Use This Checklist
1. Work through each section systematically
2. Check off items as you test
3. Document any issues found in a separate bug tracker
4. Fix critical bugs before launch
5. Schedule medium/low priority fixes for post-launch iterations
