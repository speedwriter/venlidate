'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrafficLight } from "./traffic-light"
import { Button } from "@/components/ui/button"
import { RefreshCw, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { revalidateIdea } from "@/app/actions/ideas"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"


interface ValidationSummaryProps {
    ideaId: string
    overallScore: number
    trafficLight: 'red' | 'yellow' | 'green'
    questionCount: number
}

export function ValidationSummary({ ideaId, overallScore, trafficLight, questionCount }: ValidationSummaryProps) {
    const [isRevalidating, setIsRevalidating] = useState(false)
    const router = useRouter()

    const handleRevalidate = () => {
        router.push(`/dashboard/${ideaId}/revalidate`)
    }

    const getStatusInfo = () => {
        if (overallScore >= 70) {
            return {
                title: "Your idea is ready to build! 🎉",
                description: "You've hit the validation threshold. Focus on your first customers.",
                color: "text-green-700",
                bg: "bg-green-50"
            }
        } else if (overallScore >= 50) {
            return {
                title: "Your idea has potential.",
                description: `Answer the ${questionCount} questions, update your inputs and revalidate your idea to move closer towards your ideal startup!`,
                color: "text-amber-700",
                bg: "bg-amber-50"
            }
        } else {
            return {
                title: "Your idea needs significant work.",
                description: `Answer the ${questionCount} questions, update your inputs and revalidate your idea to move closer towards your ideal startup!`,
                color: "text-red-700",
                bg: "bg-red-50"
            }
        }
    }

    const info = getStatusInfo()

    return (
        <Card className="overflow-hidden border-2 mb-8">
            <CardContent className="p-0">
                <div className={cn("p-6 flex flex-col md:flex-row items-center gap-6", info.bg)}>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl font-black tracking-tighter tabular-nums drop-shadow-sm" style={{
                            color: trafficLight === 'green' ? '#15803d' : trafficLight === 'yellow' ? '#b45309' : '#b91c1c'
                        }}>
                            {overallScore}
                        </div>
                        <TrafficLight trafficLight={trafficLight} />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-1">
                        <h3 className={cn("text-xl font-black tracking-tight", info.color)}>{info.title}</h3>
                        <p className="text-sm text-foreground/70 font-medium">{info.description}</p>
                        {questionCount > 0 && (
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {questionCount} thinking questions
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <Button
                            asChild
                            className="bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-all gap-2"
                        >
                            <Link href={`/dashboard/${ideaId}/revalidate`}>
                                <RefreshCw className="h-4 w-4" />
                                Re-validate Idea
                            </Link>
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground font-medium">
                            Great! Re-validate your idea with revised inputs and answers to see if your score improved.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
