/**
 * Test script for validation caching logic
 * Run with: npx tsx scripts/test-caching.ts
 */

import { isIdeaUnchanged } from '../lib/ai/validator';
import type { IdeaFormData } from '../types/validations';

const baseIdea: IdeaFormData = {
    title: 'Test Idea',
    problem: 'Some problem description that is long enough.',
    solution: 'A great solution to the problem.',
    targetCustomer: 'Target customers.',
    painkillerMoment: 'The moment of pain.',
    revenueModel: 'Subscription model.',
    unfairAdvantage: 'Secret sauce.',
    distributionChannel: 'Social media.',
    timeCommitment: 'full_time',
};

function runCacheTests() {
    console.log('='.repeat(80));
    console.log('🧪 TESTING VALIDATION CACHING LOGIC');
    console.log('='.repeat(80));

    // Test 1: Identical content
    const identicalIdea = { ...baseIdea };
    const test1 = isIdeaUnchanged(baseIdea, identicalIdea);
    console.log(`Test 1 (Identical): ${test1 ? '✅ PASS' : '❌ FAIL'}`);

    // Test 2: Identical content with extra whitespace
    const whitespaceIdea = { ...baseIdea, title: '  Test Idea  ', problem: 'Some problem description that is long enough.\n' };
    const test2 = isIdeaUnchanged(baseIdea, whitespaceIdea);
    console.log(`Test 2 (Whitespace): ${test2 ? '✅ PASS' : '❌ FAIL'} (Should ignore whitespace)`);

    // Test 3: Minor change in text
    const minorChangeIdea = { ...baseIdea, title: 'Test Idea.' }; // Added a dot
    const test3 = isIdeaUnchanged(baseIdea, minorChangeIdea);
    console.log(`Test 3 (Minor Change): ${!test3 ? '✅ PASS' : '❌ FAIL'} (Should detect change)`);

    // Test 4: Different enum value
    const enumChangeIdea = { ...baseIdea, timeCommitment: 'part_time' as any };
    const test4 = isIdeaUnchanged(baseIdea, enumChangeIdea);
    console.log(`Test 4 (Enum Change): ${!test4 ? '✅ PASS' : '❌ FAIL'} (Should detect change)`);

    // Test 5: Missing snapshot
    const test5 = isIdeaUnchanged(baseIdea, undefined as any);
    console.log(`Test 5 (Missing Snapshot): ${!test5 ? '✅ PASS' : '❌ FAIL'} (Should return false)`);

    // Test 6: Case sensitivity (Current implementation is case-sensitive)
    const caseChangeIdea = { ...baseIdea, title: 'test idea' };
    const test6 = isIdeaUnchanged(baseIdea, caseChangeIdea);
    console.log(`Test 6 (Case Change): ${!test6 ? '✅ PASS (Case Sensitive)' : '❌ FAIL'} (Detected as change: ${!test6})`);

    console.log('='.repeat(80));
    console.log('✨ ALL CACHING UNIT TESTS COMPLETED');
    console.log('='.repeat(80));

    if (test1 && test2 && !test3 && !test4 && !test5 && !test6) {
        console.log('\n🎉 Logic is working exactly as expected!');
    } else {
        console.log('\n⚠️ Some logic checks failed. Please review implementation.');
        process.exit(1);
    }
}

runCacheTests();
