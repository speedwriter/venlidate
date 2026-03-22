import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

/**
 * Cron job to cleanup (hard delete) very old reports for free tier users.
 * Runs on a schedule (e.g., daily).
 * Target: Free tier reports older than 30 days.
 * Requires CRON_SECRET to be set in environment variables.
 */
export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
        console.error('[Cron] CRON_SECRET environment variable is not set — endpoint blocked')
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const authHeader = request.headers.get('authorization') ?? ''
    const expected = `Bearer ${cronSecret}`

    // Constant-time comparison to prevent timing attacks
    const authBytes = Buffer.from(authHeader, 'utf8')
    const expectedBytes = Buffer.from(expected, 'utf8')
    const isValid =
        authBytes.length === expectedBytes.length &&
        timingSafeEqual(authBytes, expectedBytes)

    if (!isValid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // 1. Calculate cutoff date for HARD deletion (30 days ago for free tier)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)
    const cutoffIso = cutoffDate.toISOString()

    try {
        // 2. Fetch all users currently on the free tier
        const { data: freeTierUsers, error: userError } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('tier', 'free')

        if (userError) throw userError

        const freeUserIds = freeTierUsers?.map(u => u.user_id) || []

        if (freeUserIds.length === 0) {
            return NextResponse.json({ success: true, deleted: 0, message: 'No free users found' })
        }

        // 3. Delete ancient reports for these free tier users
        // Note: The requirement mentioned checking if they've EVER been pro.
        // Without clear subscription history, we rely on current tier.
        const { error: deleteError, count } = await supabase
            .from('validations')
            .delete({ count: 'exact' })
            .lt('created_at', cutoffIso)
            .in('user_id', freeUserIds)

        if (deleteError) throw deleteError

        // 4. Log deletions
        console.log(`[Cron] Cleanup reports: Deleted ${count || 0} ancient validations older than ${cutoffIso}`)

        // 5. Return summary
        return NextResponse.json({
            success: true,
            deleted: count || 0,
            cutoff: cutoffIso
        })

    } catch (error) {
        console.error('[Cron] Cleanup reports failed:', error)
        return NextResponse.json({
            success: false,
            error: 'Cleanup failed. Check server logs for details.'
        }, { status: 500 })
    }
}
