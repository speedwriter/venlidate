'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, ChevronRight, X, AlertCircle } from 'lucide-react'
import { TrafficLight } from '@/components/features/traffic-light'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface ComparisonViewProps {
    ideas: any[] // Array of ideas with latest validations
    allValidatedIdeas: any[] // All validated ideas for selection
    tierLimit: number
}

const DIMENSIONS = [
    { key: 'painkiller_score', label: 'Painkiller' },
    { key: 'revenue_model_score', label: 'Revenue Model' },
    { key: 'acquisition_score', label: 'User Acquisition' },
    { key: 'moat_score', label: 'Moat' },
    { key: 'founder_fit_score', label: 'Founder Fit' },
    { key: 'time_to_revenue_score', label: 'Time to Revenue' },
    { key: 'scalability_score', label: 'Scalability' },
]

export function ComparisonView({ ideas, allValidatedIdeas, tierLimit }: ComparisonViewProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedIds, setSelectedIds] = useState<string[]>(
        ideas.map(i => i.id)
    )
    const [isOpen, setIsOpen] = useState(false)

    const toggleId = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const handleCompare = () => {
        if (selectedIds.length > tierLimit) {
            // This case should be handled by UI disabling or showing error
            return
        }
        setIsOpen(false)
        const params = new URLSearchParams(searchParams.toString())
        params.set('ids', selectedIds.join(','))
        router.push(`/dashboard/compare?${params.toString()}`)
    }

    const getMaxScoreForDimension = (dimKey: string) => {
        return Math.max(...ideas.map(idea => idea.latest_validation?.[dimKey] || 0))
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Comparison</h2>

                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Select Ideas to Compare
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Select Ideas to Compare</AlertDialogTitle>
                            <AlertDialogDescription>
                                Select 2 to {tierLimit} ideas to see them side-by-side.
                                {selectedIds.length > tierLimit && (
                                    <span className="text-red-500 block mt-2">
                                        Your tier allows comparing up to {tierLimit} ideas. Upgrade to compare more.
                                    </span>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto py-4">
                            {allValidatedIdeas.map(idea => (
                                <div
                                    key={idea.id}
                                    onClick={() => toggleId(idea.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                                        selectedIds.includes(idea.id)
                                            ? "border-primary bg-primary/5"
                                            : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold truncate">{idea.title}</h4>
                                        <p className="text-xs text-muted-foreground">Score: {idea.latest_validation?.overall_score || 'N/A'}</p>
                                    </div>
                                    <div className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        selectedIds.includes(idea.id)
                                            ? "bg-primary border-primary text-white"
                                            : "border-slate-300"
                                    )}>
                                        {selectedIds.includes(idea.id) && <Check className="h-4 w-4" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <AlertDialogFooter>
                            {selectedIds.length > tierLimit && (
                                <Button
                                    variant="secondary"
                                    className="mr-auto"
                                    onClick={() => router.push('/pricing')}
                                >
                                    Upgrade Plan
                                </Button>
                            )}
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleCompare}
                                disabled={selectedIds.length < 2 || selectedIds.length > tierLimit}
                            >
                                Apply Comparison
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {ideas.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
                    <p className="text-muted-foreground">No ideas selected for comparison.</p>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-4",
                    ideas.length === 1 ? "grid-cols-1" :
                        ideas.length === 2 ? "grid-cols-1 md:grid-cols-2" :
                            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                    {ideas.map((idea) => {
                        const validation = idea.latest_validation
                        if (!validation) return null

                        return (
                            <Card key={idea.id} className="relative overflow-hidden flex flex-col h-full border-2 transition-all hover:shadow-lg">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <TrafficLight trafficLight={validation.traffic_light} />
                                        <div className="text-3xl font-black text-slate-900 leading-none">
                                            {validation.overall_score}
                                        </div>
                                    </div>
                                    <CardTitle className="line-clamp-2 min-h-[3rem]">{idea.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 flex-1">
                                    <div className="space-y-2">
                                        {DIMENSIONS.map(dim => {
                                            const score = validation[dim.key] || 0
                                            const isBest = ideas.length > 1 && score === getMaxScoreForDimension(dim.key) && score > 0

                                            return (
                                                <div
                                                    key={dim.key}
                                                    className={cn(
                                                        "flex items-center justify-between p-2 rounded-lg transition-colors",
                                                        isBest ? "bg-emerald-50 border border-emerald-100 ring-1 ring-emerald-200" : "bg-slate-50/50"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        isBest ? "text-emerald-900" : "text-slate-600"
                                                    )}>
                                                        {dim.label}
                                                    </span>
                                                    <span className={cn(
                                                        "font-bold",
                                                        isBest ? "text-emerald-700" : "text-slate-900"
                                                    )}>
                                                        {score}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                                <div className="p-4 bg-slate-50 border-t">
                                    <Link href={`/dashboard/${idea.id}`} className="w-full">
                                        <Button variant="ghost" className="w-full justify-between hover:bg-white">
                                            Full Report
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
