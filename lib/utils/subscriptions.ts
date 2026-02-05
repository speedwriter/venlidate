import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { SubscriptionTier, UserSubscription, QuotaCheck, TIER_LIMITS } from '@/types/subscriptions'

export type { SubscriptionTier, UserSubscription, QuotaCheck, SubscriptionLimits } from '@/types/subscriptions'
export { TIER_LIMITS } from '@/types/subscriptions'

/**
 * Fetch user's subscription from user_subscriptions table
 * Cached per-request using React cache
 */
export const getUserSubscription = cache(async (userId: string): Promise<UserSubscription | null> => {
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

    return data as unknown as UserSubscription
})

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await getUserSubscription(userId)
    return (subscription?.tier as SubscriptionTier) || 'free'
}

/**
 * Fetch user's profile from profiles table
 */
export const getUserProfile = cache(async (userId: string) => {
    const supabase = await createClient()

    // First try the profiles table
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()

    // Also get the user from auth to check metadata fallback
    const { data: { user } } = await supabase.auth.getUser()

    if (error || !profile) {
        if (error) {
            console.error('Error fetching user profile:', error.message)
        }
        // Fallback to metadata if available
        if (user?.user_metadata) {
            return {
                user_id: userId,
                first_name: user.user_metadata.first_name || '',
                last_name: user.user_metadata.last_name || '',
                email: user.email || ''
            }
        }
        return null
    }

    // If profile exists but names are empty, try fallback to metadata
    const finalProfile = { ...profile }
    if (!finalProfile.first_name && user?.user_metadata?.first_name) {
        finalProfile.first_name = user.user_metadata.first_name
    }
    if (!finalProfile.last_name && user?.user_metadata?.last_name) {
        finalProfile.last_name = user.user_metadata.last_name
    }

    return finalProfile
})

/**
 * Check if user can create a new validation this month.
 * This counts unique ideas validated within the current month.
 */
export async function checkValidationQuota(userId: string, ideaId?: string): Promise<QuotaCheck> {
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
        error: `Your tier allows comparing up to ${limits.maxComparisonIdeas} ideas.Upgrade to compare more.`
    }
}

/**
 * Check if user can export to PDF
 */
export async function canExportPDF(userId: string): Promise<boolean> {
    const tier = await getUserTier(userId)
    return TIER_LIMITS[tier].canExportPDF
}

/**
 * Check if a specific report is accessible based on user's tier and report age.
 * Free tier: Accessible for 30 days.
 * Pro/Premium: Always accessible.
 */
export async function canAccessReport(userId: string, validationCreatedAt: string): Promise<boolean> {
    const tier = await getUserTier(userId)

    if (tier === 'pro' || tier === 'premium') {
        return true
    }

    const createdDate = new Date(validationCreatedAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - createdDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays <= 30
}

/**
 * Fetch all validations for user (optionally filtered by ideaId) and filter by accessibility.
 */
export async function getAccessibleValidations(userId: string, ideaId?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('validations')
        .select('*')
        .eq('user_id', userId)

    if (ideaId) {
        query = query.eq('idea_id', ideaId)
    }

    const { data: validations, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching validations:', error)
        return []
    }

    if (!validations) return []

    // Filter validations based on access control
    const accessibleValidations = []
    const tier = await getUserTier(userId)

    if (tier === 'pro' || tier === 'premium') {
        return validations
    }

    for (const validation of validations) {
        const canAccess = await canAccessReport(userId, validation.created_at)
        if (canAccess) {
            accessibleValidations.push(validation)
        }
    }

    return accessibleValidations
}

/**
 * Get current monthly validation usage count
 */
export async function getMonthlyUsage(userId: string): Promise<number> {
    const supabase = await createClient()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: validations, error } = await supabase
        .from('validations')
        .select('idea_id')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

    if (error) {
        console.error('Error fetching monthly usage:', error)
        return 0
    }

    const validatedIdeaIds = new Set(validations?.map(v => v.idea_id) || [])
    return validatedIdeaIds.size
}
