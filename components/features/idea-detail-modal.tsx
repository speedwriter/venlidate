'use client'

import * as React from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrafficLight } from './traffic-light'
import {
    Lock,
    Sparkles,
    ShieldCheck,
    AlertTriangle,
    Target,
    Zap,
    Users,
    TrendingUp,
    Clock,
    BarChart
} from 'lucide-react'
import Link from 'next/link'
import { ActionPlanCard } from './action-plan-card'
import { ActionPlanUpgradeCTA } from './action-plan-upgrade-cta'
import { cn } from '@/lib/utils'
import { ActionPlan } from '@/types/validations'

export interface SharedIdeaDetail {
    id: string
    title: string
    problem: string
    target_customer: string
    overall_score: number
    traffic_light: 'red' | 'yellow' | 'green'
    validations?: Array<{
        [key: string]: unknown
        painkiller_score: number
        revenue_model_score: number
        acquisition_score: number
        moat_score: number
        founder_fit_score: number
        time_to_revenue_score: number
        scalability_score: number
        painkiller_reasoning: string
        revenue_model_reasoning: string
        acquisition_reasoning: string
        moat_reasoning: string
        founder_fit_reasoning: string
        time_to_revenue_reasoning: string
        scalability_reasoning: string
        red_flags: string[]
        comparable_companies: Array<{ name: string, outcome: string }>
        recommendations: string[]
        action_plan: ActionPlan | null
    }>
}

