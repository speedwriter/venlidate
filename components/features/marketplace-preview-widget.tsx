'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock } from 'lucide-react'

// Mock Data for Preview Widget - keeping it static for reliability/performance on pricing page
const PREVIEW_IDEAS = [
    {
        id: 1,
        title: "AI-Powered Legal Document Review for SMBs",
        score: 87,
        trafficLight: 'green',
        industry: 'LegalTech'
    },
    {
        id: 2,
        title: "Sustainable Packaging Marketplace for E-commerce",
        score: 79,
        trafficLight: 'green',
        industry: 'Sustainability'
    },
    {
        id: 3,
        title: "Micro-SaaS Acquisition Platform",
        score: 74,
        trafficLight: 'yellow',
        industry: 'FinTech'
    }
]

export function MarketplacePreviewWidget() {
    return (
        <section className="py-12 bg-muted/30 w-full rounded-xl my-16 border">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
                    <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
                        📣 New: Idea Marketplace
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
                        Real Ideas. Real Data.
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        See what others are validating. Get inspired by high-potential opportunities.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                    {PREVIEW_IDEAS.map((idea) => (
                        <Card key={idea.id} className="flex flex-col h-full bg-card hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline">{idea.industry}</Badge>
                                    <div className={`flex items-center px-2 py-0.5 rounded text-xs font-bold ${idea.trafficLight === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            idea.trafficLight === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        Score: {idea.score}
                                    </div>
                                </div>
                                <CardTitle className="text-lg line-clamp-2 leading-tight">
                                    {idea.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow pb-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-3 w-3" />
                                        <span>Full analysis locked</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-3 w-3" />
                                        <span>Competitor data locked</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="ghost" className="w-full justify-between group h-auto py-2 px-0 hover:bg-transparent hover:text-primary">
                                    Preview Idea
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Button asChild size="lg" className="rounded-full px-8">
                        <Link href="/ideas">
                            Browse 200+ More Ideas <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
