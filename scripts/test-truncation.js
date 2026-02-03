
function safeParseJSON(text, type = 'object') {
    // Mocking extractJSON behavior for this test
    let extracted = text.trim();
    if (extracted.includes('```json')) {
        extracted = extracted.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    try {
        return JSON.parse(extracted);
    } catch (e) {
        if (type === 'object') {
            const scoreMatch = text.match(/(?:"score"|score|rating|rating)"?\s*[:=]\s*"?(\d+)"?/i);
            const reasoningMatch = text.match(/(?:"reasoning"|reasoning|explanation|analysis)"?\s*[:=]\s*"?((?:[^"]|\\")*)/i);
            const estimateMatch = text.match(/(?:"estimate"|estimate|timeline)"?\s*[:=]\s*"?((?:[^"]|\\")*)/i);
            const realPainCheckMatch = text.match(/(?:"realPainCheck"|realPainCheck|real_pain_check)"?\s*[:=]\s*"?((?:[^"]|\\")*)/i);

            if (scoreMatch) {
                let reasoning = 'Reasoning truncated due to model error.';
                if (reasoningMatch) {
                    reasoning = reasoningMatch[1].trim();
                    reasoning = reasoning.replace(/[,}\]]$/, '').trim();
                    if (reasoning.endsWith('"')) reasoning = reasoning.slice(0, -1);
                    if (reasoning.endsWith('\\')) reasoning = reasoning.slice(0, -1);
                }

                const result = {
                    score: parseInt(scoreMatch[1], 10),
                    reasoning: reasoning || 'Reasoning partially captured.',
                    _isFallback: true
                };

                if (estimateMatch) {
                    let estimate = estimateMatch[1].trim().replace(/[,}\]]$/, '').replace(/"$/, '').replace(/\\$/, '');
                    if (estimate) result.estimate = estimate;
                }

                if (realPainCheckMatch) {
                    let realPainCheck = realPainCheckMatch[1].trim().replace(/[,}\]]$/, '').replace(/"$/, '').replace(/\\$/, '');
                    if (realPainCheck) result.realPainCheck = realPainCheck;
                }

                return result;
            }
        }
        throw e;
    }
}

const input = '```json\n{\n  "score": 0,\n  "reasoning": "The...';
console.log('Testing input:', input);

try {
    const result = safeParseJSON(input);
    console.log('Result:', JSON.stringify(result, null, 2));
    if (result.score === 0 && result.reasoning === "The...") {
        console.log('✅ Passed: Successfully extracted partial reasoning.');
    } else {
        console.log('❌ Failed: Extraction logic did not capture "The...".');
    }
} catch (e) {
    console.error('❌ Error during parsing:', e.message);
}
