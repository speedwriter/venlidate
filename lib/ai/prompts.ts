export const VALIDATION_PROMPTS = {
  painkiller: `You are a skeptical VC evaluating if this is truly a painkiller (0-10).

Idea details:
- Problem: {problem}
- Proposed Solution: {solution}
- Target customer: {targetCustomer}
- Claimed painkiller moment: {painkillerMoment}

CRITICAL: Challenge the user's claim. Ask:
1. What happens if the customer does NOTHING? (If answer is "nothing terrible" → vitamin)
2. Is this preventing loss or enabling gain? (Preventing loss = painkiller)
3. How often does this pain occur? (Daily/weekly = real, Monthly/yearly = weak)
4. What do customers currently pay to solve this? ($0 = vitamin, >$100 = painkiller)

Score this idea from 0-10:
- 0-3: Vitamin (nice-to-have, can easily postpone)
- 4-6: Moderate pain (annoying but not urgent)
- 7-8: Strong painkiller (acute need, weekly occurrence)
- 9-10: Hair-on-fire painkiller (desperate, willing to pay immediately)

Red flags:
- Words like "optimize," "enhance," "better way" → usually vitamins
- "Platform" or "marketplace" for first-time founders
- Pain described in future tense ("will need") not present tense ("desperately need NOW")

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text, conversational phrases, or commentary before or after the JSON. Do not start with "Here is" or "Here's my". Return only the raw JSON object.

Return this exact JSON structure:
{
  "score": number,
  "reasoning": "3-4 sentences explaining WHY, with specific evidence",
  "realPainCheck": "What actually happens if customer does nothing? Be specific."
}`,

  revenueModel: `Evaluate revenue model viability (0-10) considering FOUNDER REALITY.

Revenue model: {revenueModel}
Proposed Solution: {solution}
Target customer: {targetCustomer}
Founder background: {unfairAdvantage}
Time commitment: {timeCommitment}

Consider:
- One-time vs. recurring (recurring scores higher)
- Realistic pricing for target market
- Can THIS founder credibly charge this amount? (ex: first-time founder charging $10K/year to enterprises = red flag)
- LTV calculation: How many customers needed for $100K ARR?
- Time to close sale: Enterprise (6-12mo) vs SMB (1-3mo) vs Consumer (instant)

HARSH REALITY CHECK:
- If nights/weekends + long sales cycle (6+ months) → score ≤4
- If B2B but founder has no business network → score ≤5
- If usage-based pricing with no users → chicken-egg problem, score ≤6

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text, conversational phrases, or commentary before or after the JSON. Do not start with "Here is" or "Here's my". Return only the raw JSON object.

Return JSON:
{
  "score": number,
  "reasoning": "3-4 sentences with specific math",
  "customersNeeded": "X customers at $Y = $100K ARR",
  "realityCheck": "Can this founder actually execute this pricing model? Why/why not?"
}`,

  acquisition: `Evaluate customer acquisition feasibility (0-10). BE BRUTALLY REALISTIC.

Distribution channel: {distributionChannel}
Proposed Solution: {solution}
Target customer: {targetCustomer}
Founder advantage: {unfairAdvantage}
Time commitment: {timeCommitment}

THE CRITICAL QUESTION: How will founder get first 10 paying customers in 90 days?

Assess:
- Does founder have DIRECT ACCESS to target customers TODAY? (Warm network = 8-10, Cold outreach = 2-4)
- Is stated channel realistic for timeline?
  • "Content marketing" / "SEO" / "Social media" for nights/weekends founder = 0-3 (takes 12+ months)
  • "My LinkedIn network" with 500+ connections in target = 7-9
  • "Cold email" to strangers = 3-5 (low conversion)
  • "I already work with these customers" = 9-10

Red flags that score ≤3:
- Targeting enterprise but no enterprise network
- Channels that require full-time effort (content, SEO, paid ads at scale)
- Vague answers: "social media," "word of mouth," "going viral"
- Founder says "build it and they will come"

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text, conversational phrases, or commentary before or after the JSON. Do not start with "Here is" or "Here's my". Return only the raw JSON object.

Return JSON:
{
  "score": number,
  "reasoning": "3-4 sentences being brutally honest about first 10 customers",
  "first10plan": "Specific: How will founder get first 10 customers in 90 days? If answer is vague, call it out.",
  "timeToFirstCustomer": "Realistic estimate: X weeks/months"
}`,

  moat: `Evaluate competitive moat (0-10). Consider STAGE-APPROPRIATE defensibility.

Unfair advantage: {unfairAdvantage}
Problem: {problem}
Proposed Solution: {solution}

For PRE-LAUNCH ideas (no customers yet):
- Don't expect moat yet, but evaluate POTENTIAL for moat
- Score 5-7 if clear path to moat exists (network effects, data accumulation, specific knowledge)
- Score 0-4 if even at scale there's no moat (commodity service)

For LAUNCHED ideas (has customers):
- What prevents customer churn to competitor?
- What prevents new entrant from copying in 6 months?

Moat types (in order of strength):
1. Network effects (9-10): Value increases with users (marketplace, social)
2. Data moat (8-9): Proprietary data that improves product
3. Brand/community (6-8): Hard-earned trust and following
4. Specific knowledge (6-7): Founder expertise that's hard to replicate
5. First-mover advantage only (3-4): Weak, easily copied
6. No moat (0-2): Commodity, anyone can copy

RED FLAGS (score ≤3):
- Claiming "first mover advantage" as only moat
- Idea can be replicated by ChatGPT wrapper in 2 weeks
- No switching costs for customers

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text, conversational phrases, or commentary before or after the JSON. Do not start with "Here is" or "Here's my". Return only the raw JSON object.

Return JSON:
{
  "score": number,
  "reasoning": "3-4 sentences explaining moat type and strength",
  "moatType": "Which type above? Be specific.",
  "copycatRisk": "Could competitor copy this in 6 months? How?"
}`,

  founderFit: `Evaluate founder-market fit (0-10).

Unfair advantage: {unfairAdvantage}
Problem: {problem}
Proposed Solution: {solution}
Target customer: {targetCustomer}

Does founder background match this problem space?

Score criteria:
- 9-10: Perfect fit (ex: doctor building medical software, ex-Goldman banker building fintech)
- 7-8: Strong fit (relevant industry experience or deep domain knowledge)
- 5-6: Moderate fit (some relevant skills but missing key expertise)
- 3-4: Weak fit (can learn but starting from scratch)
- 0-2: Poor fit (no relevant experience, no clear advantage)

Red flags:
- Lawyer building fintech infrastructure with no fintech experience
- Non-technical founder building dev tools
- No connection to target customer base
- Claiming expertise from brief exposure ("I used X once")

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text, conversational phrases, or commentary before or after the JSON. Do not start with "Here is" or "Here's my". Return only the raw JSON object.

Return JSON:
{
  "score": number,
  "reasoning": "3-4 sentences explaining fit or gaps",
  "credibilityGaps": "What expertise is the founder missing?",
  "canLearnFast": "Can founder acquire missing knowledge quickly? How?"
}`,

  timeToRevenue: `Evaluate time-to-revenue RELATIVE to founder situation (0-10).

Time commitment: {timeCommitment}
Proposed Solution: {solution}
Problem complexity: {problem}
Target customer: {targetCustomer}
Revenue model: {revenueModel}

Calculate realistic time to $10K MRR:
- Product build time based on complexity
- First customer acquisition based on channel
- Iterate to product-market fit
- TOTAL estimate

SCORING (context-dependent):
For NIGHTS/WEEKENDS founder:
- 0-12 months to $10K MRR: 8-10 (can keep job, sustainable)
- 12-24 months: 5-7 (manageable but long)
- 24+ months: 0-4 (will burn out or give up)

For FULL-TIME founder (quit job):
- 0-6 months to $10K MRR: 9-10 (excellent)
- 6-12 months: 6-8 (risky but viable)
- 12-18 months: 3-5 (high burn risk)
- 18+ months: 0-2 (likely to fail/run out of money)

REALITY CHECKS:
- If "nights/weekends" + "enterprise sales" (6-12mo cycle) → score ≤3 (impossible)
- If "full-time" + "slow-moving market" (24+ mo) → score ≤2 (runway risk)
- If complex product + no technical background → add 6-12 months

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text, conversational phrases, or commentary before or after the JSON. Do not start with "Here is" or "Here's my". Return only the raw JSON object.

Return JSON:
{
  "score": number,
  "reasoning": "3-4 sentences with math and founder context",
  "estimate": "X-Y months to $10K MRR",
  "breakeven": "Months until founder can quit day job (if applicable) or needs funding",
  "burnoutRisk": "High/Medium/Low based on timeline vs commitment"
}`,

  scalability: `Evaluate scalability (0-10).

Problem: {problem}
Proposed Solution: {solution}
Revenue model: {revenueModel}

Can this grow without linear effort increase?

Score criteria:
- 9-10: Pure SaaS, software product, zero marginal cost
- 7-8: Mostly scalable with some manual components
- 5-6: Hybrid model (product + services)
- 3-4: Service-heavy with light productization
- 0-2: Pure service business, consulting, agency

Red flags (score ≤3):
- Consulting/agency disguised as product
- High-touch service model ("white glove onboarding")
- Manual processes that don't automate
- Custom work for each client
- Founder is the product (coaching, advising)

Green flags (score ≥7):
- Self-service onboarding
- Automated delivery
- Same product for all customers
- Minimal human intervention after sale

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text, conversational phrases, or commentary before or after the JSON. Do not start with "Here is" or "Here's my". Return only the raw JSON object.

Return JSON:
{
  "score": number,
  "reasoning": "3-4 sentences explaining scalability limits or advantages",
  "bottleneck": "What will prevent scaling? Be specific.",
  "howToScale": "If scalable, how can this reach 1000+ customers?"
}`,

  competition: `Evaluate competitive landscape reality (0-10 difficulty score).
HIGHER SCORE = MORE COMPETITIVE / HARDER TO WIN.

Problem: {problem}
Proposed Solution: {solution}
Target customer: {targetCustomer}
Unfair advantage: {unfairAdvantage}

Questions:
1. Do direct competitors exist? (Similar solution to same problem)
2. Do indirect competitors exist? (How do customers solve this today?)
3. Is this a crowded space? (VC-backed companies, big tech interest)
4. What's the switching cost from current solution?

SCORING:
- 0-2: Blue ocean, no one solving this (SUSPICIOUS - why not? Could be no demand)
- 3-5: Few competitors, niche opportunity (IDEAL - validated but not crowded)
- 6-7: Moderate competition, need clear differentiation
- 8-9: Crowded space, need strong moat or unique angle (HARD)
- 10: Big tech already dominates (DON'T DO IT - you'll lose)

Consider:
- Can founder compete with funded competitors?
- What makes this different enough to win share?
- Is timing right (too early or too late)?

Return JSON:
{
  "competitionScore": number,
  "directCompetitors": "List 2-3 companies if they exist, or 'None found'",
  "indirectCompetitors": "How do customers solve this problem today?",
  "whyYouCanWin": "What needs to be true for you to beat existing solutions?",
  "redFlags": "Any reason this is unwinnable against competition?"
}`,

  founderDelusion: `Detect founder blind spots and self-deception (0-10 delusion score).
HIGHER SCORE = MORE DELUDED / MORE SELF-DECEPTION.

Idea details:
- Problem: {problem}
- Proposed Solution: {solution}
- Target customer: {targetCustomer}
- Unfair advantage: {unfairAdvantage}
- Painkiller moment: {painkillerMoment}
- Distribution channel: {distributionChannel}

Common delusions to detect:
1. "I'll just build it and they'll come" (no distribution plan)
2. "Everyone is my customer" (no focus, trying to boil the ocean)
3. "No one else is doing this" (usually wrong, or there's a good reason)
4. Claiming "first mover advantage" without network effects
5. "I'll monetize later with ads" (lowest-value, hardest model)
6. Describing obvious vitamins as painkillers
7. Overestimating own expertise ("I used Stripe once" ≠ fintech expert)
8. "I'll just work harder than competitors" (not a defensible moat)
9. Assuming customers will pay without evidence
10. Ignoring obvious obstacles or competition

SCORE:
- 0-2: Founder is remarkably realistic, aware of challenges, has validation evidence
- 3-5: Some optimism bias but generally grounded and coachable
- 6-7: Significant blind spots, needs reality check before proceeding
- 8-9: Dangerously deluded, will likely waste months/years without intervention
- 10: Completely detached from reality, should not start this business

Return JSON:
{
  "delusionScore": number,
  "topDelusion": "The single biggest self-deception detected in this idea",
  "realityCheck": "What is the founder most over-optimistic or wrong about?",
  "credibilityGaps": "Where does founder claim expertise they likely don't have?",
  "evidenceGaps": "What assumptions have zero validation or evidence?"
}`,
};

