'use client'

import { CheckCircle2, RefreshCcw, ArrowRight, Share2, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ShareIdeaModal } from './share-idea-modal'


interface NextStepsCardProps {
    score: number
    tier: 'free' | 'pro' | 'premium'
    ideaId: string
    validationId: string
    unansweredQuestionsCount: number
    hasActionPlan: boolean
}

export function NextStepsCard({
    score,
    tier,
    ideaId,
    validationId,
    unansweredQuestionsCount,
    hasActionPlan
}: NextStepsCardProps) {
    const router = useRouter()

    // 1. HIGH SCORE (>= 70) - Ready to build
    if (score >= 70) {
        return (
            <Card className="border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Your idea is ready for the next stage!
                    </CardTitle>
                    <CardDescription>
                        You&apos;ve validated the core assumptions. Now it&apos;s time to execute.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <div className="bg-green-200 dark:bg-green-800 rounded-full p-1 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-green-700 dark:text-green-300" />
                            </div>
                            <span className="text-sm">Build a Minimum Viable Product (MVP)</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-green-200 dark:bg-green-800 rounded-full p-1 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-green-700 dark:text-green-300" />
                            </div>
                            <span className="text-sm">Get your first 10 paying customers</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-green-200 dark:bg-green-800 rounded-full p-1 mt-0.5">
                                <CheckCircle2 className="h-3 w-3 text-green-700 dark:text-green-300" />
                            </div>
                            <span className="text-sm">Share your validated idea to get feedback</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="gap-3">
                    <ShareIdeaModal
                        validationId={validationId}
                        trigger={
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Verified Idea
                            </Button>
                        }
                    />
                </CardFooter>
            </Card>
        )
    }

    // 2. MEDIUM SCORE (50-69) - Needs iteration
    if (score >= 50) {
        // If they have unanswered thinking questions, push them there
        if (unansweredQuestionsCount > 0) {
            return (
                <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <RefreshCcw className="h-5 w-5" />
                            Iterate to improve your score
                        </CardTitle>
                        <CardDescription>
                            You&apos;re close! Tackle the risks identified to reach the green zone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-4">
                            You have <span className="font-semibold">{unansweredQuestionsCount} critical questions</span> provided in Scores Breakdown.
                            Answering these questions and validating these assumptions is the fastest way to improve your score.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={() => router.push(`/dashboard/${ideaId}/revalidate`)}
                        >
                            Improve your idea inputs and revalidate!
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )
        }

        // If questions answered, prompt re-validation
        return (
            <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-900/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                        <RefreshCcw className="h-5 w-5" />
                        Ready to re-validate?
                    </CardTitle>
                    <CardDescription>
                        You&apos;ve analyzed the risks. Now let&apos;s see if your score improved.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">
                        Update your idea definition based on your improved understanding of the risks and customer needs.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={() => router.push(`/new-idea?prefill=${ideaId}`)}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Re-validate Idea
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    // 3. LOW SCORE (< 50) - Significant pivot needed
    return (
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <RefreshCcw className="h-5 w-5" />
                    Significant changes recommended
                </CardTitle>
                <CardDescription>
                    The current approach has fundamental risks. Focus on the basics.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm">
                    {hasActionPlan ? (
                        <>Favor the &quot;Killer Feature&quot; and &quot;Target Customer&quot; sections. Your custom action plan has specific steps to fix these issues.</>
                    ) : (
                        tier === 'free' ? (
                            <>Favor the &quot;Killer Feature&quot; and &quot;Target Customer&quot; sections. Upgrade to Pro to get a detailed Action Plan for fixing these issues.</>
                        ) : (
                            <>Favor the &quot;Killer Feature&quot; and &quot;Target Customer&quot; sections. An Action Plan would give you a step-by-step pivot guide.</>
                        )
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
                {hasActionPlan ? (
                    <Button
                        variant="default"
                        className="w-full"
                        onClick={() => {
                            document.getElementById('action-plan')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        View Action Plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="w-full border-red-200 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                        onClick={() => router.push('/dashboard/subscription')}
                    >
                        <Lock className="mr-2 h-4 w-4" />
                        Unlock Action Plan
                    </Button>
                )}

                <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => router.push(`/new-idea?prefill=${ideaId}`)}
                >
                    Try a Pivot (Re-validate)
                </Button>
            </CardFooter>
        </Card>
    )
}
