'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GitCompare, Check, AlertCircle } from 'lucide-react'
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

import { IdeaWithValidation } from '@/types/validations'

interface CompareIdeasButtonProps {
    validatedIdeas: IdeaWithValidation[]
    tierLimit: number
}

export function CompareIdeasButton({ validatedIdeas, tierLimit }: CompareIdeasButtonProps) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isOpen, setIsOpen] = useState(false)

    const toggleId = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const handleCompare = () => {
        if (selectedIds.length < 2 || selectedIds.length > tierLimit) return

        setIsOpen(false)
        const ids = selectedIds.join(',')
        router.push(`/dashboard/compare?ids=${ids}`)
    }

    if (validatedIdeas.length < 2) return null

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="lg" className="rounded-full px-6 transition-all gap-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5">
                    <GitCompare className="h-4 w-4 text-primary" />
                    Compare Ideas
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Compare Your Best Ideas</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select 2 to {tierLimit} ideas to compare side-by-side.
                        {selectedIds.length > tierLimit && (
                            <span className="text-red-500 block mt-2 font-medium flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                Your tier allows comparing up to {tierLimit} ideas.
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto py-4">
                    {validatedIdeas.map(idea => (
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
                                <p className="text-xs text-muted-foreground">Overall Score: {idea.latest_validation?.overallScore || 'N/A'}</p>
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

                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    {selectedIds.length > tierLimit && (
                        <Button
                            variant="secondary"
                            className="mr-auto"
                            onClick={() => {
                                setIsOpen(false)
                                router.push('/pricing')
                            }}
                        >
                            Upgrade Plan
                        </Button>
                    )}
                    <div className="flex gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCompare}
                            disabled={selectedIds.length < 2 || selectedIds.length > tierLimit}
                        >
                            Compare Now
                        </AlertDialogAction>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
