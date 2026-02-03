'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface PricingTier {
    name: string
    price: string
    billingPeriod: string
    annualPrice?: string
    description: string
    features: string[]
    cta: string
    highlighted: boolean
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
        ],
        cta: 'Upgrade to Premium',
        highlighted: false,
    },
]

interface PricingTableProps {
    currentTier: string
}

export function PricingTable({ currentTier }: PricingTableProps) {
    const handleUpgrade = (tierName: string) => {
        toast.info(`${tierName} tier coming soon!`, {
            description: "Payments integration is in progress. Join our Founder's Club waitlist for early access!"
        })
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingTiers.map((tier) => {
                    const isCurrentPlan = currentTier.toLowerCase() === tier.name.toLowerCase()

                    return (
                        <Card
                            key={tier.name}
                            className={cn(
                                "relative flex flex-col h-full transition-all duration-300 hover:shadow-xl",
                                tier.highlighted ? "border-primary border-2 shadow-lg scale-105 z-10" : "border-border"
                            )}
                        >
                            {tier.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary text-primary-foreground font-bold px-4 py-1">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                                        <CardDescription className="mt-2 min-h-[40px]">{tier.description}</CardDescription>
                                    </div>
                                    {isCurrentPlan && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Your Current Plan
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="flex-grow">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                                    <span className="text-muted-foreground ml-1">/{tier.billingPeriod}</span>
                                    {tier.annualPrice && (
                                        <p className="text-sm text-primary font-medium mt-1">{tier.annualPrice}</p>
                                    )}
                                </div>

                                <ul className="space-y-3">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-sm text-foreground/80">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-6">
                                <Button
                                    className="w-full font-bold h-11"
                                    variant={tier.highlighted ? "default" : "outline"}
                                    disabled={isCurrentPlan}
                                    onClick={() => handleUpgrade(tier.name)}
                                >
                                    {isCurrentPlan ? "Current Plan" : tier.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {/* FAQ Section */}
            <div className="mt-24 max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="grid gap-8">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">When will you start charging?</h3>
                        <p className="text-muted-foreground">Venlidate is currently in free beta. Paid plans will be launching soon with enhanced features and higher limits.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Can I change plans later?</h3>
                        <p className="text-muted-foreground">Absolutely. You will be able to upgrade or downgrade your plan at any time once our payment system is live.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">What happens to my data if I downgrade?</h3>
                        <p className="text-muted-foreground">Your reports are preserved, but access might be limited based on your new tier's storage policy.</p>
                    </div>
                </div>
            </div>

        </div>
    )
}
