import { createClient } from "@/lib/supabase/server"
import { getUserTier } from "@/lib/utils/subscriptions"
import type { Metadata } from 'next'
import PricingPageClient from "@/components/features/pricing-page-client"

export const metadata: Metadata = {
    title: 'Pricing - Venlidate | AI Startup Idea Validation',
    description: 'Choose your plan: Free validation, Pro action plans ($39/mo), or Premium unlimited ($79/mo). 7-day free trial. No credit card required.',
    openGraph: {
        title: 'Venlidate Pricing - Start Free, Upgrade When Ready',
        description: 'Validate your startup idea for free. Upgrade to Pro for personalized action plans. 30-day money-back guarantee.',
    },
}

export default async function PricingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // For public page, pass 'free' if not logged in, or actual tier if logged in
    const currentTier = user ? await getUserTier(user.id) : 'free'

    return <PricingPageClient currentTier={currentTier} userId={user?.id} />
}
