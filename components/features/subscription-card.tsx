'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SubscriptionTier, TIER_LIMITS } from '@/types/subscriptions'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { ManageSubscriptionButton } from './manage-subscription-button'

interface SubscriptionCardProps {
    userId: string
    tier: SubscriptionTier
    status: string
    validationsUsed: number
    iterationsUsed?: Record<string, number> // Not strictly needed for simple progress
    totalValidations: number | 'unlimited'
    currentPeriodEnd?: string
    stripeCustomerId?: string | null
}

export function SubscriptionCard({
    tier,
    status,
    validationsUsed,
    totalValidations,
    currentPeriodEnd,
    stripeCustomerId,
}: SubscriptionCardProps) {
    const limits = TIER_LIMITS[tier]

    const getTierColor = (tier: SubscriptionTier) => {
        switch (tier) {
            case 'premium':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'pro':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    const progressValue = totalValidations === 'unlimited'
        ? 0
        : Math.min(100, (validationsUsed / totalValidations) * 100)


    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Your Plan</CardTitle>
                        <CardDescription>Manage your subscription and usage</CardDescription>
                    </div>
                    <Badge className={getTierColor(tier)}>
                        {tier.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <span className="capitalize text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            {status}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Monthly Validations</span>
                        <span className="font-medium">
                            {validationsUsed} of {totalValidations === 'unlimited' ? '∞' : totalValidations} used
                        </span>
                    </div>
                    <Progress value={totalValidations === 'unlimited' ? 100 : progressValue} className="h-2" />
                    {totalValidations !== 'unlimited' && progressValue >= 80 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Nearly at your limit. Consider upgrading.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Iterations</p>
                        <p className="text-lg font-bold">
                            {limits.iterationsPerIdea === 'unlimited' ? 'Unlimited' : limits.iterationsPerIdea}
                        </p>
                        <p className="text-[10px] text-slate-400">per idea</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Storage</p>
                        <p className="text-lg font-bold">
                            {limits.reportStorageDays === 'unlimited' ? 'Forever' : `${limits.reportStorageDays} Days`}
                        </p>
                        <p className="text-[10px] text-slate-400">report history</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {tier === 'free' ? (
                    <Button asChild className="w-full">
                        <Link href="/dashboard/subscription">
                            Upgrade Now
                        </Link>
                    </Button>
                ) : (stripeCustomerId || tier === 'premium' || tier === 'pro') ? (
                    <ManageSubscriptionButton
                        tier={tier}
                        currentPeriodEnd={currentPeriodEnd}
                        className="w-full"
                    />
                ) : (
                    <Button variant="secondary" className="w-full" disabled>
                        Contact Support to Manage
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
