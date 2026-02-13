'use client'

import { useState } from 'react'
import PricingTierCard from './pricing-tier-card'
import { STRIPE_CONFIG } from '@/lib/stripe/constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PricingTableProps {
    currentTier: string
}

export function PricingTable({ currentTier }: PricingTableProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

    const tiers = [
        {
            name: 'Free',
            price: '$0',
            billingPeriod: 'forever',
            description: 'Perfect for testing the waters',
            features: [
                '1 validation per month',
                '1 iteration per idea',
                'Reports saved for 30 days',
                'Community benchmarks',
                'Browse 10 recent shared ideas',
                'Preview idea scores (limited details)',
                'Earn free credits by sharing ideas',
            ],
            cta: 'Get Started',
            highlighted: false,
            tier: 'free' as const,
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? '$39' : '$32.50',
            billingPeriod: billingCycle === 'monthly' ? 'per month' : 'per month, billed annually',
            annualPrice: billingCycle === 'monthly' ? '$390/year (save $78)' : undefined,
            description: 'For aspiring founders with multiple ideas',
            features: [
                '10 validations per month',
                'Unlimited iterations',
                'Reports saved forever',
                'Full iteration history',
                'Compare up to 3 ideas',
                'Export reports as PDF',
                'Browse ideas library',
                'See all 7 dimension scores for shared ideas',
            ],
            cta: 'Upgrade to Pro',
            highlighted: true,
            tier: 'pro' as const,
            priceId: billingCycle === 'monthly'
                ? STRIPE_CONFIG.plans.pro.monthly.priceId
                : STRIPE_CONFIG.plans.pro.annual.priceId,
        },
        {
            name: 'Premium',
            price: billingCycle === 'monthly' ? '$79' : '$65.80',
            billingPeriod: billingCycle === 'monthly' ? 'per month' : 'per month, billed annually',
            annualPrice: billingCycle === 'monthly' ? '$790/year (save $158)' : undefined,
            description: 'For serial validators and consultants',
            features: [
                'Unlimited validations',
                'Unlimited iterations',
                'Reports saved forever',
                'Full iteration history',
                'Compare up to 5 ideas',
                'Export reports as PDF',
                'Priority email support',
                'Early access to new features',
                'Browse ideas library',
                'See all 7 dimension scores for shared ideas',
                'Full AI reasoning for shared ideas',
                'Full recommendations and competition for shared ideas',
            ],
            cta: 'Upgrade to Premium',
            highlighted: false,
            tier: 'premium' as const,
            priceId: billingCycle === 'monthly'
                ? STRIPE_CONFIG.plans.premium.monthly.priceId
                : STRIPE_CONFIG.plans.premium.annual.priceId,
        },
    ]

    return (
        <div className="space-y-12">
            <div className="flex justify-center items-center gap-6 mb-16">
                <span className={cn(
                    "text-base font-semibold transition-colors",
                    billingCycle === 'monthly' ? "text-foreground" : "text-muted-foreground"
                )}>
                    Monthly
                </span>
                <button
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                    className={cn(
                        "relative w-16 h-8 rounded-full p-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        billingCycle === 'annual' ? "bg-primary" : "bg-muted"
                    )}
                    aria-label="Toggle billing cycle"
                >
                    <div className={cn(
                        "w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200",
                        billingCycle === 'annual' ? "translate-x-8" : "translate-x-0"
                    )} />
                </button>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-base font-semibold transition-colors",
                        billingCycle === 'annual' ? "text-foreground" : "text-muted-foreground"
                    )}>
                        Annual
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        Save 17%
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.map((tierData) => (
                    <PricingTierCard
                        key={tierData.name}
                        {...tierData}
                        isCurrentPlan={currentTier.toLowerCase() === tierData.tier.toLowerCase()}
                        billingCycle={billingCycle}
                    />
                ))}
            </div>
        </div >
    )
}
