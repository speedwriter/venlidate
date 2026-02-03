'use server'

import { checkValidationQuota, getUserTier, TIER_LIMITS } from '@/lib/utils/subscriptions'
import { createClient } from '@/lib/supabase/server'

export async function getUserTierAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return 'free'
    }

    return await getUserTier(user.id)
}

export async function checkValidationQuotaAction(ideaId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { allowed: false, remaining: 0, error: 'Unauthorized' }
    }

    return await checkValidationQuota(user.id, ideaId)
}

export async function canExportPDFAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const tier = await getUserTier(user.id)
    return TIER_LIMITS[tier].canExportPDF
}
