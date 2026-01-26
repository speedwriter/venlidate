import { calculatePercentile, updateMonthlyBenchmark } from '../lib/utils/benchmarks';
import { createClient } from '../lib/supabase/server';

async function testBenchmarks() {
    console.log('🚀 Starting Benchmark Utility Verification...');

    try {
        // Test 1: Calculate Percentile with a mock score
        console.log('\n--- Test 1: calculatePercentile ---');
        const testScore = 85;
        const percentile = await calculatePercentile(testScore);
        console.log(`Score ${testScore} results in Top ${percentile}%`);

        // Test 2: Update Monthly Benchmark
        console.log('\n--- Test 2: updateMonthlyBenchmark ---');
        await updateMonthlyBenchmark();
        console.log('Successfully triggered updateMonthlyBenchmark');

        // Test 3: Verify benchmark_data in Supabase
        console.log('\n--- Test 3: Verify benchmark_data in Supabase ---');
        const supabase = await createClient();
        const now = new Date();
        const currentMonth = now.toISOString().substring(0, 7);

        const { data, error } = await supabase
            .from('benchmark_data')
            .select('*')
            .eq('month', currentMonth)
            .single();

        if (error) {
            console.error('Error fetching benchmark data:', error);
        } else {
            console.log('Benchmark data for', currentMonth, ':', data);
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

testBenchmarks();
