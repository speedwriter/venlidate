'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { Shield, XCircle, Lock, Star } from "lucide-react"
import BillingCycleToggle from "@/components/features/billing-cycle-toggle"
import FeatureComparisonTable from "@/components/features/feature-comparison-table"
import PricingTierCard from "@/components/features/pricing-tier-card"
import { STRIPE_CONFIG } from '@/lib/stripe/constants'

interface PricingPageClientProps {
    currentTier: string
}

export default function PricingPageClient({ currentTier }: PricingPageClientProps) {
    const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly')

    const freeTierFeatures = [
        "1 validation per month",
        "Basic thinking questions (3-5 per idea)",
        "Browse 20 recent marketplace ideas",
        "Reports saved for 30 days",
        "Community benchmarks (view only)"
    ]

    const proTierFeatures = [
        "10 validations per month",
        "All thinking questions (every dimension)",
        "🎯 Personalized Action Plan",
        "📊 Iteration tracking (see score improve)",
        "Full marketplace access (200+ ideas)",
        "Compare up to 3 ideas side-by-side",
        "Export reports as PDF",
        "Reports saved forever",
        "Save favorite marketplace ideas (up to 10)"
    ]

    const premiumTierFeatures = [
        "Everything in Pro, plus:",
        "Unlimited validations",
        "Compare up to 5 ideas",
        "Export ideas as PDF",
        "Priority email support (< 24hr)",
        "Early access to new features",
        "Weekly digest of high-scoring ideas"
    ]

    const getProPrice = () => {
        if (billingCycle === 'annual') {
            return '$33'
        }
        return '$39'
    }

    const getPremiumPrice = () => {
        if (billingCycle === 'annual') {
            return '$66'
        }
        return '$79'
    }

    const getProPriceId = () => {
        return billingCycle === 'annual'
            ? STRIPE_CONFIG.plans.pro.annual.priceId
            : STRIPE_CONFIG.plans.pro.monthly.priceId
    }

    const getPremiumPriceId = () => {
        return billingCycle === 'annual'
            ? STRIPE_CONFIG.plans.premium.annual.priceId
            : STRIPE_CONFIG.plans.premium.monthly.priceId
    }

    return (
        <div className="container py-12 px-4 max-w-7xl mx-auto">
            {/* Hero Section with Billing Toggle */}
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Choose Your Plan. Validate Faster. Build Smarter.
                </h1>
                <p className="max-w-[700px] text-xl text-muted-foreground">
                    Start free. Upgrade when you need action plans and unlimited validations. No credit card required.
                </p>
            </div>

            {/* Billing Toggle */}
            <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                <PricingTierCard
                    name="Free"
                    price="$0"
                    billingPeriod="forever"
                    description="Perfect for testing the waters"
                    features={freeTierFeatures}
                    cta="Start Free"
                    highlighted={false}
                    tier="free"
                    isCurrentPlan={currentTier === 'free'}
                    billingCycle={billingCycle}
                    onBillingCycleChange={setBillingCycle}
                />
                <PricingTierCard
                    name="Pro"
                    price={getProPrice()}
                    billingPeriod="month"
                    annualPrice="$33"
                    description="For aspiring founders with multiple ideas"
                    features={proTierFeatures}
                    cta="Start Free Trial"
                    highlighted={true}
                    priceId={getProPriceId()}
                    tier="pro"
                    isCurrentPlan={currentTier === 'pro'}
                    billingCycle={billingCycle}
                    onBillingCycleChange={setBillingCycle}
                />
                <PricingTierCard
                    name="Premium"
                    price={getPremiumPrice()}
                    billingPeriod="month"
                    annualPrice="$66"
                    description="For serial validators and consultants"
                    features={premiumTierFeatures}
                    cta="Start Free Trial"
                    highlighted={false}
                    priceId={getPremiumPriceId()}
                    tier="premium"
                    isCurrentPlan={currentTier === 'premium'}
                    billingCycle={billingCycle}
                    onBillingCycleChange={setBillingCycle}
                />
            </div>

            <div className="text-center space-y-1 mb-12">
                <p className="text-sm text-muted-foreground">All plans include 7-day free trial. No credit card required.</p>
                <p className="text-sm text-muted-foreground">Cancel anytime. No questions asked.</p>
            </div>

            {/* Feature Comparison Table */}
            <FeatureComparisonTable />

            {/* Testimonials */}
            <div className="max-w-6xl mx-auto py-12 bg-muted rounded-2xl px-8">
                <h2 className="text-2xl font-bold text-center mb-8">What Founders Are Saying</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm mb-4 italic">
                                &ldquo;I validated 3 ideas for free. When I saw the action plan preview, I immediately upgraded to Pro. It told me exactly what to validate first. My score went from 52 to 74 in 2 weeks.&rdquo;
                            </p>
                            <div>
                                <p className="font-semibold text-sm">Sarah K.</p>
                                <p className="text-xs text-muted-foreground">Pro User</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm mb-4 italic">
                                &ldquo;I almost quit my job to build an idea that scored 38/100. Venlidate saved me from wasting a year on something nobody wanted. Best $39 I ever spent.&rdquo;
                            </p>
                            <div>
                                <p className="font-semibold text-sm">Mike T.</p>
                                <p className="text-xs text-muted-foreground">Pro User</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm mb-4 italic">
                                &ldquo;I had no ideas but knew I wanted to start a business. Browsed the marketplace, found a validated SaaS idea scoring 72/100, and built my version of it. Now at $5K MRR.&rdquo;
                            </p>
                            <div>
                                <p className="font-semibold text-sm">Alex R.</p>
                                <p className="text-xs text-muted-foreground">Premium User</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto py-16">
                <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Do I need to enter a credit card for the free trial?</AccordionTrigger>
                        <AccordionContent>
                            No. The free tier is truly free forever. Pro and Premium offer 7-day free trials with no credit card required. You&apos;ll only be charged if you continue after the trial.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Can I switch plans later?</AccordionTrigger>
                        <AccordionContent>
                            Yes. Upgrade or downgrade anytime. If you downgrade from Pro to Free, your reports are archived (not deleted) and restore if you upgrade again.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>What if I don&apos;t use all my validations in a month?</AccordionTrigger>
                        <AccordionContent>
                            Validations don&apos;t roll over, but you can re-validate the same idea unlimited times on Pro/Premium. Most users validate 2-3 new ideas per month and iterate on them.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Is the action plan really worth upgrading to Pro?</AccordionTrigger>
                        <AccordionContent>
                            Yes. The action plan tells you the top 3 bottlenecks in priority order, exactly how to validate each one, and success criteria. Free users get thinking questions (helpful), but Pro users get a step-by-step roadmap (game-changing).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                        <AccordionTrigger>How does the 7-day free trial work?</AccordionTrigger>
                        <AccordionContent>
                            Sign up, choose Pro or Premium, start your trial immediately. Cancel anytime before day 7 and you won&apos;t be charged. No credit card required to start.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                        <AccordionTrigger>Can I get a refund if I&apos;m not satisfied?</AccordionTrigger>
                        <AccordionContent>
                            Yes. We offer a 30-day money-back guarantee. If you&apos;re not happy, email us and we&apos;ll refund you, no questions asked.
                        </AccordionContent>
                    </AccordionItem>
                    {/*<AccordionItem value="item-7">
                        <AccordionTrigger>Do you offer discounts for students or nonprofits?</AccordionTrigger>
                        <AccordionContent>
                            Yes! Email us with proof of student status (.edu email) or nonprofit documentation for 50% off Pro or Premium.
                        </AccordionContent>
                    </AccordionItem>*/}
                    <AccordionItem value="item-8">
                        <AccordionTrigger>What about teams? Can multiple people use one account?</AccordionTrigger>
                        <AccordionContent>
                            Currently, accounts are individual. Team features are coming in Q3 2026. For now, each team member needs their own account.
                        </AccordionContent>
                    </AccordionItem>
                    {/*<AccordionItem value="item-9">
                        <AccordionTrigger>Is there an Enterprise plan?</AccordionTrigger>
                        <AccordionContent>
                            Yes! Contact us at <a href="mailto:enterprise@venlidate.com" className="text-primary hover:underline">enterprise@venlidate.com</a> for custom pricing, white-label options, and bulk licenses for accelerators and universities.
                        </AccordionContent>
                    </AccordionItem>*/}
                </Accordion>
            </div>

            {/* Trust Badges & Risk Reversal */}
            <div className="max-w-6xl mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold">30-Day Money-Back Guarantee</h3>
                        <p className="text-sm text-muted-foreground">
                            Not satisfied? Get a full refund, no questions asked.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold">Cancel Anytime</h3>
                        <p className="text-sm text-muted-foreground">
                            No contracts. No penalties. Cancel in one click.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold">Your Data is Safe</h3>
                        <p className="text-sm text-muted-foreground">
                            Bank-level encryption. GDPR compliant. Your ideas stay private.
                        </p>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="max-w-6xl mx-auto py-20 bg-gradient-to-r from-primary to-primary/80 rounded-2xl px-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">
                    Start Validating Today. Build Tomorrow.
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                    <Button asChild size="lg" variant="secondary">
                        <Link href="/signup">Start Free</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                        <Link href="/signup?plan=pro">Try Pro Free</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                        <Link href="/signup?plan=premium">Try Premium Free</Link>
                    </Button>
                </div>
                <p className="text-white/90 text-sm">
                    Join 500+ founders who stopped guessing and started building with confidence.
                </p>
            </div>
        </div>
    )
}
