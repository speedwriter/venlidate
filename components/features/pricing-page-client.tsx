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
import { ManageSubscriptionButton } from "@/components/features/manage-subscription-button"
import { useSearchParams } from 'next/navigation'

interface PricingPageClientProps {
    currentTier: string
    userId?: string
    showCTA?: boolean
}

export default function PricingPageClient({ currentTier, userId, showCTA = true }: PricingPageClientProps) {
    const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly')
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirectTo') || undefined

    const freeTierFeatures = [
        "1 validation per month",
        "All thinking questions (every dimension)",
        "Detailed score breakdown across 7 dimensions",
        "Reports saved for 30 days",
        "Community benchmarks (view only)"
    ]

    const proTierFeatures = [
        "10 validations per month",
        "All thinking questions (every dimension)",
        "🗺️ Full 5-Phase Execution Roadmap",
        "📋 AI-generated sprint tasks tailored to your score",
        "🔄 Adaptive sprints — AI learns from your reflections",
        "📊 Iteration tracking (see score improve)",
        "🎓 AI debrief when you complete all 5 phases",
        "Compare up to 3 ideas side-by-side",
        "Export reports as PDF",
        "Reports saved forever"
    ]

    const premiumTierFeatures = [
        "Everything in Pro, plus:",
        "♾️ Unlimited validations per month",
        "🚀 Run unlimited concurrent roadmaps — execute all your ideas at once",
        "🔗 Shareable validation reports — send to co-founders or investors",
        "📊 Up to 5 ideas side-by-side (Pro: up to 3)",
        "⚡ Priority email support (< 24hr response)",
        "🔬 Early access to new features"
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
                    Start Free. Upgrade to Execute.
                </h1>
                <p className="max-w-[700px] text-xl text-muted-foreground">
                    Validate your idea for free. Upgrade to Pro when you&apos;re ready to work the 5-phase roadmap and sign your first customer. No credit card required.
                </p>

                {(currentTier === 'pro' || currentTier === 'premium') && userId && (
                    <div className="pt-4">
                        <ManageSubscriptionButton
                            tier={currentTier as 'pro' | 'premium'}
                        />
                    </div>
                )}
            </div>

            {/* Billing Toggle */}
            <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                <PricingTierCard
                    name="Free"
                    price="$0"
                    billingPeriod="forever"
                    description="Validate your idea. Know your score."
                    features={freeTierFeatures}
                    cta="Start Free"
                    highlighted={false}
                    tier="free"
                    isCurrentPlan={currentTier === 'free'}
                    billingCycle={billingCycle}
                    redirectTo={redirectTo}
                />
                <PricingTierCard
                    name="Pro"
                    price={getProPrice()}
                    billingPeriod="month"
                    annualPrice="$33"
                    description="Validate your idea. Then execute the roadmap to sign your first customer."
                    features={proTierFeatures}
                    cta="Start Pro Subscription Now"
                    highlighted={true}
                    priceId={getProPriceId()}
                    tier="pro"
                    isCurrentPlan={currentTier === 'pro'}
                    billingCycle={billingCycle}
                    redirectTo={redirectTo}
                />
                <PricingTierCard
                    name="Premium"
                    price={getPremiumPrice()}
                    billingPeriod="month"
                    annualPrice="$66"
                    description="Everything in Pro, for founders running multiple ideas in parallel."
                    features={premiumTierFeatures}
                    cta="Start Premium Subscription Now"
                    highlighted={false}
                    priceId={getPremiumPriceId()}
                    tier="premium"
                    isCurrentPlan={currentTier === 'premium'}
                    billingCycle={billingCycle}
                    redirectTo={redirectTo}
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
                                &ldquo;I completed all 5 phases in 6 weeks. By Phase 4 I had 3 paying customers lined up. The roadmap didn&apos;t let me skip the hard stuff — it made me do the customer interviews I kept avoiding.&rdquo;
                            </p>
                            <div>
                                <p className="font-semibold text-sm">Marcus D.</p>
                                <p className="text-xs text-muted-foreground">Pro User · $4K MRR</p>
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
                        <AccordionTrigger>Is the roadmap really worth upgrading to Pro?</AccordionTrigger>
                        <AccordionContent>
                            Yes. The free tier tells you what&apos;s broken. The Pro roadmap tells you exactly what to do about it — 5 phases, structured sprints, real tasks like customer interviews, landing page tests, and pricing experiments. The AI uses your reflections to generate the next sprint, so it adapts as you learn. Free users get a diagnosis. Pro users get a system to fix it.
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
            {showCTA && (
                <div className="max-w-6xl mx-auto py-20 bg-gradient-to-r from-primary to-primary/80 rounded-2xl px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Validate Today. Sign Your First Customer.
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                        <Button asChild size="lg" variant="secondary">
                            <Link href="/signup">Start Free</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                            <Link href="/signup?plan=pro">Get the Full Roadmap</Link>
                        </Button>
                    </div>
                    <p className="text-white/90 text-sm">
                        Join 500+ founders who use Venlidate to go from idea to first customer.
                    </p>
                </div>
            )}
        </div>
    )
}
