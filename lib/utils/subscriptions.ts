import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { cache } from 'react'

export type SubscriptionTier = 'free' | 'pro' | 'premium'

export type SubscriptionLimits = {
    validationsPerMonth: number | 'unlimited'
    iterationsPerIdea: number | 'unlimited'
    reportStorageDays: number | 'unlimited'
    maxComparisonIdeas: number
    canExportPDF: boolean
}

export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
    free: {
        validationsPerMonth: 1,
        iterationsPerIdea: 1,
        reportStorageDays: 30,
        maxComparisonIdeas: 0,
        canExportPDF: false,
    },
    pro: {
        validationsPerMonth: 10,
        iterationsPerIdea: 'unlimited',
        reportStorageDays: 'unlimited',
        maxComparisonIdeas: 3,
        canExportPDF: true,
    },
    premium: {
        validationsPerMonth: 'unlimited',
        iterationsPerIdea: 'unlimited',
        reportStorageDays: 'unlimited',
        maxComparisonIdeas: 5,
        canExportPDF: true,
    },
}

/**
 * Fetch user's subscription from user_subscriptions table
 * Cached per-request using React cache
 */
export const getUserSubscription = cache(async (userId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) {
        console.error('Error fetching user subscription:', error)
        return null
    }

    return data
})

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await getUserSubscription(userId)
    return (subscription?.tier as SubscriptionTier) || 'free'
}

/**
 * Check if user can create a new validation this month.
 * This counts unique ideas validated within the current month.
 */
export async function checkValidationQuota(userId: string, ideaId?: string): Promise<{
    allowed: boolean,
    remaining: number | 'unlimited',
    error?: string
}> {
    const tier = await getUserTier(userId)
    const limits = TIER_LIMITS[tier]

    if (limits.validationsPerMonth === 'unlimited') {
        return { allowed: true, remaining: 'unlimited' }
    }

    const supabase = await createClient()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Fetch all validations for this user this month
    const { data: validations, error } = await supabase
        .from('validations')
        .select('idea_id')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

    if (error) {
        return { allowed: false, remaining: 0, error: 'Failed to verify usage quota.' }
    }

    const validatedIdeaIds = new Set(validations?.map(v => v.idea_id) || [])

    // If this idea has already been validated this month, it doesn't count as a "new" validation
    if (ideaId && validatedIdeaIds.has(ideaId)) {
        return { allowed: true, remaining: Math.max(0, (limits.validationsPerMonth as number) - validatedIdeaIds.size) }
    }

    const currentUniqueCount = validatedIdeaIds.size
    const remaining = Math.max(0, (limits.validationsPerMonth as number) - currentUniqueCount)

    if (remaining > 0) {
        return { allowed: true, remaining }
    }

    return {
        allowed: false,
        remaining: 0,
        error: 'Monthly validation limit reached. Upgrade to Pro for more validations.'
    }
}

/**
 * Check if user can iterate on a specific idea
 */
export async function checkIterationQuota(ideaId: string, userId: string): Promise<{
    allowed: boolean,
    error?: string
}> {
    const tier = await getUserTier(userId)
    const limits = TIER_LIMITS[tier]

    if (limits.iterationsPerIdea === 'unlimited') {
        return { allowed: true }
    }

    const supabase = await createClient()
    const { count, error } = await supabase
        .from('validations')
        .select('*', { count: 'exact', head: true })
        .eq('idea_id', ideaId)

    if (error) {
        return { allowed: false, error: 'Failed to verify iteration quota.' }
    }

    const currentCount = count || 0
    // Total allowed = Initial (1) + Iterations
    const maxAllowed = 1 + (limits.iterationsPerIdea as number)

    if (currentCount < maxAllowed) {
        return { allowed: true }
    }

    return {
        allowed: false,
        error: 'Iteration limit reached for this idea. Upgrade to Pro for unlimited iterations.'
    }
}

/**
 * Check if idea count matches comparison limits
 */
export async function checkComparisonLimit(userId: string, ideaCount: number): Promise<{
    allowed: boolean,
    error?: string
}> {
    const tier = await getUserTier(userId)
    const limits = TIER_LIMITS[tier]

    if (ideaCount <= limits.maxComparisonIdeas) {
        return { allowed: true }
    }

    return {
        allowed: false,
        error: `Your tier allows comparing up to ${limits.maxComparisonIdeas} ideas. Upgrade to compare more.`
    }
}

/**
 * Check if user can export to PDF
 */
export async function canExportPDF(userId: string): Promise<boolean> {
    const tier = await getUserTier(userId)
    return TIER_LIMITS[tier].canExportPDF
}
