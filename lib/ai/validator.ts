import { generateTextWithFallback } from './models';
import {
    VALIDATION_PROMPTS,
    interpolatePrompt,
    COMPARABLE_COMPANIES_PROMPT,
    RECOMMENDATIONS_PROMPT,
    RED_FLAGS_PROMPT,
    THINKING_QUESTIONS_PROMPT,
    ACTION_PLAN_PROMPT,
    calculateOverallScore
} from './prompts';
import type { IdeaFormData, ValidationResult, DimensionScore, ActionPlan } from '@/types/validations';

/**
 * Helper function to extract JSON from markdown-wrapped responses
 * Some AI models return JSON wrapped in ```json ... ``` blocks or conversational text
 */
function extractJSON(text: string): string {
    let jsonString = text.trim();

    // 0. Strip common conversational prefixes that AI models add
    const conversationalPrefixes = [
        /^Here'?s?\s+(?:an?|the)\s+(?:evaluation|analysis|assessment|response|answer|output)[\s:,.]*/i,
        /^Here\s+is\s+(?:an?|the)\s+(?:evaluation|analysis|assessment|response|answer|output)[\s:,.]*/i,
        /^Based on\s+.*?[:,]\s*/i,
        /^Let me\s+.*?[:,]\s*/i,
        /^Certainly!/i,
        /^JSON Output:/i,
        /^I've evaluated/i,
    ];

    for (const prefix of conversationalPrefixes) {
        jsonString = jsonString.replace(prefix, '').trim();
    }

    // 1. Try to find markdown code block start
    const startMatch = jsonString.match(/```(?:json)?\s*/i);
    if (startMatch && startMatch.index !== undefined) {
        const headerLength = startMatch[0].length;
        const startIdx = startMatch.index;

        const contentStart = startIdx + headerLength;
        const rest = jsonString.substring(contentStart);

        // Look for closing block (use lastIndexOf to find the last fence if multiple exist,
        // effectively getting the widest block, or just standard regex logic.
        // Simple 'indexOf' is fine for the *next* block, but if we want to be safe against nested things...
        // Standard markdown blocks don't nest. indexOf is correct for "finding the end of THIS block".)
        const closeIdx = rest.indexOf('```');

        if (closeIdx !== -1) {
            return rest.substring(0, closeIdx).trim();
        } else {
            // No closing block found - assume truncated, return everything after header
            return rest.trim();
        }
    }

    // 2. Fallback: Finding the first [ or { and the last ] or }
    const firstOpenBrace = jsonString.indexOf('{');
    const firstOpenBracket = jsonString.indexOf('[');
    let startIndex = -1;

    if (firstOpenBrace !== -1 && firstOpenBracket !== -1) {
        startIndex = Math.min(firstOpenBrace, firstOpenBracket);
    } else if (firstOpenBrace !== -1) {
        startIndex = firstOpenBrace;
    } else {
        startIndex = firstOpenBracket;
    }

    if (startIndex !== -1) {
        const lastCloseBrace = jsonString.lastIndexOf('}');
        const lastCloseBracket = jsonString.lastIndexOf(']');
        const endIndex = Math.max(lastCloseBrace, lastCloseBracket);

        if (endIndex !== -1 && endIndex > startIndex) {
            return jsonString.substring(startIndex, endIndex + 1);
        } else {
            // Found start but no end - return from start to end of string (truncated json)
            return jsonString.substring(startIndex);
        }
    }

    // 3. No JSON structure found at all - return original text
    // The safeParseJSON function will handle this with regex fallback
    console.warn('⚠️ No JSON structure found in AI response, will attempt regex extraction');
    return jsonString;
}

/**
 * Helper function to parse JSON safely with robust fallback for truncated/conversational responses.
 */
