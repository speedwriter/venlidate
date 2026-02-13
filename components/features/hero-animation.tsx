'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, ArrowRight, TrendingUp, Lightbulb, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HeroAnimation() {
    const [phase, setPhase] = useState<'before' | 'transform' | 'after'>('before')

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase(current => {
                if (current === 'before') return 'transform'
                if (current === 'transform') return 'after'
                return 'before'
            })
        }, 4000) // 4 second cycle

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative w-full max-w-md mx-auto aspect-[4/3] perspective-1000">
            {/* Background elements for depth */}
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