export function interpolatePrompt(template: string, data: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || `{${key}}`);
}

export const COMPARABLE_COMPANIES_PROMPT = `
You are a startup advisor analyzing comparable companies to help a founder learn from successes and failures.

Founder's Idea:
- Problem: {problem}
- Target Customer: {targetCustomer}
- Revenue Model: {revenueModel}
- Distribution: {distributionChannel}
- Unfair Advantage: {unfairAdvantage}

Overall Score: {overallScore}/100
Key Weaknesses: {keyWeaknesses}

Task: Identify 3-4 comparable companies (startups, not Fortune 500s unless highly relevant).

For each company, provide:

1. **name**: Company name
2. **situation**: Current status in 1 sentence (e.g., "Successful - $2B valuation" or "Failed - shut down in 2019" or "Acquired by X for $Y")
3. **whatWorked**: Array of 2-3 specific strategies/decisions that drove their success
   - Be concrete: "Focused on developers first, then upsold to enterprises" not "Good marketing"
   - Include HOW they did it: "Built in public with weekly blog posts showing revenue numbers"
   - Focus on EARLY decisions (first 2-3 years), not mature company tactics
4. **whatDidntWork**: Array of 1-2 mistakes they made or challenges they faced
   - Be honest: Include failures, pivots, near-death experiences
   - Explain the learning: "Tried marketplace model, realized B2B SaaS was better fit"
5. **lessonsForYou**: Array of 2-3 actionable tests the founder should run
   - Frame as experiments: "Test: Can you acquire first 100 customers through X?"
   - Tie to founder's weaknesses: If acquisition score is low, focus lessons on distribution
   - Be specific: "Validate: Will your target customer pay $X/month, not just use for free?"
6. **keyMetric**: ONE metric that defined their early success (e.g., "Time to value: 5 minutes" or "NPS: 72 in first year")

CRITICAL: 
- Choose companies founded in last 10-15 years (not Microsoft, Apple, Google)
- Include at least 1 failed company (to show what NOT to do)
- If possible, include 1 company from same industry/vertical
- Focus on EARLY-stage lessons (0-$10M revenue), not growth-stage tactics
- Make "lessonsForYou" directly testable (not vague advice)

Return ONLY valid JSON array:
[
  {
    "name": "Company Name",
    "situation": "Status in 1 sentence",
    "whatWorked": ["Concrete strategy 1", "Concrete strategy 2"],
    "whatDidntWork": ["Mistake or challenge"],
    "lessonsForYou": ["Test: Specific action 1", "Validate: Specific action 2"],
    "keyMetric": "Metric: Number/description"
  }
]

Choose companies the founder can actually learn from (similar stage, similar market, similar challenges).
`

