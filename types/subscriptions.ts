export type SubscriptionTier = 'free' | 'pro' | 'premium'

export type SubscriptionStatus = 'active' | 'canceled' | 'expired'

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
}

export type QuotaCheck = {
    allowed: boolean
    remaining: number | 'unlimited'
    error?: string
}

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