function safeParseJSON(text: string, type: 'object' | 'array' = 'object'): unknown {
    const extracted = extractJSON(text);

    try {
        return JSON.parse(extracted);
    } catch (e) {
        console.warn('⚠️ JSON parse failed, attempting regex fallback:', (e as Error).message);
        console.warn('Raw text:', text.substring(0, 200) + '...');

        if (type === 'object') {
            // Fallback for DimensionScore: Look for "score": 8, Score: 8, rating: 8, etc.
            const scoreMatch = text.match(/(?:"score"|score|rating|rating)"?\s*[:=]\s*"?(\d+)"?/i);
            const reasoningMatch = text.match(/(?:"reasoning"|reasoning|explanation|analysis)"?\s*[:=]\s*"?((?:[^"]|\\")*)/i);
            const estimateMatch = text.match(/(?:"estimate"|estimate|timeline)"?\s*[:=]\s*"?((?:[^"]|\\")*)/i);
            const realPainCheckMatch = text.match(/(?:"realPainCheck"|realPainCheck|real_pain_check)"?\s*[:=]\s*"?((?:[^"]|\\")*)/i);

            if (scoreMatch) {
                let reasoning = 'Reasoning truncated due to model error.';
                if (reasoningMatch) {
                    reasoning = reasoningMatch[1].trim();
                    // Clean up trailing garbage from truncation
                    reasoning = reasoning.replace(/[,}\]]$/, '').trim();
                    if (reasoning.endsWith('"')) reasoning = reasoning.slice(0, -1);
                    if (reasoning.endsWith('\\')) reasoning = reasoning.slice(0, -1);
                }

                const result: Record<string, unknown> = {
                    score: parseInt(scoreMatch[1], 10),
                    reasoning: reasoning || 'Reasoning partially captured.',
                    _isFallback: true
                };

                // Add estimate if found
                if (estimateMatch) {
                    const estimate = estimateMatch[1].trim().replace(/[,}\]]$/, '').replace(/"$/, '').replace(/\\$/, '');
                    if (estimate) result.estimate = estimate;
                }

                // Add realPainCheck if found (for painkiller dimension)
                if (realPainCheckMatch) {
                    const realPainCheck = realPainCheckMatch[1].trim().replace(/[,}\]]$/, '').replace(/"$/, '').replace(/\\$/, '');
                    if (realPainCheck) result.realPainCheck = realPainCheck;
                }

                return result;
            }
        } else if (type === 'array') {
            // Try to repair truncated JSON by adding missing closing brackets
            let repairedJSON = extracted;

            // Count opening and closing braces/brackets
            const openBraces = (repairedJSON.match(/\{/g) || []).length;
            const closeBraces = (repairedJSON.match(/\}/g) || []).length;
            const openBrackets = (repairedJSON.match(/\[/g) || []).length;
            const closeBrackets = (repairedJSON.match(/\]/g) || []).length;

            // Add missing closing braces and brackets
            if (openBraces > closeBraces) {
                repairedJSON += '}'.repeat(openBraces - closeBraces);
            }
            if (openBrackets > closeBrackets) {
                repairedJSON += ']'.repeat(openBrackets - closeBrackets);
            }

            // Try parsing the repaired JSON
            try {
                const parsed = JSON.parse(repairedJSON);
                if (Array.isArray(parsed)) {
                    console.log('✅ Successfully repaired truncated JSON array');
                    return parsed;
                }
            } catch {
                console.warn('⚠️ JSON repair failed, falling back to regex extraction');
            }

            // Fallback for arrays (Red Flags, Comparables, Recommendations): Extract quoted strings
            // This regex matches "string"
            const matches = [...text.matchAll(/"([^"]+)"/g)].map(m => m[1]);
            if (matches.length > 0) {
                // Filter out common keys that might be misidentified as values if the object structure is messy
                const filtered = matches.filter(m => !['score', 'reasoning', 'estimate', 'json', 'realPainCheck', 'real_pain_check', 'name', 'outcome', 'similarity', 'keyLesson', 'linkIfAvailable', 'timeline', 'action', 'successMetric', 'whyThis'].includes(m.toLowerCase()));
                if (filtered.length > 0) return filtered;
            }
        }

        throw e; // Re-throw if fallback fails
    }
}

/**
 * Generates thinking questions for a specific dimension if the score is low.
 */
