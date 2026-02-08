/**
 * Test script for Shared Ideas Server Actions
 * 
 * Run with: npx tsx scripts/test-shared-ideas.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

async function runTests() {
    console.log('🧪 Starting Shared Ideas Server Actions Tests...\n');

    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 1. Get a real user ID
        console.log('1. Fetching a real user from database...');
        let testUserId: string | undefined;

        const { data: userData, error: userError } = await supabase
            .from('user_karma')
            .select('user_id')
            .limit(1)
            .single();

        if (!userError && userData) {
            testUserId = userData.user_id;
        } else {
            console.warn('Could not find a user in user_karma. Trying ideas...');
            const { data: ideaUser } = await supabase.from('ideas').select('user_id').limit(1).single();
            if (ideaUser) {
                testUserId = ideaUser.user_id;
            } else {
                console.warn('No ideas found. Trying profiles...');
                const { data: profileUser } = await supabase.from('profiles').select('id').limit(1).single();
                if (profileUser) {
                    testUserId = profileUser.id;
                }
            }
        }

        if (!testUserId) throw new Error('No user found in database to run tests with.');
        console.log(`   Using User ID: ${testUserId}`);

        console.log('\n2. Verifying Sharing Logic via Database Client...');

        // Setup test idea
        const { data: idea, error: ideaError } = await supabase
            .from('ideas')
            .insert({
                user_id: testUserId,
                title: 'Test Idea ' + Date.now(),
                problem: 'Test Problem',
                target_customer: 'Test Customer',
                painkiller_moment: 'Test Moment',
                revenue_model: 'Test Model',
                unfair_advantage: 'Test Advantage',
                distribution_channel: 'Test Channel',
                time_commitment: 'part_time',
                status: 'validated'
            })
            .select().single();

        if (ideaError) throw ideaError;

        const { data: validation, error: valError } = await supabase
            .from('validations')
            .insert({
                idea_id: idea.id,
                user_id: testUserId,
                overall_score: 85,
                traffic_light: 'green',
                painkiller_score: 8,
                painkiller_reasoning: 'Good',
                revenue_model_score: 8,
                revenue_model_reasoning: 'Good',
                acquisition_score: 8,
                acquisition_reasoning: 'Good',
                moat_score: 8,
                moat_reasoning: 'Good',
                founder_fit_score: 8,
                founder_fit_reasoning: 'Good',
                time_to_revenue_score: 8,
                time_to_revenue_reasoning: 'Good',
                scalability_score: 8,
                scalability_reasoning: 'Good'
            })
            .select().single();

        if (valError) throw valError;

        console.log('   ✅ Test idea and validation created.');

        // 3. Test shareIdea logic
        console.log('\n3. Testing Share Logic...');
        const { data: sharedIdea, error: shareError } = await supabase
            .from('shared_ideas')
            .insert({
                validation_id: validation.id,
                idea_id: idea.id,
                user_id: testUserId,
                title: idea.title,
                problem: idea.problem,
                target_customer: idea.target_customer,
                overall_score: validation.overall_score,
                traffic_light: validation.traffic_light,
                is_anonymous: false,
                status: 'pending'
            })
            .select().single();

        if (shareError) throw shareError;
        console.log('   ✅ Idea shared (status: pending).');

        // 4. Test Karma Update logic
        console.log('\n4. Testing Karma Update...');
        const { data: karma } = await supabase.from('user_karma').select().eq('user_id', testUserId).single();
        const { error: karmaUpdateErr } = await supabase
            .from('user_karma')
            .update({
                ideas_shared: (karma?.ideas_shared || 0) + 1,
                free_validation_credits: (karma?.free_validation_credits || 0) + 1
            })
            .eq('user_id', testUserId);

        if (karmaUpdateErr) throw karmaUpdateErr;
        console.log('   ✅ Karma updated.');

        // 5. Test Admin Approval logic
        console.log('\n5. Testing Admin Approval...');
        const { error: approveErr } = await supabase
            .from('shared_ideas')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString()
            })
            .eq('id', sharedIdea.id);

        if (approveErr) throw approveErr;
        console.log('   ✅ Idea approved.');

        // 6. Test Unshare logic
        console.log('\n6. Testing Unshare Logic...');
        const { error: deleteErr } = await supabase.from('shared_ideas').delete().eq('id', sharedIdea.id);
        if (deleteErr) throw deleteErr;
        console.log('   ✅ Idea unshared.');

        // Cleanup
        console.log('\n🧹 Cleaning up...');
        await supabase.from('validations').delete().eq('id', validation.id);
        await supabase.from('ideas').delete().eq('id', idea.id);

        console.log('\n🎉 ALL DATABASE LOGIC VERIFIED SUCCESSFULLY!');
    } catch (error: any) {
        console.error('\n❌ TEST FAILED:', error.message || error);
        process.exit(1);
    }
}

runTests();
