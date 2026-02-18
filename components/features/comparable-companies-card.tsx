'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, TrendingUp, TrendingDown, Lightbulb, Target, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import type { ComparableCompany } from '@/types/validations'
import { useState, useEffect } from 'react'

interface ComparableCompaniesCardProps {
    companies: ComparableCompany[]
    userTier: 'free' | 'pro' | 'premium'
}

export function ComparableCompaniesCard({ companies, userTier }: ComparableCompaniesCardProps) {
    const [appliedLessons, setAppliedLessons] = useState<Set<string>>(() => {
        // Load from localStorage during initialization (Client Side Only)
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('appliedLessons')
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    if (Array.isArray(parsed)) {
                        return new Set(parsed)
                    }
                } catch (e) {
                    console.error('Failed to parse applied lessons:', e)
                }
            }
        }
        return new Set()
    })

    function toggleLesson(companyName: string, lessonIndex: number) {
        const key = `${companyName}-${lessonIndex}`
        const newSet = new Set(appliedLessons)
        if (newSet.has(key)) {
            newSet.delete(key)
        } else {
            newSet.add(key)
        }
        setAppliedLessons(newSet)

        // Save to localStorage
        localStorage.setItem('appliedLessons', JSON.stringify(Array.from(newSet)))
    }

    if (companies.length === 0) {
        return (
            <Card className="p-8 text-center bg-muted/30 border-dashed">
                <p className="text-muted-foreground italic">No comparable companies found for this idea.</p>
            </Card>
        )
    }

    const totalApplied = appliedLessons.size

    return (
        <div className="space-y-4">
            {companies.map((company) => (
                <Card key={company.name} className="overflow-hidden">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    {company.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {company.situation || "Legacy validation - re-run to see details"}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {company.situation?.toLowerCase().includes('successful') && (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Successful</Badge>
                                )}
                                {company.situation?.toLowerCase().includes('failed') && (
                                    <Badge variant="destructive">Failed</Badge>
                                )}
                                {company.situation?.toLowerCase().includes('acquired') && (
                                    <Badge variant="secondary">Acquired</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Legacy Data Notice */}
                        {!company.situation && !company.whatWorked && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                                <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                    <Lightbulb className="h-3 w-3 text-amber-600" />
                                    <span>
                                        New enhanced insights are available for this company.
                                        <Link href="#revalidate" className="font-bold underline ml-1">Re-run validation</Link> to see the full analysis.
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* FREE TIER: Show description only */}
                        {userTier === 'free' && (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    {company.description || company.similarity || "Learn from this company's journey in your space."}
                                </p>

                                {/* Upgrade CTA */}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                                        <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Unlock Detailed Insights</p>
                                            <p className="text-sm text-muted-foreground mt-1 text-xs">
                                                See what worked, what didn&apos;t, and get actionable lessons for your idea
                                            </p>
                                            <Button size="sm" variant="outline" className="mt-3 h-8 text-xs" asChild>
                                                <Link href="/pricing">Upgrade to Pro</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* PRO/PREMIUM TIER: Show full analysis */}
                        {userTier !== 'free' && (
                            <>
                                {/* What Worked */}
                                {company.whatWorked && company.whatWorked.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            What Worked
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {company.whatWorked.map((item, idx) => (
                                                <li key={idx} className="text-sm flex items-start gap-2">
                                                    <span className="text-emerald-600 mt-1 text-[10px]">✓</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* What Didn't Work */}
                                {company.whatDidntWork && company.whatDidntWork.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                            <TrendingDown className="h-4 w-4 text-rose-600" />
                                            What Didn&apos;t Work
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {company.whatDidntWork.map((item, idx) => (
                                                <li key={idx} className="text-sm flex items-start gap-2">
                                                    <span className="text-rose-600 mt-1 text-[10px]">✗</span>
                                                    <span className="text-muted-foreground">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Lessons For You */}
                                {company.lessonsForYou && company.lessonsForYou.length > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-amber-900 dark:text-amber-100">
                                            <Lightbulb className="h-4 w-4 text-amber-600" />
                                            Lessons for Your Idea
                                        </h4>
                                        <ul className="space-y-3">
                                            {company.lessonsForYou.map((lesson, idx) => {
                                                const lessonKey = `${company.name}-${idx}`
                                                const isApplied = appliedLessons.has(lessonKey)

                                                return (
                                                    <li key={idx} className="text-sm flex items-start gap-3">
                                                        <Checkbox
                                                            id={lessonKey}
                                                            checked={isApplied}
                                                            onCheckedChange={() => toggleLesson(company.name, idx)}
                                                            className="mt-0.5 border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                                        />
                                                        <label
                                                            htmlFor={lessonKey}
                                                            className={`cursor-pointer flex-1 leading-tight transition-all duration-200 ${isApplied
                                                                ? 'line-through text-amber-900/40 dark:text-amber-100/40'
                                                                : 'font-medium text-amber-900 dark:text-amber-100'
                                                                }`}
                                                        >
                                                            {lesson}
                                                        </label>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        {totalApplied > 0 && (
                                            <div className="mt-4 pt-3 border-t border-amber-200/50 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                                                <div className="bg-amber-200 dark:bg-amber-800 rounded-full p-0.5">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                </div>
                                                ✓ You&apos;re testing {totalApplied} lesson{totalApplied !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Key Metric */}
                                {company.keyMetric && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3 border-dashed">
                                        <Target className="h-4 w-4" />
                                        <span className="font-medium">Key Metric:</span>
                                        <span>{company.keyMetric}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
