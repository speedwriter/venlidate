'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ScoreImprovementBannerProps {
    currentScore: number
    previousScore: number
}

export function ScoreImprovementBanner({ currentScore, previousScore }: ScoreImprovementBannerProps) {
    const improvement = currentScore - previousScore
    const percentChange = ((improvement / previousScore) * 100).toFixed(1)

    if (improvement > 0) {
        return (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/50 mb-6">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300 font-semibold mb-1">
                    Grid progress! Score increased by {improvement} points
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                    <span className="block mb-1">
                        Your score went from {previousScore} to {currentScore} ({percentChange}% improvement).
                    </span>
                    Keep going - answer the remaining questions to reach 70+!
                </AlertDescription>
            </Alert>
        )
    }

    if (improvement < 0) {
        return (
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/50 mb-6">
                <TrendingDown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-300 font-semibold mb-1">
                    Score decreased by {Math.abs(improvement)} points
                </AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    <span className="block mb-1">
                        Your score went from {previousScore} to {currentScore}.
                    </span>
                    This might mean your assumptions need more work. Review the thinking questions.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/50 mb-6">
            <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold mb-1">
                Your score stayed the same
            </AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
                Make sure you&apos;ve validated the assumptions before re-validating.
            </AlertDescription>
        </Alert>
    )
}
