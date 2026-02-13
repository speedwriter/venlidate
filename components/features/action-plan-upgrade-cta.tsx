'use client'

import React from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'


export function ActionPlanUpgradeCTA() {
    return (
        <Card className="relative overflow-hidden border-dashed border-2 bg-muted/5 p-4 md:p-8">
            <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(to_bottom,white,transparent)] dark:bg-grid-slate-800/50" />

            <div className="relative flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Lock className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-4">
                    <Badge variant="outline" className="py-1 px-3 border-primary/30 text-primary bg-primary/5 uppercase tracking-wider text-[10px] font-black">
                        Pro & Premium Feature
                    </Badge>
                    <CardTitle className="text-3xl md:text-4xl font-black tracking-tight">
                        Unlock Your Personalized Roadmap
                    </CardTitle>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Don&apos;t leave your launch to chance. Get a step-by-step
                        action plan tailored specifically to your idea&apos;s weaknesses and score.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                    {[
                        "Top 3 Prioritized Next Steps",
                        "Specific Validation Methods",
                        "Timeline & Readiness Estimates",
                        "Risk De-risking Strategy"
                    ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 font-medium">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            {benefit}
                        </div>
                    ))}
                </div>

                <div className="w-full pt-4 space-y-4">
                    <div className="relative p-6 rounded-2xl bg-background border border-border shadow-sm overflow-hidden group">
                        {/* Fake blurred preview */}
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <Lock className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2 opacity-10">
                            <div className="h-4 w-3/4 bg-muted rounded" />
                            <div className="h-4 w-1/2 bg-muted rounded" />
                            <div className="h-20 w-full bg-muted rounded" />
                        </div>
                    </div>

                    <Link href="/dashboard/subscription" className="block w-full">
                        <Button size="lg" className="w-full h-14 text-lg font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                            <Zap className="h-5 w-5 fill-current" />
                            Upgrade to Pro to Unlock
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                        Includes unlimited validations, priority roadmap, and detailed competitor analysis.
                    </p>
                </div>
            </div>
        </Card>
    )
}