export function RECOMMENDATIONS_PROMPT(scores: Record<string, number>, data: Record<string, string>): string {
  return `Based on these dimension scores: ${JSON.stringify(scores)}, provide 3 SPECIFIC, ACTIONABLE recommendations.

Idea context:
- Problem: ${data.problem || 'N/A'}
- Solution: ${data.solution || 'N/A'}
- Target customer: ${data.targetCustomer || 'N/A'}
- Distribution channel: ${data.distributionChannel || 'N/A'}

FORMAT EACH AS:
1. "This week: [specific action]" (What to do in next 7 days)
2. "Before quitting job: [validation milestone]" (What proof needed before going full-time)
3. "In 90 days: [decision point]" (Clear go/no-go criteria)

BE SPECIFIC with concrete numbers:
- ❌ "Talk to potential customers"
- ✅ "This week: Cold DM 20 corporate lawyers on LinkedIn asking if they'd pay $50/mo for contract automation"

FOCUS ON BIGGEST WEAKNESSES from lowest scores:
- If painkiller score <5: Force founder to find real, acute pain
- If acquisition score <5: Demand specific plan to get first 10 customers
- If moat score <4: Don't worry about moat yet, focus on getting traction first
- If timeToRevenue score <5: Warn about timeline risks

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON. Keep each field to 1-2 sentences.

Return this exact JSON array structure:
[
  {
    "timeline": "This week" | "Before quitting job" | "In 90 days",
    "action": "Specific thing to do with concrete numbers/targets",
    "successMetric": "How to know if this worked (quantifiable)",
    "whyThis": "Why this addresses your weakest dimension"
  }
]`;
}

