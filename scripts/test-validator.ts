/**
 * Test script for the AI validation engine
 * 
 * Run with: npx tsx scripts/test-validator.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { validateIdea } from '../lib/ai/validator';
import type { IdeaFormData } from '../types/validations';

// Sample test data
const sampleIdea: IdeaFormData = {
    title: 'AI-Powered Code Review Assistant',
    problem: 'Software teams waste 5-10 hours per week on manual code reviews, missing critical bugs and security issues',
    solution: 'An AI-powered GitHub/GitLab integration that uses LLMs to automatically review code for bugs, security vulnerabilities, and style issues, providing actionable feedback within the PR UI.',
    targetCustomer: 'Engineering teams at Series A-C startups (10-50 developers)',
    painkillerMoment: 'When a critical security vulnerability slips through code review and causes a production incident',
    revenueModel: 'SaaS subscription: $99/developer/month with annual contracts',
    unfairAdvantage: 'Former Google engineer who built internal code review tools, deep expertise in static analysis and ML',
    distributionChannel: 'Direct outreach to CTOs in my network (500+ LinkedIn connections), developer communities, and content marketing',
    timeCommitment: 'full_time',
};

async function runTest() {
    console.log('='.repeat(80));
    console.log('🧪 TESTING AI VALIDATION ENGINE');
    console.log('='.repeat(80));
    console.log('\n📋 Test Idea:');
    console.log(`Title: ${sampleIdea.title}`);
    console.log(`Problem: ${sampleIdea.problem}`);
    console.log(`Target Customer: ${sampleIdea.targetCustomer}`);
    console.log('\n');

    try {
        const { validation: result, modelUsed } = await validateIdea(sampleIdea);

        console.log('\n' + '='.repeat(80));
        console.log('📊 VALIDATION RESULTS');
        console.log('='.repeat(80));
        console.log(`\n🤖 Model used: ${modelUsed}\n`);

        console.log('🎯 DIMENSION SCORES:');
        console.log(`  Painkiller: ${result.painkillerScore.score}/10`);
        console.log(`    → ${result.painkillerScore.reasoning}`);

        console.log(`\n  Revenue Model: ${result.revenueModelScore.score}/10`);
        console.log(`    → ${result.revenueModelScore.reasoning}`);

        console.log(`\n  Acquisition: ${result.acquisitionScore.score}/10`);
        console.log(`    → ${result.acquisitionScore.reasoning}`);

        console.log(`\n  Moat: ${result.moatScore.score}/10`);
        console.log(`    → ${result.moatScore.reasoning}`);

        console.log(`\n  Founder Fit: ${result.founderFitScore.score}/10`);
        console.log(`    → ${result.founderFitScore.reasoning}`);

        console.log(`\n  Time to Revenue: ${result.timeToRevenueScore.score}/10`);
        console.log(`    → ${result.timeToRevenueScore.reasoning}`);
        if ((result.timeToRevenueScore as unknown as { estimate?: string }).estimate) {
            console.log(`    ⏱️  Estimate: ${(result.timeToRevenueScore as unknown as { estimate?: string }).estimate}`);
        }

        console.log(`\n  Scalability: ${result.scalabilityScore.score}/10`);
        console.log(`    → ${result.scalabilityScore.reasoning}`);

        console.log('\n🎲 OVERALL ASSESSMENT:');
        console.log(`  Score: ${result.overallScore}/100`);
        console.log(`  Traffic Light: ${result.trafficLight.toUpperCase()}`);

        if (result.redFlags.length > 0) {
            console.log('\n🚩 RED FLAGS:');
            result.redFlags.forEach((flag, i) => {
                console.log(`  ${i + 1}. ${flag}`);
            });
        }

        if (result.comparableCompanies.length > 0) {
            console.log('\n🏢 COMPARABLE COMPANIES:');
            result.comparableCompanies.forEach((company, i) => {
                console.log(`  ${i + 1}. ${company.name} (${company.situation})`);
                console.log(`     Similarity: ${company.similarity}`);
            });
        }

        if (result.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            result.recommendations.forEach((rec, i) => {
                console.log(`  ${i + 1}. ${rec}`);
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ TEST COMPLETED SUCCESSFULLY');
        console.log('='.repeat(80));

        // Verify structure
        console.log('\n🔍 STRUCTURE VALIDATION:');
        const checks = [
            { name: 'painkillerScore exists', pass: !!result.painkillerScore },
            { name: 'revenueModelScore exists', pass: !!result.revenueModelScore },
            { name: 'acquisitionScore exists', pass: !!result.acquisitionScore },
            { name: 'moatScore exists', pass: !!result.moatScore },
            { name: 'founderFitScore exists', pass: !!result.founderFitScore },
            { name: 'timeToRevenueScore exists', pass: !!result.timeToRevenueScore },
            { name: 'scalabilityScore exists', pass: !!result.scalabilityScore },
            { name: 'overallScore is number', pass: typeof result.overallScore === 'number' },
            { name: 'overallScore in range', pass: result.overallScore >= 0 && result.overallScore <= 100 },
            { name: 'trafficLight is valid', pass: ['red', 'yellow', 'green'].includes(result.trafficLight) },
            { name: 'redFlags is array', pass: Array.isArray(result.redFlags) },
            { name: 'comparableCompanies is array', pass: Array.isArray(result.comparableCompanies) },
            { name: 'recommendations is array', pass: Array.isArray(result.recommendations) },
        ];

        checks.forEach(check => {
            console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
        });

        const allPassed = checks.every(c => c.pass);
        if (allPassed) {
            console.log('\n🎉 All structure checks passed!');
        } else {
            console.log('\n⚠️  Some structure checks failed!');
        }

    } catch (error) {
        console.error('\n💥 TEST FAILED:');
        console.error(error);
        process.exit(1);
    }
}

// Run the test
runTest();
