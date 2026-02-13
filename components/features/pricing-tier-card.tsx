'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createCheckoutSession } from '@/app/actions/stripe'
import { useRouter } from 'next/navigation'
import { CheckIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PricingTierCardProps {
    name: string
    price: string
    billingPeriod: string
    annualPrice?: string
    description: string
    features: string[]
    cta: string
    highlighted: boolean
    priceId?: string
    tier?: 'free' | 'pro' | 'premium'
    isCurrentPlan: boolean
    billingCycle: 'monthly' | 'annual'
    onBillingCycleChange: (cycle: 'monthly' | 'annual') => void
}

export default function PricingTierCard({
    name,
    price,
    billingPeriod,
    annualPrice,
    description,
    features,
    cta,
    highlighted,
    priceId,
    tier,
    isCurrentPlan,
    billingCycle,
    onBillingCycleChange,
}: PricingTierCardProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleCheckout() {
        if (!priceId || !tier || tier === 'free') return

        setIsLoading(true)

        try {
            const result = await createCheckoutSession(priceId, tier)

            if (!result.success) {
                // If user is not authenticated, redirect to signup with plan parameter
                if (result.error === 'Not authenticated') {
                    router.push(`/signup?plan=${tier}`)
                    return
                }

                throw new Error(result.error || 'Failed to create checkout session')
            }

            if (!result.url) {
                throw new Error('Failed to create checkout session')
            }

            // Redirect to Stripe Checkout
            window.location.href = result.url
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Failed to start checkout. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card
            className={cn(
                "relative flex flex-col h-full transition-all duration-300 hover:shadow-xl",
                highlighted ? "border-primary border-2 shadow-lg scale-105 z-10" : "border-border"
            )}
        >
            {highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-bold px-4 py-1">
                        Most Popular
                    </Badge>
                </div>
            )}

            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
                        <CardDescription className="mt-2 min-h-[40px]">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col">
                <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight">{price}</span>
                        <span className="text-muted-foreground">/{billingPeriod}</span>
                    </div>

                    {/* Show annual savings if applicable */}
                    {annualPrice && billingCycle === 'annual' && tier !== 'free' && (
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground line-through">
                                    {tier === 'pro' ? '$39' : '$79'}/month
                                </span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    Save {tier === 'pro' ? '$78' : '$156'}/year
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Billed {tier === 'pro' ? '$390' : '$790'} annually
                            </p>
                        </div>
                    )}
                </div>

                <ul className="space-y-3 mb-8">
                    {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                            <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-foreground/80">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="pt-6">
                {isCurrentPlan ? (
                    <Button
                        className="w-full font-bold h-11"
                        variant="outline"
                        disabled
                    >
                        Current Plan
                    </Button>
                ) : tier === 'free' || !priceId ? (
                    <Button
                        asChild
                        className="w-full font-bold h-11"
                        variant="outline"
                    >
                        <Link href="/signup">{cta}</Link>
                    </Button>
                ) : (
                    <Button
                        className={cn(
                            "w-full font-bold h-11 transition-all duration-200",
                            highlighted && "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:scale-105"
                        )}
                        variant={highlighted ? "default" : "outline"}
                        disabled={isLoading}
                        onClick={handleCheckout}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {cta}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
