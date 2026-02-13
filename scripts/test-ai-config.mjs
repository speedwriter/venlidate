import dotenv from 'dotenv';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { deepseek } from '@ai-sdk/deepseek';

dotenv.config({ path: '.env.local' });

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
});

const models = [
    { name: 'Google Gemini 2.5 Flash Lite', getModel: () => google('gemini-2.5-flash-lite'), id: 'gemini-2.5-flash-lite' },
    { name: 'Google Gemini 2.0 Flash', getModel: () => google('gemini-2.0-flash'), id: 'gemini-2.0-flash' },
    { name: 'OpenRouter Gemini 2.5 Flash', getModel: () => openrouter('google/gemini-2.5-flash'), id: 'openrouter:google/gemini-2.5-flash' },
    { name: 'OpenRouter Gemini 2.0 Flash', getModel: () => openrouter('google/gemini-2.0-flash-001'), id: 'openrouter:google/gemini-2.0-flash-001' },
    { name: 'DeepSeek Chat', getModel: () => deepseek('deepseek-chat'), id: 'deepseek-chat' },
];

async function testModel(modelEntry) {
    console.log(`\n--- Testing: ${modelEntry.name} ---`);
    try {
        const start = Date.now();
        const response = await generateText({
            model: modelEntry.getModel(),
            prompt: 'Respond with "Hello context: [your model name]" in 10 words or less.',
            temperature: 0.3,
        });
        const duration = Date.now() - start;
        console.log(`✅ Success (${duration}ms)`);
        console.log(`💬 Response: ${response.text}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed: ${err.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting AI Integration Tests...');

    const results = [];
    for (const model of models) {
        const success = await testModel(model);
        results.push({ name: model.name, success });
    }

    console.log('\n=== Summary ===');
    results.forEach(r => {
        console.log(`${r.success ? '✅' : '❌'} ${r.name}`);
    });

    const anyFailed = results.some(r => !r.success);
    if (anyFailed) {
        process.exit(1);
    }
}

runTests();
