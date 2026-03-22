'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, ArrowRight, TrendingUp, Lightbulb, Target, Lock, Zap, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

type AnimPhase = 'before' | 'transform' | 'after' | 'roadmap'

export function HeroAnimation() {
    const [phase, setPhase] = useState<AnimPhase>('before')

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase(current => {
                if (current === 'before') return 'transform'
                if (current === 'transform') return 'after'
                if (current === 'after') return 'roadmap'
                return 'before'
            })
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative w-full max-w-md mx-auto aspect-[4/3] perspective-1000">
            <div className="absolute inset-x-4 top-4 bottom-[-16px] bg-slate-900/5 rounded-2xl blur-xl transform translate-y-4" />

            <div className="relative h-full w-full grid place-items-center">

                {/* Before Card */}
                <div
                    className={cn(
                        "absolute w-full transition-all duration-700 ease-in-out transform",
                        phase === 'before'
                            ? "opacity-100 translate-x-0 scale-100 z-20"
                            : "opacity-0 -translate-x-12 scale-95 z-10"
                    )}
                >
                    <ValidationCard
                        score={52}
                        color="yellow"
                        title="My Startup Idea"
                        feedback={[
                            { icon: AlertTriangle, text: "Weak differentiation", color: "text-yellow-600" },
                            { icon: AlertTriangle, text: "Unclear revenue model", color: "text-yellow-600" },
                            { icon: Lightbulb, text: "Who is the customer?", color: "text-slate-400" }
                        ]}
                    />
                </div>

                {/* Transition Arrow */}
                <div
                    className={cn(
                        "absolute z-30 flex flex-col items-center justify-center transition-all duration-500",
                        phase === 'transform' ? "opacity-100 scale-110" : "opacity-0 scale-50"
                    )}
                >
                    <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-xl">
                        <ArrowRight className="w-8 h-8" />
                    </div>
                    <span className="mt-2 font-bold text-sm bg-white/90 px-3 py-1 rounded-full shadow-sm text-slate-600">
                        2 Weeks Later
                    </span>
                </div>

                {/* After Card */}
                <div
                    className={cn(
                        "absolute w-full transition-all duration-700 ease-in-out transform",
                        phase === 'after'
                            ? "opacity-100 translate-x-0 scale-100 z-20"
                            : phase === 'roadmap'
                                ? "opacity-0 -translate-x-12 scale-95 z-10"
                                : phase === 'transform'
                                    ? "opacity-0 translate-x-12 scale-95 z-10"
                                    : "opacity-0 translate-x-24 scale-90 z-0"
                    )}
                >
                    <ValidationCard
                        score={74}
                        color="green"
                        title="My Startup Idea (v2)"
                        feedback={[
                            { icon: CheckCircle, text: "Waitlist growth strategy", color: "text-green-600" },
                            { icon: CheckCircle, text: "Recurring revenue model", color: "text-green-600" },
                            { icon: Target, text: "Niche market identified", color: "text-green-600" }
                        ]}
                    />
                </div>

                {/* Roadmap Card */}
                <div
                    className={cn(
                        "absolute w-full transition-all duration-700 ease-in-out transform",
                        phase === 'roadmap'
                            ? "opacity-100 translate-x-0 scale-100 z-20"
                            : phase === 'before'
                                ? "opacity-0 -translate-x-12 scale-95 z-10"
                                : "opacity-0 translate-x-12 scale-95 z-10"
                    )}
                >
                    <RoadmapCard />
                </div>
            </div>
        </div>
    )
}

function ValidationCard({ score, color, title, feedback }: {
    score: number
    color: 'yellow' | 'green'
    title: string
    feedback: { icon: React.ElementType, text: string, color: string }[]
}) {
    const isGreen = color === 'green'

    return (
        <Card className="shadow-2xl border-slate-200/60 bg-white/95 backdrop-blur overflow-hidden">
            <div className={cn("h-1.5 w-full", isGreen ? "bg-green-500" : "bg-yellow-500")} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Validation Report</div>
                        <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
                    </div>
                    <div className={cn(
                        "flex flex-col items-center justify-center w-16 h-16 rounded-xl border-4",
                        isGreen ? "border-green-100 bg-green-50 text-green-700" : "border-yellow-100 bg-yellow-50 text-yellow-700"
                    )}>
                        <span className="text-2xl font-bold">{score}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {feedback.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                            <item.icon className={cn("w-4 h-4 shrink-0", item.color)} />
                            <span className="text-sm font-medium text-slate-700">{item.text}</span>
                        </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>AI Analysis Confidence</span>
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <TrendingUp className="w-3 h-3" /> High
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const ROADMAP_PHASES = [
    { number: 1, label: 'Problem Validation',  status: 'done'   },
    { number: 2, label: 'Customer Discovery',  status: 'done'   },
    { number: 3, label: 'Solution Testing',    status: 'active' },
    { number: 4, label: 'Revenue Model',       status: 'locked' },
    { number: 5, label: 'First Customer',      status: 'locked' },
]

function RoadmapCard() {
    return (
        <Card className="shadow-2xl border-slate-200/60 bg-white/95 backdrop-blur overflow-hidden">
            <div className="h-1.5 w-full bg-indigo-500" />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Execution Roadmap</div>
                        <CardTitle className="text-lg text-slate-900">My Startup Idea (v2)</CardTitle>
                    </div>
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border-4 border-indigo-100 bg-indigo-50 text-indigo-700">
                        <MapPin className="w-5 h-5 mb-0.5" />
                        <span className="text-xs font-bold leading-none">P3</span>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Overall progress</span>
                        <span className="font-semibold text-slate-700">40%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[40%] bg-indigo-500 rounded-full" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-1.5">
                    {ROADMAP_PHASES.map(p => (
                        <div
                            key={p.number}
                            className={cn(
                                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm",
                                p.status === 'done'   && "bg-green-50",
                                p.status === 'active' && "bg-indigo-50 ring-1 ring-indigo-200",
                                p.status === 'locked' && "bg-slate-50 opacity-60"
                            )}
                        >
                            {p.status === 'done' && (
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            )}
                            {p.status === 'active' && (
                                <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            )}
                            {p.status === 'locked' && (
                                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className={cn(
                                "font-medium",
                                p.status === 'done'   && "text-green-700",
                                p.status === 'active' && "text-indigo-700",
                                p.status === 'locked' && "text-slate-400"
                            )}>
                                {p.label}
                            </span>
                            {p.status === 'active' && (
                                <span className="ml-auto text-xs text-indigo-500 font-semibold">Sprint 1</span>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
