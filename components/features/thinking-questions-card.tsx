'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Lightbulb, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ThinkingQuestionsCardProps {
    questions: string[]
    dimensionName: string
    score: number
}

export function ThinkingQuestionsCard({ questions, dimensionName, score }: ThinkingQuestionsCardProps) {
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())

    function toggleAnswered(index: number) {
        const newSet = new Set(answeredQuestions)
        if (newSet.has(index)) {
            newSet.delete(index)
        } else {
            newSet.add(index)
        }
        setAnsweredQuestions(newSet)
    }

    const allAnswered = answeredQuestions.size === questions.length

    return (
        <Card className="border-amber-200 bg-amber-50/50 overflow-hidden mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader className="bg-amber-100/50 pb-3 border-b border-amber-100">
                <CardTitle className="flex items-center gap-2 text-amber-800 text-sm font-bold">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    How to Improve This Score ({score}/10)
                </CardTitle>
                <p className="text-amber-700/80 text-xs mt-1">
                    Answer these questions to strengthen your <span className="font-bold">{dimensionName}</span>
                </p>
            </CardHeader>
            <CardContent className="pt-4">
                <ul className="space-y-3">
                    {questions.map((question, index) => (
                        <li
                            key={index}
                            className="flex gap-3 cursor-pointer group"
                            onClick={() => toggleAnswered(index)}
                        >
                            <div className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                answeredQuestions.has(index)
                                    ? "bg-amber-500 border-amber-500 text-white"
                                    : "border-amber-300 bg-white group-hover:border-amber-400"
                            )}>
                                {answeredQuestions.has(index) && <CheckCircle2 className="h-3 w-3" />}
                            </div>
                            <span className={cn(
                                "text-sm leading-relaxed transition-all",
                                answeredQuestions.has(index) ? "text-amber-900/50 line-through" : "text-amber-900"
                            )}>
                                {question}
                            </span>
                        </li>
                    ))}
                </ul>

                {allAnswered && (
                    <div className="mt-4 p-3 bg-amber-200/50 rounded-xl flex items-center gap-2 text-amber-900 text-xs font-bold animate-in zoom-in duration-300">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                        Great! Re-validate your idea with revised inputs and answers to see if your score improved.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