interface IdeaDetailModalProps {
    sharedIdea: SharedIdeaDetail
    isAuthenticated: boolean
    userTier: 'free' | 'pro' | 'premium'
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function IdeaDetailModal({
    sharedIdea,
    isAuthenticated,
    userTier,
    isOpen,
    onOpenChange
}: IdeaDetailModalProps) {
    const isPro = userTier === 'pro' || userTier === 'premium'
    const isPremium = userTier === 'premium'

    const truncate = (text: string, sentences: number = 2) => {
        if (!text) return ''
        const parts = text.split(/[.!?]/).filter(p => p.trim().length > 0)
        if (parts.length <= sentences) return text
        return parts.slice(0, sentences).join('.') + '...'
    }

    const problemDisplay = isAuthenticated ? sharedIdea.problem : truncate(sharedIdea.problem)
    const targetCustomerDisplay = isAuthenticated ? sharedIdea.target_customer : truncate(sharedIdea.target_customer, 1)

    const dimensions = [
        { name: 'Painkiller', key: 'painkiller_score', icon: Zap },
        { name: 'Revenue Model', key: 'revenue_model_score', icon: TrendingUp },
        { name: 'Acquisition', key: 'acquisition_score', icon: Target },
        { name: 'Moat', key: 'moat_score', icon: ShieldCheck },
        { name: 'Founder Fit', key: 'founder_fit_score', icon: Users },
        { name: 'Time to Revenue', key: 'time_to_revenue_score', icon: Clock },
        { name: 'Scalability', key: 'scalability_score', icon: BarChart },
    ]

    const validation = Array.isArray(sharedIdea.validations)
        ? sharedIdea.validations[0]
        : sharedIdea.validations

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] md:w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
                <div className="relative">
                    {/* Header Image Gradient */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 w-full" />


                    <div className="px-6 pb-8 -mt-16">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                <div className="space-y-2">
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black text-blue-600 bg-blue-50 border-blue-100">
                                        Community Shared Idea
                                    </Badge>
                                    <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight">
                                        {sharedIdea.title}
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">
                                        Details and AI analysis for the shared idea: {sharedIdea.title}
                                    </DialogDescription>
                                    <div className="flex items-center gap-3">
                                        <TrafficLight trafficLight={sharedIdea.traffic_light} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Overall Score</p>
                                    <p className="text-5xl font-black text-blue-600 tracking-tighter">
                                        {sharedIdea.overall_score}<span className="text-2xl text-slate-300">/100</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <section className="space-y-2">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            The Problem
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {problemDisplay}
                                        </p>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-500" />
                                            Target Customer
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {targetCustomerDisplay}
                                        </p>
                                    </section>

                                    {!isAuthenticated && (
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                                            <p className="text-sm font-bold text-blue-900">Sign up free to see the full analysis</p>
                                            <Link href="/login" className="block">
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10">
                                                    Sign Up Free
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Dimension Scores</h3>
                                    <div className="space-y-3 relative">
                                        {dimensions.map((dim) => {
                                            const Icon = dim.icon
                                            const score = validation ? (validation as Record<string, number>)[dim.key] : null
                                            return (
                                                <div key={dim.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                            <Icon className="h-4 w-4 text-slate-600" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{dim.name}</span>
                                                    </div>
                                                    <div className={cn("font-black text-sm", (!isAuthenticated || (isAuthenticated && !isPro)) && "blur-sm select-none")}>
                                                        {(isAuthenticated && isPro) && score ? `${score}/10` : '9/10'}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {(!isAuthenticated || (isAuthenticated && !isPro)) && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-2xl">
                                                <div className="bg-white shadow-xl p-4 rounded-2xl border flex flex-col items-center gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <Lock className="h-5 w-5 text-slate-400" />
                                                        <span className="text-sm font-black text-slate-800">Locked</span>
                                                    </div>
                                                    {isAuthenticated ? (
                                                        <Button size="sm" variant="outline" className="text-[10px] h-7 font-black uppercase tracking-wider border-slate-200 text-slate-500 cursor-not-allowed" disabled>
                                                            Upgrade Coming Soon
                                                        </Button>
                                                    ) : (
                                                        <Link href="/signup">
                                                            <Button size="sm" variant="outline" className="text-[10px] h-7 font-black uppercase tracking-wider border-blue-200 text-blue-600 hover:bg-blue-50">
                                                                Sign Up Free
                                                            </Button>
                                                        </Link>
                                                    )}

                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Sections (PREMIUM ONLY) */}
                            {isAuthenticated && (
                                <div className="mt-8 pt-8 border-t space-y-8">
                                    {/* Comparable Companies */}
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Comparable Companies</h3>
                                        {!isPremium ? (
                                            <div className="p-6 bg-slate-50 border-2 border-dashed rounded-2xl text-center space-y-3">
                                                <Lock className="h-6 w-6 text-slate-300 mx-auto" />
                                                <p className="text-xs font-bold text-slate-500 uppercase">Available on Premium Plan</p>
                                                {/* <Link href="/pricing" className="inline-block">
                                                    <Button variant="outline" size="sm" className="font-bold rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50">
                                                        Upgrade to Premium
                                                    </Button>
                                                </Link> */}
                                                <Button variant="outline" size="sm" className="font-bold rounded-xl border-slate-200 text-slate-500 cursor-not-allowed" disabled>
                                                    Premium Coming Soon
                                                </Button>

                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {validation?.comparable_companies?.map((co: { name: string, outcome: string }, i: number) => {
                                                    const isSuccess = co.outcome?.toLowerCase() === 'success'
                                                    const bgColor = isSuccess ? 'bg-emerald-50' : 'bg-red-50'
                                                    const borderColor = isSuccess ? 'border-emerald-100' : 'border-red-100'
                                                    const textColor = isSuccess ? 'text-emerald-900' : 'text-red-900'
                                                    const badgeBg = isSuccess ? 'bg-emerald-100' : 'bg-red-100'
                                                    const badgeText = isSuccess ? 'text-emerald-700' : 'text-red-700'

                                                    return (
                                                        <div key={i} className={`p-3 ${bgColor} border ${borderColor} rounded-xl flex items-center justify-between`}>
                                                            <span className={`text-xs font-bold ${textColor}`}>{co.name}</span>
                                                            <Badge variant="secondary" className={`text-[10px] ${badgeBg} ${badgeText}`}>{co.outcome}</Badge>
                                                        </div>
                                                    )
                                                })}
                                                {(!validation?.comparable_companies || validation.comparable_companies.length === 0) && (
                                                    <p className="text-xs text-slate-400 italic">No comparable companies available.</p>
                                                )}
                                            </div>
                                        )}
                                    </section>

                                    {/* AI Insights */}
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-indigo-500" />
                                            Detailed AI Reasoning
                                        </h3>
                                        {!isPremium ? (
                                            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-300 animate-pulse" />
                                                    <div className="h-2 w-full max-w-[200px] bg-indigo-100 rounded" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-300 animate-pulse" />
                                                    <div className="h-2 w-full max-w-[150px] bg-indigo-100 rounded" />
                                                </div>
                                                <div className="flex flex-col items-center text-center space-y-2 pt-2">
                                                    <p className="text-xs font-black text-indigo-900 uppercase">Premium Insights Locked</p>
                                                    {/* <Link href="/pricing">
                                                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-9">
                                                            Go Premium
                                                        </Button>
                                                    </Link> */}
                                                    <Button className="bg-slate-200 text-slate-500 font-bold rounded-xl h-9 cursor-not-allowed" disabled>
                                                        Scale Coming Soon
                                                    </Button>

                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {dimensions.map(dim => (
                                                    <div key={dim.name} className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">{dim.name} Reasoning</p>
                                                        <p className="text-xs text-slate-700 italic">
                                                            {(validation as Record<string, string>)?.[dim.key.replace('_score', '_reasoning')] || 'No reasoning available.'}
                                                        </p>
                                                    </div>
                                                ))}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                                        <h4 className="text-xs font-black text-red-700 uppercase mb-2">Red Flags</h4>
                                                        {validation?.red_flags && validation.red_flags.length > 0 ? (
                                                            <ul className="text-xs text-red-900 space-y-1 list-disc list-inside">
                                                                {validation.red_flags.map((f: string, i: number) => <li key={i}>{f}</li>)}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-xs text-slate-500 italic">No red flags identified.</p>
                                                        )}
                                                    </div>
                                                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                                        <h4 className="text-xs font-black text-green-700 uppercase mb-2">Recommendations</h4>
                                                        {validation?.recommendations && validation.recommendations.length > 0 ? (
                                                            <ul className="text-xs text-green-900 space-y-1 list-disc list-inside">
                                                                {validation.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-xs text-slate-500 italic">No recommendations yet.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {/* Action Plan Section */}
                                    <section className="space-y-4 pt-4 border-t">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-500" />
                                            Personalized Action Plan
                                        </h3>
                                        {!isPro ? (
                                            <ActionPlanUpgradeCTA />
                                        ) : (
                                            validation?.action_plan ? (
                                                <ActionPlanCard actionPlan={validation.action_plan} tier={userTier} />
                                            ) : (
                                                <div className="p-6 bg-slate-50 border-2 border-dashed rounded-2xl text-center">
                                                    <p className="text-xs text-slate-400 italic">No action plan available for this validation.</p>
                                                </div>
                                            )
                                        )}
                                    </section>
                                </div>
                            )}

                            <div className="mt-8 flex flex-col md:flex-row gap-3">
                                <Link href="/new-idea" className="flex-1">
                                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-12 gap-2">
                                        Validate Your Own Idea
                                        <Sparkles className="h-4 w-4 text-yellow-400" />
                                    </Button>
                                </Link>
                                <Button variant="outline" className="flex-1 font-black rounded-xl h-12" onClick={() => onOpenChange(false)}>
                                    Close Preview
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