export function RED_FLAGS_PROMPT(scores: Record<string, number>): string {
  return `Identify critical red flags in this startup idea based on these scores: ${JSON.stringify(scores)}.

Focus on DEAL-BREAKER issues that suggest founder should NOT proceed without major changes.

Red flag criteria:
- Any score ≤3 is a critical problem
- Painkiller ≤4 = not solving real pain
- Acquisition ≤4 = no clear path to customers
- TimeToRevenue ≤3 = unsustainable timeline

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON.

Return JSON array of strings (each 2-3 sentences explaining the red flag and why it matters).
Maximum 5 red flags. Prioritize most critical issues.

Example format:
[
  "CRITICAL: No clear painkiller moment. Customers can easily postpone or skip this solution, which means low willingness to pay and high churn risk.",
  "WARNING: Distribution plan relies on 'content marketing' for a nights/weekends founder. This typically takes 12-18 months to gain traction, creating a burnout risk."
]`;
}

export function OVERALL_SCORE_PROMPT(scores: Record<string, number>): string {
  return `Based on these dimension scores: ${JSON.stringify(scores)}, provide an overall assessment.

Calculate weighted overall score (0-100):
- Painkiller: 25% weight (most important - no pain = no business)
- Acquisition: 20% weight (can you get customers? critical)
- Founder Fit: 15% weight (can YOU do this?)
- Revenue Model: 15% weight (will it make money?)
- Time to Revenue: 10% weight (can you survive the timeline?)
- Scalability: 10% weight (can it grow?)
- Moat: 5% weight (don't worry about this early)
- Competition: considered in context, not weighted directly
- Founder Delusion: penalty if ≥7 (-10 points from total)

Overall score interpretation:
- 0-40: RED - High risk, fundamental flaws detected. Do not proceed without major pivots.
- 41-60: YELLOW - Proceed with caution. Address critical issues before committing fully.
- 61-75: GREEN - Solid foundation. Focus on execution and validation.
- 76-100: STRONG - Exceptional opportunity. Get started immediately.

Return JSON:
{
  "overallScore": number (0-100),
  "rating": "RED" | "YELLOW" | "GREEN" | "STRONG",
  "verdict": "2-3 sentence bottom-line assessment",
  "biggestStrength": "What's most promising about this idea?",
  "biggestWeakness": "What's the critical flaw or risk?",
  "shouldFounderProceed": "Yes, proceed" | "Yes, but fix X first" | "No, pivot required" | "Hell no, move on"
}`;
}

