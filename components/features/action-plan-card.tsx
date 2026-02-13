'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Target, Calendar, CheckCircle, ListTodo, ChevronRight, Zap } from 'lucide-react'
import type { ActionPlan } from '@/types/validations'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ActionPlanCardProps {
    actionPlan: ActionPlan
    tier: 'pro' | 'premium'
}

export function ActionPlanCard({ actionPlan, tier }: ActionPlanCardProps) {
    const [checkedPriorities, setCheckedPriorities] = useState<Set<number>>(new Set())

    const togglePriority = (rank: number) => {
        const newChecked = new Set(checkedPriorities)
        if (newChecked.has(rank)) {
            newChecked.delete(rank)
        } else {
            newChecked.add(rank)
        }
        setCheckedPriorities(newChecked)
    }

    const progress = (checkedPriorities.size / actionPlan.priorities.length) * 100

    return (
        <Card className={cn(
            "relative overflow-hidden border-2 transition-all duration-300",
            tier === 'premium'
                ? "border-purple-500/50 shadow-purple-500/10 shadow-xl"
                : "border-blue-500/50 shadow-blue-500/10 shadow-xl"
        )}>
            {/* Premium Gradient Overlay */}
            <div className={cn(
                "absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 opacity-10 rounded-full blur-3xl",
                tier === 'premium' ? "bg-purple-500" : "bg-blue-500"
            )} />

            <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className={cn(
                        "flex items-center gap-1 py-1 px-3",
                        tier === 'premium'
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    )}>
                        <Zap className="h-3 w-3 fill-current" />
                        {tier.toUpperCase()} FEATURE
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {actionPlan.overallTimeline}
                    </span>
                </div>
                <CardTitle className="text-2xl font-black">Your Personalized Action Plan</CardTitle>
                <CardDescription className="text-base">
                    Based on your validation results, here is your step-by-step roadmap to launch.
                </CardDescription>
            </CardHeader>

            <CardContent className="relative space-y-8">
                {/* Progress Tracking */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4" />
                            {checkedPriorities.size} of {actionPlan.priorities.length} priorities completed
                        </span>
                        <span className={cn(
                            tier === 'premium' ? "text-purple-600" : "text-blue-600"
                        )}>
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-2"
                        indicatorClassName={cn(
                            tier === 'premium' ? "bg-purple-600" : "bg-blue-600"
                        )}
                    />
                </div>

                {/* Priorities Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        Priority Checklist
                    </h3>

                    <div className="space-y-6">
                        {actionPlan.priorities.map((priority) => (
                            <div
                                key={priority.rank}
                                onClick={() => togglePriority(priority.rank)}
                                className={cn(
                                    "group p-6 rounded-2xl border transition-all cursor-pointer relative",
                                    checkedPriorities.has(priority.rank)
                                        ? "bg-muted/50 border-muted opacity-70"
                                        : "bg-card border-border hover:shadow-md hover:border-primary/50"
                                )}
                            >
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center font-black text-sm transition-colors",
                                            checkedPriorities.has(priority.rank)
                                                ? "bg-green-500 text-white"
                                                : "bg-secondary text-secondary-foreground"
                                        )}>
                                            {checkedPriorities.has(priority.rank) ? <CheckCircle className="h-5 w-5" /> : priority.rank}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter">
                                                {priority.dimension}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                ~{priority.estimatedDays} days
                                            </span>
                                        </div>

                                        <div>
                                            <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                {priority.issue}
                                            </p>
                                            <p className={cn(
                                                "mt-2 text-primary font-medium flex items-center gap-1.5 p-2 rounded-lg",
                                                tier === 'premium' ? "bg-purple-50" : "bg-blue-50"
                                            )}>
                                                <ChevronRight className="h-4 w-4" />
                                                {priority.criticalQuestion}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                                                    <Target className="h-3 w-3" />
                                                    Validation Method
                                                </p>
                                                <p className="text-sm leading-relaxed">{priority.validationMethod}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Success Criteria
                                                </p>
                                                <p className="text-sm leading-relaxed">{priority.successCriteria}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Readiness Criteria Section */}
                <Card className="bg-muted/30 border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            You&apos;re Ready to Build When...
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {actionPlan.readinessCriteria}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}