export async function generateThinkingQuestions(
    dimension: string,
    score: number,
    reasoning: string,
    ideaData: IdeaFormData
): Promise<string[]> {
    // Only generate questions if score needs improvement (< 7)
    if (score >= 7) return [];

    const prompt = interpolatePrompt(THINKING_QUESTIONS_PROMPT, {
        dimension: dimension,
        score: score.toString(),
        reasoning: reasoning,
        problem: ideaData.problem,
        targetCustomer: ideaData.targetCustomer,
        revenueModel: ideaData.revenueModel,
        distributionChannel: ideaData.distributionChannel,
    });

    try {
        const { text } = await generateTextWithFallback({
            prompt: prompt,
            temperature: 0.8, // Higher temperature for more creative questions
        });

        // Parse JSON response safely
        const parsed = safeParseJSON(text, 'array');

        // Validate it's an array of strings
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return [];
        }

        return (parsed as unknown[])
            .filter((q): q is string => typeof q === 'string')
            .slice(0, 2); // Max 2 questions per dimension

    } catch (error) {
        console.error(`Failed to generate thinking questions for ${dimension}:`, error);
        return []; // Don't block validation if question generation fails
    }
}

/**
 * Generates a personalized action plan for paid users.
 */
export async function generateActionPlan(
    validationResult: ValidationResult,
    ideaData: IdeaFormData
): Promise<ActionPlan | null> {
    const prompt = interpolatePrompt(ACTION_PLAN_PROMPT, {
        painkillerScore: validationResult.painkillerScore.score.toString(),
        painkillerReasoning: validationResult.painkillerScore.reasoning,
        revenueModelScore: validationResult.revenueModelScore.score.toString(),
        revenueModelReasoning: validationResult.revenueModelScore.reasoning,
        acquisitionScore: validationResult.acquisitionScore.score.toString(),
        acquisitionReasoning: validationResult.acquisitionScore.reasoning,
        moatScore: validationResult.moatScore.score.toString(),
        moatReasoning: validationResult.moatScore.reasoning,
        founderFitScore: validationResult.founderFitScore.score.toString(),
        founderFitReasoning: validationResult.founderFitScore.reasoning,
        timeToRevenueScore: validationResult.timeToRevenueScore.score.toString(),
        timeToRevenueReasoning: validationResult.timeToRevenueScore.reasoning,
        scalabilityScore: validationResult.scalabilityScore.score.toString(),
        scalabilityReasoning: validationResult.scalabilityScore.reasoning,
        overallScore: validationResult.overallScore.toString(),
        problem: ideaData.problem,
        targetCustomer: ideaData.targetCustomer,
        revenueModel: ideaData.revenueModel,
        distributionChannel: ideaData.distributionChannel,
        unfairAdvantage: ideaData.unfairAdvantage,
        timeCommitment: ideaData.timeCommitment,
    })

    try {
        const { text } = await generateTextWithFallback({
            prompt: prompt,
            temperature: 0.5, // Lower temp for more structured output
        })

        // Parse JSON response with safe fallback
        const actionPlan = safeParseJSON(text, 'object') as ActionPlan;

        // Validate structure
        if (!actionPlan || !actionPlan.priorities || !Array.isArray(actionPlan.priorities)) {
            throw new Error('Invalid action plan structure')
        }

        return actionPlan
    } catch (error) {
        console.error('Failed to generate action plan:', error)
        return null // Don't block validation if action plan generation fails
    }
}

/**
 * Main validation function that scores a startup idea across multiple dimensions
 * using AI-powered analysis.
 */
