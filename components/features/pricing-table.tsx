'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface PricingTier {
    name: string
    price: string
    billingPeriod: string
    annualPrice?: string
    description: string
    features: string[]
    cta: string
    highlighted: boolean
}

interface PricingTableProps {
    currentTier: string
    pricingTiers: PricingTier[]
}

export function PricingTable({ currentTier, pricingTiers }: PricingTableProps) {
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
        </div>
    )
}
