'use client'

import { useState } from 'react'
import PricingTierCard from './pricing-tier-card'

export function PricingPreviewSection() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

    return (
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingTierCard
                name="Free"
                price="$0"
                billingPeriod="mo"
                description="Perfect for validating your first idea and getting a taste of the platform."
                features={[
                    "1 validation/month",
                    "Thinking questions",
                    "Browse marketplace",
                    "30-day report access"
                ]}
                cta="Start Free"
                highlighted={false}
                tier="free"
                isCurrentPlan={false}
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
            />
            <PricingTierCard
                name="Pro"
                price={billingCycle === 'monthly' ? "$39" : "$33"}
                billingPeriod="mo"
                annualPrice="$348/yr"
                description="For founders who want a complete roadmap and structured guidance."
                features={[
                    "10 validations/month",
                    "Personalized Action Plan",
                    "Iteration tracking",
                    "Compare 3 ideas",
                    "PDF export",
                ]}
                cta="Start Free Trial"
                highlighted={true}
                tier="pro"
                isCurrentPlan={false}
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
            />
            <PricingTierCard
                name="Premium"
                price={billingCycle === 'monthly' ? "$79" : "$66"}
                billingPeriod="mo"
                annualPrice="$708/yr"
                description="For serial entrepreneurs and agencies validating multiple concepts."
                features={[
                    "Unlimited validations",
                    "Personalized Action Plan",
                    "Iteration tracking",
                    "Compare 5 ideas",
                    "PDF export",
                    "Full marketplace access",
                    "Advanced features",
                    "Priority support"
                ]}
                cta="Start Free Trial"
                highlighted={false}
                tier="premium"
                priceId={undefined} // Force link mode
                isCurrentPlan={false}
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
            />
        </div>
    )
}
