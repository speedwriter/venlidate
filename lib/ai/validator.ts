import { generateTextWithFallback } from './models';
import {
    VALIDATION_PROMPTS,
    interpolatePrompt,
    COMPARABLE_COMPANIES_PROMPT,
    RECOMMENDATIONS_PROMPT,
    RED_FLAGS_PROMPT,
    calculateOverallScore,
    getScoreRating
} from './prompts';
import type { IdeaFormData, ValidationResult, DimensionScore } from '@/types/validations';

/**
 * Helper function to extract JSON from markdown-wrapped responses
 * Some AI models return JSON wrapped in ```json ... ``` blocks
 */
function extractJSON(text: string): string {
    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }
    return text.trim();
}

/**
 * Main validation function that scores a startup idea across multiple dimensions
 * using AI-powered analysis.
 */
export async function validateIdea(ideaData: IdeaFormData): Promise<{ validation: ValidationResult; modelUsed: string }> {
    const startTime = Date.now();
    console.log('🚀 Starting validation for:', ideaData.title);

    try {
        // Initialize result object
        const result: Partial<ValidationResult> = {};

        // Prepare data for interpolation
        const interpolationData: Record<string, string> = {
            problem: ideaData.problem,
            targetCustomer: ideaData.targetCustomer,
            painkillerMoment: ideaData.painkillerMoment,
            revenueModel: ideaData.revenueModel,
            unfairAdvantage: ideaData.unfairAdvantage,
            distributionChannel: ideaData.distributionChannel,
            timeCommitment: ideaData.timeCommitment,
        };

        // Define dimensions to validate
        const dimensions = [
            { key: 'painkiller', resultKey: 'painkillerScore' },
            { key: 'revenueModel', resultKey: 'revenueModelScore' },
            { key: 'acquisition', resultKey: 'acquisitionScore' },
            { key: 'moat', resultKey: 'moatScore' },
            { key: 'founderFit', resultKey: 'founderFitScore' },
            { key: 'timeToRevenue', resultKey: 'timeToRevenueScore' },
            { key: 'scalability', resultKey: 'scalabilityScore' },
        ] as const;

        // Validate each dimension
        for (const dimension of dimensions) {
            console.log(`📊 Evaluating ${dimension.key}...`);

            try {
                // Get prompt template and interpolate
                const promptTemplate = VALIDATION_PROMPTS[dimension.key];
                const prompt = interpolatePrompt(promptTemplate, interpolationData);

                // Call AI model (with fallback across Gemini, OpenRouter, DeepSeek)
                const { text, modelUsed } = await generateTextWithFallback({
                    prompt,
                    temperature: 0.3, // Lower temperature for consistency
                    maxOutputTokens: 500,
                });

                // Parse JSON response
                const parsed = JSON.parse(extractJSON(text));

                // Store score and reasoning
                const dimensionScore: DimensionScore = {
                    score: parsed.score || 5,
                    reasoning: parsed.reasoning || 'No reasoning provided',
                };

                // Add additional fields for timeToRevenue if present
                if (dimension.key === 'timeToRevenue' && parsed.estimate) {
                    (dimensionScore as any).estimate = parsed.estimate;
                }

                result[dimension.resultKey] = dimensionScore;
                (result as { _modelUsed?: string })._modelUsed ??= modelUsed;

                console.log(`✅ ${dimension.key}: ${dimensionScore.score}/10`);
            } catch (error) {
                console.error(`❌ Error evaluating ${dimension.key}:`, error);

                // Use fallback values on error
                result[dimension.resultKey] = {
                    score: 5,
                    reasoning: `Unable to evaluate ${dimension.key} due to an error. Please try again.`,
                };
            }
        }

        // Extract numeric scores for calculations
        const scores = {
            painkiller: result.painkillerScore?.score || 5,
            revenueModel: result.revenueModelScore?.score || 5,
            acquisition: result.acquisitionScore?.score || 5,
            moat: result.moatScore?.score || 5,
            founderFit: result.founderFitScore?.score || 5,
            timeToRevenue: result.timeToRevenueScore?.score || 5,
            scalability: result.scalabilityScore?.score || 5,
        };

        // Calculate overall score using weighted formula
        console.log('🧮 Calculating overall score...');
        const overallScore = calculateOverallScore(scores);
        result.overallScore = overallScore;

        // Determine traffic light
        let trafficLight: 'red' | 'yellow' | 'green';
        if (overallScore >= 70) {
            trafficLight = 'green';
        } else if (overallScore >= 41) {
            trafficLight = 'yellow';
        } else {
            trafficLight = 'red';
        }
        result.trafficLight = trafficLight;

        console.log(`🚦 Overall Score: ${overallScore}/100 (${trafficLight.toUpperCase()})`);

        // Generate red flags if any score is critically low
        const hasLowScores = Object.values(scores).some(score => score < 5);
        if (hasLowScores) {
            console.log('🚩 Generating red flags...');
            try {
                const redFlagsPrompt = RED_FLAGS_PROMPT(scores);
                const { text: redFlagsText } = await generateTextWithFallback({
                    prompt: redFlagsPrompt,
                    temperature: 0.3,
                    maxOutputTokens: 500,
                });

                const redFlags = JSON.parse(extractJSON(redFlagsText));
                result.redFlags = Array.isArray(redFlags) ? redFlags : [];
            } catch (error) {
                console.error('❌ Error generating red flags:', error);
                result.redFlags = ['Unable to generate red flags. Please review low scores manually.'];
            }
        } else {
            result.redFlags = [];
        }

        // Generate comparable companies
        console.log('🏢 Finding comparable companies...');
        try {
            const comparablesPrompt = COMPARABLE_COMPANIES_PROMPT(interpolationData);
            const { text: comparablesText } = await generateTextWithFallback({
                prompt: comparablesPrompt,
                temperature: 0.5, // Slightly higher for creativity
                maxOutputTokens: 800,
            });

            const comparables = JSON.parse(extractJSON(comparablesText));
            result.comparableCompanies = Array.isArray(comparables) ? comparables : [];
        } catch (error) {
            console.error('❌ Error generating comparable companies:', error);
            result.comparableCompanies = [];
        }

        // Generate recommendations
        console.log('💡 Generating recommendations...');
        try {
            const recommendationsPrompt = RECOMMENDATIONS_PROMPT(scores, interpolationData);
            const { text: recommendationsText } = await generateTextWithFallback({
                prompt: recommendationsPrompt,
                temperature: 0.4,
                maxOutputTokens: 800,
            });

            const recommendations = JSON.parse(extractJSON(recommendationsText));

            // Convert recommendation objects to strings if needed
            if (Array.isArray(recommendations)) {
                result.recommendations = recommendations.map(rec => {
                    if (typeof rec === 'string') return rec;
                    return `${rec.timeline}: ${rec.action} (Success metric: ${rec.successMetric})`;
                });
            } else {
                result.recommendations = [];
            }
        } catch (error) {
            console.error('❌ Error generating recommendations:', error);
            result.recommendations = ['Unable to generate recommendations. Please review scores and take appropriate action.'];
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`✨ Validation complete in ${duration}s`);

        const modelUsed = (result as { _modelUsed?: string })._modelUsed ?? 'gemini-2.5-flash-lite';
        delete (result as { _modelUsed?: string })._modelUsed;
        return { validation: result as ValidationResult, modelUsed };

    } catch (error) {
        console.error('💥 Catastrophic validation error:', error);
        throw new Error(
            'Failed to validate idea. Please check your API configuration and try again. ' +
            (error instanceof Error ? error.message : 'Unknown error')
        );
    }
}
