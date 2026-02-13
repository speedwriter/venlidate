import { createClient } from '@/lib/supabase/server';

/**
 * Calculates the percentile for a given user score based on validations from the current month.
 * @param userScore The score to calculate the percentile for.
 * @returns The percentile (0-100), where 1 means top 1% and 100 means bottom 100%.
 */
export async function calculatePercentile(userScore: number): Promise<number> {
    const supabase = await createClient();

    // 1. Get current month in 'YYYY-MM' format
    const now = new Date();


    // Get start and end of current month for filtering validations
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // 2. Fetch all validations from current month
    const { data: validations, error } = await supabase
        .from('validations')
        .select('overall_score')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

    if (error) {
        console.error('Error fetching validations for percentile calculation:', error);
        return 0;
    }

    if (!validations || validations.length === 0) {
        return 100; // If no validations, they are technically the only one
    }

    const total = validations.length;

    // 3. Count how many validations have overall_score > userScore (for "Top X%")
    // The prompt says: "Count how many validations have overall_score < userScore"
    // and "Calculate percentile: (count / total) * 100".
    // 
    // Usually "Top 10%" means 90% of scores are below you.
    // If count is scores below userScore, then (count/total)*100 is the percentile rank (e.g. 90th percentile).
    // The badge says "Top {percentile}%", so if they are in 90th percentile, it's "Top 10%".

    const countBelow = validations.filter(v => v.overall_score < userScore).length;

    // 4. Calculate percentile: (count / total) * 100
    // Following the instruction: (count / total) * 100
    // Let's refine this to represent "Top X%".
    // If 90 out of 100 are below, (90/100)*100 = 90. 100 - 90 = 10. Top 10%.

    const percentileRank = (countBelow / total) * 100;
    const topPercentile = 100 - percentileRank;

    // 5. Round to nearest integer
    // 6. Return percentile (0-100)
    return Math.max(1, Math.min(100, Math.round(topPercentile)));
}

/**
 * Calculates aggregate stats for the current month and upserts into benchmark_data table.
 */
export async function updateMonthlyBenchmark() {
    const supabase = await createClient();

    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7); // 'YYYY-MM'

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // Fetch validations for the current month
    const { data: validations, error: fetchError } = await supabase
        .from('validations')
        .select('overall_score')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

    if (fetchError) {
        console.error('Error fetching validations for benchmark update:', fetchError);
        return;
    }

    if (!validations || validations.length === 0) {
        return;
    }

    const totalCount = validations.length;
    const totalScore = validations.reduce((sum, v) => sum + v.overall_score, 0);
    const avgScore = totalScore / totalCount;

    // Score distribution (bucketed by 10s)
    const distribution: Record<string, number> = {};
    validations.forEach(v => {
        const bucket = Math.floor(v.overall_score / 10) * 10;
        const key = `${bucket}-${bucket + 9}`;
        distribution[key] = (distribution[key] || 0) + 1;
    });

    // Upsert into benchmark_data table
    const { error: upsertError } = await supabase
        .from('benchmark_data')
        .upsert({
            month: currentMonth,
            total_validations: totalCount,
            avg_overall_score: avgScore,
            score_distribution: distribution,
            updated_at: new Date().toISOString()
        }, { onConflict: 'month' });

    if (upsertError) {
        console.error('Error upserting benchmark data:', upsertError);
    }
}
