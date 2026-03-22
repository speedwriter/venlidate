export type SubscriptionTier = 'free' | 'pro' | 'premium'

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trialing' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused' | 'none'

export type UserSubscription = {
    id: string
    user_id: string
    tier: SubscriptionTier
    status: SubscriptionStatus
    billing_period: 'monthly' | 'annual' | null
    started_at: string
    expires_at: string | null
    canceled_at: string | null
    created_at: string
    updated_at: string
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    stripe_price_id?: string | null
    stripe_current_period_end?: string | null
    stripe_cancel_at_period_end?: boolean | null
}

export type QuotaCheck = {
    allowed: boolean
    remaining: number | 'unlimited'
    error?: string
    usingCredit?: boolean
}

export type SubscriptionLimits = {
    validationsPerMonth: number | 'unlimited'
    iterationsPerIdea: number | 'unlimited'
    reportStorageDays: number | 'unlimited'
    maxComparisonIdeas: number
    canExportPDF: boolean
    canAccessRoadmap: boolean
}

export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
    free: {
        validationsPerMonth: 1,
        iterationsPerIdea: 1,
        reportStorageDays: 30,
        maxComparisonIdeas: 0,
        canExportPDF: false,
        canAccessRoadmap: false,
    },
    pro: {
        validationsPerMonth: 10,
        iterationsPerIdea: 'unlimited',
        reportStorageDays: 'unlimited',
        maxComparisonIdeas: 3,
        canExportPDF: true,
        canAccessRoadmap: true,
    },
    premium: {
        validationsPerMonth: 'unlimited',
        iterationsPerIdea: 'unlimited',
        reportStorageDays: 'unlimited',
        maxComparisonIdeas: 5,
        canExportPDF: true,
        canAccessRoadmap: true,
    },
}
