import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { deepseek } from '@ai-sdk/deepseek';
import type { LanguageModel } from 'ai';
import type { z } from 'zod';

/**
 * Provider chain for reliability: tries each in order on rate limit or provider errors.
 * 1. Google Gemini 2.5 Flash Lite
 * 2. Google Gemini 2.5 Flash
 * 3. OpenRouter (google/gemini-2.5-flash)
 * 4. DeepSeek (deepseek-chat)
 */

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
});

type ModelEntry = {
    getModel: () => LanguageModel;
    modelId: string;
};

const FALLBACK_CHAIN: ModelEntry[] = [
    { getModel: () => google('gemini-2.5-flash-lite'), modelId: 'gemini-2.5-flash-lite' },
    { getModel: () => google('gemini-2.5-flash'), modelId: 'gemini-2.5-flash' },
    { getModel: () => openrouter('google/gemini-2.5-flash'), modelId: 'openrouter:google/gemini-2.5-flash' },
    { getModel: () => deepseek('deepseek-chat'), modelId: 'deepseek-chat' },
];

/**
 * Structured output chain — DeepSeek excluded as it is unreliable with strict JSON schemas.
 * 1. Google Gemini 2.5 Flash Lite
 * 2. Google Gemini 2.5 Flash
 * 3. OpenRouter (google/gemini-2.5-flash)
 */
const OBJECT_FALLBACK_CHAIN: ModelEntry[] = [
    { getModel: () => google('gemini-2.5-flash-lite'), modelId: 'gemini-2.5-flash-lite' },
    { getModel: () => google('gemini-2.5-flash'), modelId: 'gemini-2.5-flash' },
    { getModel: () => openrouter('google/gemini-2.5-flash'), modelId: 'openrouter:google/gemini-2.5-flash' },
];

function isRetryableError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return true;
    const m = (err as { message?: string; status?: number; statusCode?: number }).message?.toLowerCase() ?? '';
    const status = (err as { status?: number }).status ?? (err as { statusCode?: number }).statusCode;
    if (status === 429 || status === 503 || status === 500) return true;
    if (/rate|quota|limit|resource exhausted|429|503|overloaded/i.test(m)) return true;
    if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|fetch failed/i.test(m)) return true;
    return false;
}

export type GenerateTextOptions = {
    prompt: string;
    temperature?: number;
    maxOutputTokens?: number;
};

export type GenerateTextResult = {
    text: string;
    modelUsed: string;
};

/**
 * Calls generateText with the first model that succeeds.
 * On rate limit or retryable provider errors, tries the next in the chain.
 */
export async function generateTextWithFallback(options: GenerateTextOptions): Promise<GenerateTextResult> {
    const { prompt, temperature = 0.3, maxOutputTokens = 4096 } = options;
    let lastError: unknown;

    for (const { getModel, modelId } of FALLBACK_CHAIN) {
        try {
            const response = await generateText({
                model: getModel(),
                prompt,
                temperature,
                maxOutputTokens,
                providerOptions: {
                    google: {
                        thinkingConfig: {
                            thinkingBudget: 0,
                        },
                    },
                },
            });
            return { text: response.text, modelUsed: modelId };
        } catch (err) {
            lastError = err;
            if (!isRetryableError(err)) throw err;
            console.warn(`[models] ${modelId} failed (will try next):`, err instanceof Error ? err.message : err);
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error(String(lastError));
}

export type GenerateObjectOptions<T> = {
    schema: z.ZodType<T>;
    prompt: string;
};

export type GenerateObjectResult<T> = {
    object: T;
    modelUsed: string;
};

/**
 * Calls generateObject with the first model that succeeds.
 * On rate limit or retryable provider errors, tries the next in the chain.
 * DeepSeek is excluded — unreliable with strict Zod schemas.
 */
export async function generateObjectWithFallback<T>(
    options: GenerateObjectOptions<T>
): Promise<GenerateObjectResult<T>> {
    const { schema, prompt } = options;
    let lastError: unknown;

    for (const { getModel, modelId } of OBJECT_FALLBACK_CHAIN) {
        try {
            const response = await generateObject({
                model: getModel(),
                schema,
                prompt,
            });
            return { object: response.object as T, modelUsed: modelId };
        } catch (err) {
            lastError = err;
            if (!isRetryableError(err)) throw err;
            console.warn(`[models] ${modelId} failed (will try next):`, err instanceof Error ? err.message : err);
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error(String(lastError));
}
