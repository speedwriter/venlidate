export const VALIDATION_PROMPTS = {
    painkiller: `You are evaluating a startup idea on the Painkiller vs. Vitamin scale (0-10).

Idea details:
- Problem: {problem}
- Target customer: {targetCustomer}
- Painkiller moment: {painkillerMoment}

Score this idea from 0-10 where:
- 0-3: Vitamin (nice-to-have, no urgency)
- 4-6: Moderate pain (somewhat urgent)
- 7-10: Painkiller (acute, desperate need)

Red flags to watch for:
- Vague problem statements
- "Platform" or "marketplace" for first-time founders
- No clear moment of desperation

Return JSON:
{
  "score": number,
  "reasoning": "2-3 sentence explanation"
}`,

    revenueModel: `Evaluate the revenue model viability (0-10).

Revenue model: {revenueModel}
Target customer: {targetCustomer}

Consider:
- One-time vs. recurring revenue
- Realistic pricing for target market
- LTV potential
- Number of customers needed for $100K ARR

Return JSON:
{
  "score": number,
  "reasoning": "2-3 sentence explanation with math if applicable"
}`,

    acquisition: `Evaluate customer acquisition feasibility (0-10).

Distribution channel: {distributionChannel}
Target customer: {targetCustomer}
Founder advantage: {unfairAdvantage}

Assess:
- Does founder have access to this channel?
- Is CAC reasonable for this customer type?
- Red flag: targeting enterprise with no network

Return JSON:
{
  "score": number,
  "reasoning": "2-3 sentence explanation"
}`,

    moat: `Evaluate competitive moat (0-10).

Unfair advantage: {unfairAdvantage}
Problem: {problem}

What prevents copycats in 6 months?
- Network effects?
- Data moat?
- Specific knowledge/expertise?
- Brand?

Return JSON:
{
  "score": number,
  "reasoning": "2-3 sentence explanation"
}`,

    founderFit: `Evaluate founder-market fit (0-10).

Unfair advantage: {unfairAdvantage}
Problem: {problem}
Target customer: {targetCustomer}

Does founder background match this problem space?
Red flag: lawyer building fintech infrastructure with no fintech experience

Return JSON:
{
  "score": number,
  "reasoning": "2-3 sentence explanation"
}`,

    timeToRevenue: `Evaluate realistic time-to-revenue (0-10).

Time commitment: {timeCommitment}
Problem complexity: {problem}
Target customer: {targetCustomer}

Estimate months to $10K MRR based on:
- Product complexity
- Sales cycle length
- Founder availability

Score inversely (faster = higher score):
- 0-6 months: 9-10
- 6-12 months: 7-8
- 12-18 months: 5-6
- 18-24 months: 3-4
- 24+ months: 0-2

Return JSON:
{
  "score": number,
  "reasoning": "2-3 sentence explanation",
  "estimate": "X-Y months to $10K MRR"
}`,

    scalability: `Evaluate scalability (0-10).

Problem: {problem}
Revenue model: {revenueModel}

Can this grow without linear effort increase?
Red flags:
- Consulting/agency disguised as product
- High-touch service model
- Manual processes that don't automate

Return JSON:
{
  "score": number,
  "reasoning": "2-3 sentence explanation"
}`,
};

export function interpolatePrompt(template: string, data: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || `{${key}}`);
}

export function COMPARABLE_COMPANIES_PROMPT(data: Record<string, string>): string {
    const template = `Based on this idea: {problem} targeting {targetCustomer}, suggest 3 comparable companies (real or hypothetical).
For each, state if they succeeded or failed and why.
Return JSON array:
[
  {
    "name": string,
    "outcome": "success" | "failure",
    "similarity": "1 sentence explaining similarity"
  }
]`;
    return interpolatePrompt(template, data);
}

export function RECOMMENDATIONS_PROMPT(): string {
    return `Based on these scores and the idea details, provide 3 specific, actionable recommendations.
Focus on biggest weaknesses and what to validate first before quitting a job.
Return JSON array of strings.`;
}

export function RED_FLAGS_PROMPT(): string {
    return `Identify critical red flags in this startup idea based on low scores.
Return JSON array of strings (each 1-2 sentences).`;
}