export async function validateIdea(
    ideaData: IdeaFormData,
    userTier: 'free' | 'pro' | 'premium' = 'free'
): Promise<{ validation: ValidationResult; modelUsed: string }> {
    const startTime = Date.now();
    console.log('🚀 Starting validation for:', ideaData.title);

    try {
        // Initialize result object
        const result: Partial<ValidationResult> = {};

        // Prepare data for interpolation
        const interpolationData: Record<string, string> = {
            problem: ideaData.problem,
            solution: ideaData.solution,
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
                });

                // Parse JSON response with safe fallback
                let parsed: Record<string, unknown>;
                try {
                    parsed = safeParseJSON(text, 'object') as Record<string, unknown>;
                } catch (error) {
                    console.error(`❌ Failed to parse response for ${dimension.key}. Raw text:`, text);
                    throw error;
                }

                // Store score and reasoning
                const dimensionScore: DimensionScore = {
                    score: (parsed.score as number) ?? 5,
                    reasoning: (parsed.reasoning as string) || 'No reasoning provided',
                };

                // Add additional fields for timeToRevenue if present
                if (dimension.key === 'timeToRevenue') {
                    if (parsed.estimate) {
                        (dimensionScore as Record<string, unknown>).estimate = parsed.estimate;
                    } else {
                        // Fallback extraction for estimate
                        const estimateMatch = text.match(/"estimate"\s*:\s*"([^"]*)/);
                        if (estimateMatch) {
                            (dimensionScore as Record<string, unknown>).estimate = estimateMatch[1] + (text.includes(`"${estimateMatch[1]}"`) ? '' : '...');
                        }
                    }
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
            painkiller: result.painkillerScore?.score ?? 5,
            revenueModel: result.revenueModelScore?.score ?? 5,
            acquisition: result.acquisitionScore?.score ?? 5,
            moat: result.moatScore?.score ?? 5,
            founderFit: result.founderFitScore?.score ?? 5,
            timeToRevenue: result.timeToRevenueScore?.score ?? 5,
            scalability: result.scalabilityScore?.score ?? 5,
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
                    maxOutputTokens: 1024,
                });

                const redFlags = safeParseJSON(redFlagsText, 'array');
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
                maxOutputTokens: 1200, // Increased to prevent truncation
            });

            const comparables = safeParseJSON(comparablesText, 'array');
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
                maxOutputTokens: 1024,
            });

            // The recommendations prompt might return an array of strings OR objects.
            // safeParseJSON('array') handles extracting quoted strings which works for both 
            // (if objects, it extracts values, which might be "Timeline: action" if that's how it's formatted, 
            // or separate keys. Let's stick effectively to string extraction for robustness).
            const recommendations = safeParseJSON(recommendationsText, 'array');

            if (Array.isArray(recommendations)) {
                // Check if it's an array of objects or strings based on first item
                // If it was objects, safeParseJSON 'array' regex might have grabbed keys and values as separate strings. 
                // BUT, validateIdea previously handled objects (timeline, action). 
                // If we want to support objects perfectly we need a more complex regex or just rely on 'object' parsing if possible.
                // Given the prompt asks for specific JSON structure, let's try to trust standard extract first.
                // safeParseJSON tries standard JSON.parse first. So if it's a valid array of objects, it works.
                // If it fails, our regex fallback extracts STRINGS. 
                // So we should map whatever we got to strings.

                result.recommendations = recommendations.map(rec => {
                    if (typeof rec === 'string') return rec;
                    // If it is an object (from successful JSON parse)
                    if (typeof rec === 'object' && rec !== null) {
                        return `${rec.timeline || ''}: ${rec.action || ''} (Success metric: ${rec.successMetric || ''})`;
                    }
                    return JSON.stringify(rec);
                });
            } else {
                result.recommendations = [];
            }
        } catch (error) {
            console.error('❌ Error generating recommendations:', error);
            result.recommendations = ['Unable to generate recommendations. Please review scores and take appropriate action.'];
        }

        // Generate thinking questions for dimensions that scored < 7
        console.log('🤔 Generating thinking questions...');
        const thinkingQuestions: Record<string, string[]> = {};

        const dimensionData = [
            { name: 'painkiller', score: scores.painkiller, reasoning: result.painkillerScore?.reasoning || '' },
            { name: 'revenueModel', score: scores.revenueModel, reasoning: result.revenueModelScore?.reasoning || '' },
            { name: 'acquisition', score: scores.acquisition, reasoning: result.acquisitionScore?.reasoning || '' },
            { name: 'moat', score: scores.moat, reasoning: result.moatScore?.reasoning || '' },
            { name: 'founderFit', score: scores.founderFit, reasoning: result.founderFitScore?.reasoning || '' },
            { name: 'timeToRevenue', score: scores.timeToRevenue, reasoning: result.timeToRevenueScore?.reasoning || '' },
            { name: 'scalability', score: scores.scalability, reasoning: result.scalabilityScore?.reasoning || '' },
        ];

        for (const dimension of dimensionData) {
            if (dimension.score < 7) {
                const questions = await generateThinkingQuestions(
                    dimension.name,
                    dimension.score,
                    dimension.reasoning,
                    ideaData
                );

                if (questions.length > 0) {
                    thinkingQuestions[dimension.name] = questions;
                }
            }
        }

        result.thinkingQuestions = thinkingQuestions;

        // Generate personalized action plan for paid users
        if (userTier === 'pro' || userTier === 'premium') {
            console.log('📋 Generating action plan...');
            const actionPlan = await generateActionPlan(result as ValidationResult, ideaData);
            result.actionPlan = actionPlan;
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
