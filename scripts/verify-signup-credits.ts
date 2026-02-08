/**
 * Verification Script for Signup Credits Logic
 * This script simulates the Supabase trigger logic in TypeScript.
 */

const EXPIRY_DATE = new Date('2026-03-15T00:00:00Z');

function calculateInitialCredits(currentDate: Date): number {
    if (currentDate < EXPIRY_DATE) {
        return 5;
    }
    return 0;
}

console.log('🧪 Verifying Signup Credits Logic');

// Scenario 1: Current date (Feb 2026)
const now = new Date('2026-02-09T00:33:00Z');
const creditsNow = calculateInitialCredits(now);
console.log(`\nScenario 1: Date is ${now.toISOString()}`);
console.log(`Credits allocated: ${creditsNow} (Expected: 5)`);
if (creditsNow === 5) console.log('✅ PASS'); else console.error('❌ FAIL');

// Scenario 2: Just before deadline
const justBefore = new Date('2026-03-14T23:59:59Z');
const creditsBefore = calculateInitialCredits(justBefore);
console.log(`\nScenario 2: Date is ${justBefore.toISOString()}`);
console.log(`Credits allocated: ${creditsBefore} (Expected: 5)`);
if (creditsBefore === 5) console.log('✅ PASS'); else console.error('❌ FAIL');

// Scenario 3: After deadline
const after = new Date('2026-03-16T00:00:00Z');
const creditsAfter = calculateInitialCredits(after);
console.log(`\nScenario 3: Date is ${after.toISOString()}`);
console.log(`Credits allocated: ${creditsAfter} (Expected: 0)`);
if (creditsAfter === 0) console.log('✅ PASS'); else console.error('❌ FAIL');

console.log('\nLogic verification complete.');
