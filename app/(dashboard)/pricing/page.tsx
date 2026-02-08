import { createClient } from "@/lib/supabase/server"
import { getUserTier } from "@/lib/utils/subscriptions"
import { PricingTable, PricingTier } from "@/components/features/pricing-table"
import { MarketplaceComparisonTable } from "@/components/features/marketplace-comparison-table"
import { MarketplacePreviewWidget } from "@/components/features/marketplace-preview-widget"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Quote } from "lucide-react"
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Pricing - Validate Ideas & Browse 500+ Startup Opportunities | Venlidate",
    description: "Choose your plan: Free validation, Pro features, or Premium access to our complete idea marketplace. Share ideas, earn credits, get inspired.",
}

const pricingTiers: PricingTier[] = [
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
            '🆕 Browse 10 recent shared ideas',
            '🆕 Preview idea scores (limited details)',
            '🆕 Earn free credits by sharing ideas',
        ],
        cta: 'Current Plan',
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '$39',
        billingPeriod: 'per month',
        annualPrice: '$390/year (save $78)',
        description: 'For aspiring founders with multiple ideas',
        features: [
            '10 validations per month',
            'Unlimited iterations',
            'Reports saved forever',
            'Full iteration history',
            'Compare up to 3 ideas',
            'Export reports as PDF',
            '🆕 Browse ideas library',
            '🆕 See all 7 dimension scores for shared ideas',
        ],
        cta: 'Upgrade to Pro',
        highlighted: true,
    },
    {
        name: 'Premium',
        price: '$79',
        billingPeriod: 'per month',
        annualPrice: '$790/year (save $158)',
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
            '🆕 Browse ideas library',
            '🆕 See all 7 dimension scores for shared ideas',
            '🆕 Full AI reasoning for shared ideas',
            '🆕 Full recommendations and competition for shared ideas',
        ],
        cta: 'Upgrade to Premium',
        highlighted: false,
    },
]

export default async function PricingPage() {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect("/login?returnTo=/pricing")
    }

    const currentTier = await getUserTier(user.id)

    return (
        <div className="container py-12 px-4 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                    Validate Your Ideas. Get Inspired by Others.
                </h1>
                <p className="max-w-[700px] text-lg text-muted-foreground">
                    Join 500+ founders validating ideas and discovering opportunities.
                </p>
            </div>

            {/* Marketplace Preview Widget */}
            <MarketplacePreviewWidget />

            {/* Pricing Table */}
            <PricingTable currentTier={currentTier} pricingTiers={pricingTiers} />

            {/* Comparison Table */}
            <MarketplaceComparisonTable />

            {/* Success Stories */}
            <div className="mt-24 space-y-12">
                <h2 className="text-3xl font-bold text-center">How Founders Use Venlidate</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Quote className="h-8 w-8 text-primary/20" />
                            <h3 className="font-bold text-xl">The Validator</h3>
                        </div>
                        <p className="text-muted-foreground mb-4 italic">"Saved me from wasting 6 months on the wrong idea."</p>
                        <p className="text-sm">Sarah validated 8 side project ideas before finding her winner. Now building a SaaS that scored 82/100.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Quote className="h-8 w-8 text-primary/20" />
                            <h3 className="font-bold text-xl">The Browser</h3>
                        </div>
                        <p className="text-muted-foreground mb-4 italic">"Never would have thought of this opportunity on my own."</p>
                        <p className="text-sm">Mike had skills but no ideas. Browsed the marketplace, found inspiration, and validated his own unique version.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Quote className="h-8 w-8 text-primary/20" />
                            <h3 className="font-bold text-xl">The Sharer</h3>
                        </div>
                        <p className="text-muted-foreground mb-4 italic">"Sharing forced me to think critically about my ideas."</p>
                        <p className="text-sm">Emma shared 3 ideas, earned credits, and helped others. She got valuable feedback through the community.</p>
                    </div>
                </div>
            </div>

            {/* FAQs */}
            <div className="mt-24 max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="grid gap-8">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Can I share ideas without paying?</h3>
                        <p className="text-muted-foreground">Yes! Sharing is free for all users. You&apos;ll earn 1 free validation credit for each approved idea you share.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Are shared ideas really public?</h3>
                        <p className="text-muted-foreground">Shared ideas are opt-in only. When you share, we show the problem, target customer, and overall score. Full validation details (reasoning, recommendations) are only visible to paying users. You always control what you share.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">What if someone steals my idea?</h3>
                        <p className="text-muted-foreground">Ideas shared on Venlidate are meant to inspire, not be copied verbatim. We only share high-level information. Remember: execution matters far more than ideas. Most successful founders openly share their ideas (see: Indie Hackers, Twitter). If you&apos;re concerned, you can keep your validations private.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Can I browse ideas before signing up?</h3>
                        <p className="text-muted-foreground">Yes! Visit <Link href="/ideas" className="text-primary hover:underline">venlidate.com/ideas</Link> to preview 10 recent ideas. Sign up free to see full details and browse the complete archive.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">What&apos;s the difference between browsing as Free vs Pro?</h3>
                        <p className="text-muted-foreground">Free users can preview recent ideas but need to upgrade to Pro to see full dimension scores, access the archive, use filters, and save favorites. Premium adds advanced search, industry filters, and full AI reasoning.</p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="mt-24 mb-12 bg-primary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/10">
                <h2 className="text-3xl font-bold mb-4">Not Ready to Validate Yet?</h2>
                <div className="space-y-2 text-lg text-muted-foreground mb-8">
                    <p>Browse 200+ validated startup ideas for free</p>
                    <p>Get inspired by what&apos;s working (and what&apos;s not)</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <Button asChild size="lg" className="text-lg px-8 h-12">
                        <Link href="/ideas">
                            Explore Ideas <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <p className="text-sm text-muted-foreground">No signup required to browse</p>
                </div>
            </div>
        </div>
    )
}