// Calculate weighted overall score
export function calculateOverallScore(scores: {
  painkiller: number,
  revenueModel: number,
  acquisition: number,
  moat: number,
  founderFit: number,
  timeToRevenue: number,
  scalability: number,
  competition?: number,
  founderDelusion?: number
}): number {
  // Weighted scoring (most important first)
  const weights = {
    painkiller: 0.25,        // MOST IMPORTANT - no pain = no business
    acquisition: 0.20,       // Can you get customers? Critical.
    founderFit: 0.15,        // Can YOU do this?
    revenueModel: 0.15,      // Will it make money?
    timeToRevenue: 0.10,     // Can you survive timeline?
    scalability: 0.10,       // Can it grow?
    moat: 0.05,              // Don't worry about this early
  };

  const weighted = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + ((scores[key as keyof typeof weights] || 0) * weight);
  }, 0);

  // Deduct points for high delusion
  const delusionPenalty = (scores.founderDelusion || 0) >= 7 ? -10 : 0;

  // Convert to 0-100 scale and apply penalty
  const finalScore = Math.max(0, Math.min(100, weighted * 10 + delusionPenalty));

  return Math.round(finalScore);
}

// Get rating based on score
export function getScoreRating(score: number): 'RED' | 'YELLOW' | 'GREEN' | 'STRONG' {
  if (score >= 76) return 'STRONG';
  if (score >= 61) return 'GREEN';
  if (score >= 41) return 'YELLOW';
  return 'RED';
}

