import { createClient } from "@/lib/supabase/server"
import { getUserTier } from "@/lib/utils/subscriptions"
import { PricingTable } from "@/components/features/pricing-table"
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

export default async function PricingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { success, canceled, tier } = await searchParams
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect("/login?returnTo=/pricing")
    }

    const currentTier = await getUserTier(user.id)

    return (
        <div className="container py-12 px-4 max-w-7xl mx-auto">
            {/* Success/Cancel Messages */}
            {success === 'true' && (
                <div className="mb-12 p-6 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-center animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-2xl font-bold mb-2">🎉 Subscription activated!</h2>
                    <p className="text-lg">Welcome to <strong>{tier || 'your new plan'}</strong>. You now have full access to all features.</p>
                </div>
            )}

            {canceled === 'true' && (
                <div className="mb-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-center animate-in fade-in slide-in-from-top-4">
                    <p className="font-bold text-lg">Checkout canceled. No charges were made.</p>
                    <p>Feel free to reach out if you have any questions about our plans.</p>
                </div>
            )}

            {/* Hero Section */}
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                    Validate Your Ideas. Get Inspired by Others.
                </h1>
                <p className="max-w-[700px] text-lg text-muted-foreground">
                    Join 500+ founders validating ideas and discovering opportunities.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-background" />
                        </div>
                        <span className="font-medium">500+ founders</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★★★★★</span>
                        <span className="font-medium ml-1">4.9/5 rating</span>
                    </div>
                    <div className="font-medium">
                        💡 200+ ideas validated this month
                    </div>
                </div>
            </div>

            {/* Marketplace Preview Widget */}
            <MarketplacePreviewWidget />

            {/* Pricing Table */}
            <div className="mb-6">
                <div className="text-center mb-8">
                    <p className="text-sm font-medium text-primary">🎉 Limited Time: Get 17% off with annual billing</p>
                </div>
                <PricingTable currentTier={currentTier} />
                <div className="text-center mt-6 text-sm text-muted-foreground">
                    <p>✓ Cancel anytime • ✓ No hidden fees • ✓ 30-day money-back guarantee</p>
                </div>
            </div>

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
                        <p className="text-muted-foreground mb-4 italic">&ldquo;Saved me from wasting 6 months on the wrong idea.&rdquo;</p>
                        <p className="text-sm">Sarah validated 8 side project ideas before finding her winner. Now building a SaaS that scored 82/100.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Quote className="h-8 w-8 text-primary/20" />
                            <h3 className="font-bold text-xl">The Browser</h3>
                        </div>
                        <p className="text-muted-foreground mb-4 italic">&ldquo;Never would have thought of this opportunity on my own.&rdquo;</p>
                        <p className="text-sm">Mike had skills but no ideas. Browsed the marketplace, found inspiration, and validated his own unique version.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Quote className="h-8 w-8 text-primary/20" />
                            <h3 className="font-bold text-xl">The Sharer</h3>
                        </div>
                        <p className="text-muted-foreground mb-4 italic">&ldquo;Sharing forced me to think critically about my ideas.&rdquo;</p>
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
