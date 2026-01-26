# AI Validation Engine

## Overview

The AI validation engine evaluates startup ideas across 7 critical dimensions using a diversified AI provider chain. It provides comprehensive scoring, red flags, comparable companies, and actionable recommendations. On rate limits or provider errors, it automatically falls back through: **Gemini 2.5 Flash Lite** → **Gemini 2.5 Flash** → **OpenRouter** (google/gemini-2.5-flash) → **DeepSeek** (deepseek-chat).

## Files

- **`lib/ai/validator.ts`** - Main validation engine
- **`lib/ai/prompts.ts`** - AI prompts and scoring logic
- **`scripts/test-validator.ts`** - Test script with sample data
- **`types/validations.ts`** - TypeScript type definitions

## Setup

### 1. Configure API Keys

Add to `.env.local`:

**Required (primary):**
```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```
- [Google AI Studio](https://aistudio.google.com/app/apikey)

**Optional (fallbacks when Gemini is rate limited):**
```bash
OPENROUTER_API_KEY=your_openrouter_key_here   # OpenRouter (3rd fallback)
DEEPSEEK_API_KEY=your_deepseek_key_here      # DeepSeek (4th fallback)
```
- [OpenRouter](https://openrouter.ai/keys) · [DeepSeek](https://platform.deepseek.com/api_keys)

### 2. Install Dependencies

Dependencies are already installed via `package.json`:
- `ai` - Vercel AI SDK
- `@ai-sdk/google` - Google Gemini
- `@openrouter/ai-sdk-provider` - OpenRouter (fallback)
- `@ai-sdk/deepseek` - DeepSeek (fallback)

## Usage

### Basic Usage

```typescript
import { validateIdea } from '@/lib/ai/validator';
import type { IdeaFormData } from '@/types/validations';

const ideaData: IdeaFormData = {
    title: 'Your Startup Idea',
    problem: 'The problem you are solving',
    targetCustomer: 'Who is your target customer',
    painkillerMoment: 'When does the pain become acute',
    revenueModel: 'How will you make money',
    unfairAdvantage: 'What is your unique advantage',
    distributionChannel: 'How will you acquire customers',
    timeCommitment: 'full_time' // or 'part_time' or 'nights_weekends'
};

const { validation, modelUsed } = await validateIdea(ideaData);

console.log('Overall Score:', validation.overallScore);
console.log('Traffic Light:', validation.trafficLight);
console.log('Model used:', modelUsed);
```

### Running the Test Script

```bash
npx tsx scripts/test-validator.ts
```

This will:
1. Validate a sample startup idea
2. Display all dimension scores with reasoning
3. Show red flags, comparable companies, and recommendations
4. Verify the result structure

## Validation Dimensions

The engine evaluates 7 dimensions:

1. **Painkiller** (0-10) - Is this solving real, acute pain?
2. **Revenue Model** (0-10) - Is the pricing realistic and viable?
3. **Acquisition** (0-10) - Can you actually get customers?
4. **Moat** (0-10) - What prevents competitors from copying?
5. **Founder Fit** (0-10) - Does your background match this problem?
6. **Time to Revenue** (0-10) - How long until $10K MRR?
7. **Scalability** (0-10) - Can this grow without linear effort?

## Overall Score Calculation

The overall score (0-100) uses weighted dimensions:

```
Overall Score = (
  painkiller × 0.25 +
  acquisition × 0.20 +
  founderFit × 0.15 +
  revenueModel × 0.15 +
  timeToRevenue × 0.10 +
  scalability × 0.10 +
  moat × 0.05
) × 10
```

### Traffic Light System

- **🟢 Green (70-100)**: Strong opportunity, proceed with execution
- **🟡 Yellow (41-69)**: Proceed with caution, address critical issues
- **🔴 Red (0-40)**: High risk, fundamental flaws detected

## Result Structure

```typescript
type ValidationResult = {
    // Dimension scores
    painkillerScore: { score: number; reasoning: string }
    revenueModelScore: { score: number; reasoning: string }
    acquisitionScore: { score: number; reasoning: string }
    moatScore: { score: number; reasoning: string }
    founderFitScore: { score: number; reasoning: string }
    timeToRevenueScore: { score: number; reasoning: string; estimate?: string }
    scalabilityScore: { score: number; reasoning: string }
    
    // Overall assessment
    overallScore: number // 0-100
    trafficLight: 'red' | 'yellow' | 'green'
    
    // Additional insights
    redFlags: string[]
    comparableCompanies: Array<{
        name: string
        outcome: 'success' | 'failure'
        similarity: string
    }>
    recommendations: string[]
}
```

## Error Handling

The validator includes comprehensive error handling:

1. **Individual dimension failures**: Falls back to score of 5 with generic reasoning
2. **API failures**: Gracefully degrades with fallback values
3. **Catastrophic errors**: Throws user-friendly error message
4. **Logging**: Detailed console logs for debugging

## AI Model Configuration

**Fallback chain (in order):**
1. **gemini-2.5-flash-lite** (Google)
2. **gemini-2.5-flash** (Google)
3. **openrouter:google/gemini-2.5-flash** (OpenRouter)
4. **deepseek-chat** (DeepSeek)

On 429/503 or retryable errors, the next provider is used automatically. The `model_used` stored per validation reflects the first successful model for that run.

- **Temperature**: 0.3 (for consistency in scoring)
- **Max Tokens**: 500 per dimension, 800 for comparables/recommendations

## Performance

Typical validation time: **15-30 seconds**
- 7 dimension evaluations (parallel potential)
- Red flags generation (if needed)
- Comparable companies search
- Recommendations generation

## Next Steps

1. **Add API key** to `.env.local`
2. **Run test script** to verify setup
3. **Integrate into your app** using the `validateIdea` function
4. **Monitor logs** for debugging and optimization

## Troubleshooting

### "API key is missing" / rate limit errors
- Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
- For reliability, add `OPENROUTER_API_KEY` and `DEEPSEEK_API_KEY` so the validator can fall back when Gemini is rate limited
- Restart your dev server after adding keys

### "Failed to parse JSON" error
- The AI occasionally returns malformed JSON
- The validator will retry or use fallback values
- Check console logs for details

### Slow validation times
- Normal for first run (cold start)
- Consider implementing caching for repeated validations
- Parallel API calls could reduce total time

## Future Enhancements

- [ ] Parallel dimension evaluation for faster results
- [ ] Caching layer for repeated validations
- [ ] Streaming responses for real-time feedback
