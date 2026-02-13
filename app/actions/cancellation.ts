'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/utils/subscriptions'
import { isUserAdmin } from '@/lib/utils/admin'

export async function saveCancellationFeedback(
    reason: string,
    feedback?: string
) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get user's current tier
        const currentTier = await getUserTier(user.id)

        // Log to console for immediate visibility
        console.log(`Cancellation feedback - User: ${user.email}, Tier: ${currentTier}, Reason: ${reason}`)

        // Insert into cancellation_feedback table
        const { error: insertError } = await supabase
            .from('cancellation_feedback')
            .insert({
                user_id: user.id,
                user_email: user.email || null,
                reason: reason,
                feedback: feedback || null,
                tier: currentTier,
            })

        if (insertError) {
            console.error('Error saving cancellation feedback:', insertError)
            return { success: false, error: 'Failed to save feedback' }
        }

        return { success: true }
    } catch (error) {
        console.error('Unexpected error saving cancellation feedback:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export type CancellationStats = {
    total: number
    byReason: Array<{ reason: string; count: number; percentage: number }>
    recentFeedback: Array<{ reason: string; feedback: string; tier: string; user_email: string; created_at: string }>
}

export async function getCancellationStats(): Promise<{ success: boolean; data?: CancellationStats; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Check if user is admin
        const isAdmin = await isUserAdmin(user.id)
        if (!isAdmin) {
            return { success: false, error: 'Unauthorized: Admin access required' }
        }

        // Query cancellation_feedback table
        const { data: feedbackData, error: dbError } = await supabase
            .from('cancellation_feedback')
            .select('*')
            .order('created_at', { ascending: false })

        if (dbError) {
            console.error('Error fetching cancellation stats:', dbError)
            return { success: false, error: 'Failed to fetch stats' }
        }

        if (!feedbackData) {
            return {
                success: true,
                data: {
                    total: 0,
                    byReason: [],
                    recentFeedback: []
                }
            }
        }

        // Calculate stats
        const total = feedbackData.length
        const reasonCounts: Record<string, number> = {}

        feedbackData.forEach((item) => {
            const reason = item.reason
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
        })

        const byReason = Object.entries(reasonCounts)
            .map(([reason, count]) => ({
                reason,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)

        // Get last 10 entries with feedback or just recent entries
        // The prompt says "recentFeedback: Array<...> (last 10)"
        // We can filter for those with text feedback or just return the recent ones.
        // Let's return the most recent 20, prioritizing those with text feedback if possible,
        // but the prompt implies just recent list. Let's just give the last 20 rows.
        const recentFeedback = feedbackData
            .slice(0, 20)
            .map(item => ({
                reason: item.reason,
                feedback: item.feedback || '',
                tier: item.tier || 'unknown',
                user_email: item.user_email || 'unknown',
                created_at: item.created_at
            }))

        return {
            success: true,
            data: {
                total,
                byReason,
                recentFeedback
            }
        }

    } catch (error) {
        console.error('Unexpected error getting cancellation stats:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
