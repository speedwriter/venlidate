import dotenv from 'dotenv';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

dotenv.config({ path: '.env.local' });

// Mocking the behavior of the FALLBACK_CHAIN
const FALLBACK_CHAIN = [
    { name: 'Fake Failing Model', getModel: () => google('non-existent-model'), id: 'fake-fail' },
    { name: 'Working Google Model', getModel: () => google('gemini-2.5-flash-lite'), id: 'google:gemini-2.5' },
];

function isRetryableError(err) {
    if (!err || typeof err !== 'object') return true;
    const m = err.message?.toLowerCase() ?? '';
    const status = err.status ?? err.statusCode;
    if (status === 429 || status === 503 || status === 500) return true;
    if (/rate|quota|limit|resource exhausted|429|503|overloaded|not found/i.test(m)) return true;
    return false;
}

async function generateTextWithFallback(prompt) {
    let lastError;
    for (const { getModel, id } of FALLBACK_CHAIN) {
        try {
            console.log(`📡 Attempting: ${id}...`);
            const response = await generateText({
                model: getModel(),
                prompt,
                temperature: 0.3,
            });
            console.log(`✅ Success with: ${id}`);
            return { text: response.text, modelUsed: id };
        } catch (err) {
            lastError = err;
            if (!isRetryableError(err)) {
                console.error(`💥 Non-retryable error with ${id}: ${err.message}`);
                throw err;
            }
            console.warn(`⚠️  ${id} failed: ${err.message.substring(0, 100)}...`);
            console.log('🔄 Retrying with next model in chain...');
        }
    }
    throw lastError;
}

async function runTest() {
    console.log('🚀 Testing Fallback Logic (Mock failure on first model)');
    try {
        const result = await generateTextWithFallback('Say "Fallback worked"');
        console.log('\n✨ Final Result:', result);
    } catch (err) {
        console.error('\n❌ Fallback failed:', err.message);
    }
}

runTest();