// Get verdict based on score and rating
export function getVerdict(score: number, rating: string): string {
  if (rating === 'STRONG') {
    return "Exceptional opportunity with strong fundamentals across all dimensions. Get started immediately and focus on rapid execution.";
  } else if (rating === 'GREEN') {
    return "Solid foundation with good potential. Address minor weaknesses while moving forward with validation and building.";
  } else if (rating === 'YELLOW') {
    return "Proceed with caution. Critical issues exist that must be addressed before full commitment. Focus on de-risking weakest dimensions.";
  } else {
    return "High risk of failure with fundamental flaws. Requires major pivots or reconsideration before proceeding. Consider alternative ideas.";
  }
}

export const THINKING_QUESTIONS_PROMPT = `
You are helping a founder improve their startup idea based on a low validation score.

Dimension: {dimension}
Current Score: {score}/10
Why it scored low: {reasoning}

Idea context:
- Problem: {problem}
- Target customer: {targetCustomer}
- Revenue model: {revenueModel}
- Distribution: {distributionChannel}

Generate 2 specific, actionable questions the founder must answer to improve this score.

Questions should:
- Identify critical assumptions that need validation
- Be answerable through customer interviews, research, or testing
- Help distinguish between assumptions and facts
- Be specific to this idea (not generic startup advice)

Examples of GOOD questions:
- "Can you name 10 specific companies that would pay $X/month for this? Call 5 of them this week."
- "What's the smallest version you could build in 2 weeks to test if anyone will use it?"
- "How will you get your first 100 customers without paid ads? List 3 specific channels."

Examples of BAD questions (too vague):
- "Have you validated product-market fit?"
- "Do you have a go-to-market strategy?"
- "Is there demand for this?"

Return ONLY a JSON array: ["Question 1 that forces concrete action", "Question 2 that identifies assumptions"]
`;

export const ACTION_PLAN_PROMPT = `
You are a startup advisor helping a founder prioritize what to work on next.

Validation Scores (0-10 scale):
- Painkiller vs. Vitamin: {painkillerScore}/10 - {painkillerReasoning}
- Revenue Model: {revenueModelScore}/10 - {revenueModelReasoning}
- Customer Acquisition: {acquisitionScore}/10 - {acquisitionReasoning}
- Competitive Moat: {moatScore}/10 - {moatReasoning}
- Founder-Market Fit: {founderFitScore}/10 - {founderFitReasoning}
- Time to Revenue: {timeToRevenueScore}/10 - {timeToRevenueReasoning}
- Scalability: {scalabilityScore}/10 - {scalabilityReasoning}

Overall Score: {overallScore}/100

Idea Details:
- Problem: {problem}
- Target Customer: {targetCustomer}
- Revenue Model: {revenueModel}
- Distribution: {distributionChannel}
- Founder's Advantage: {unfairAdvantage}
- Time Commitment: {timeCommitment}

Create a prioritized action plan:

1. Identify the top 3 bottlenecks preventing this idea from being viable (lowest scores or highest-impact issues)
2. For each bottleneck, specify:
   - What dimension it relates to
   - The critical question to answer
   - How to validate it (specific method: customer interviews, landing page, prototype, etc.)
   - Success criteria (what "validated" looks like)
   - Estimated days to complete (considering time commitment: nights_weekends = slower, full_time = faster)

3. Provide overall timeline estimate based on time commitment
4. Define "ready to build" criteria (when can they confidently start building?)

Return ONLY valid JSON with this exact structure:
{
  "priorities": [
    {
      "rank": 1,
      "dimension": "Customer Acquisition",
      "issue": "No clear path to first 100 customers",
      "criticalQuestion": "Specifically, how will you get your first 100 customers without paid ads?",
      "validationMethod": "Identify 3 distribution channels, test each with landing page, measure conversion rates",
      "successCriteria": "One channel shows 5%+ conversion from landing page to email signup",
      "estimatedDays": 14
    }
  ],
  "overallTimeline": "3-4 weeks to validate core assumptions",
  "readinessCriteria": "You're ready to build when you have: (1) 20+ customer interviews confirming pain, (2) validated acquisition channel with measurable conversion, (3) 10+ people willing to pay $X"
}

IMPORTANT: 
- Be ruthlessly specific (no generic advice)
- Focus on de-risking (what assumptions could kill this idea?)
- Prioritize by impact (fix revenue model before optimizing scalability)
- Adapt timeline to time commitment (nights/weekends = 2-3x longer than full-time)
`;
