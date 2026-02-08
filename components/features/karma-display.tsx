'use client'

import { useState, useEffect } from 'react'
import { Award, Zap, Share2, Loader2, CreditCard } from 'lucide-react'
import { getUserKarma } from '@/app/actions/shared-ideas'
import { Tables } from '@/types/database'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface KarmaDisplayProps {
    userId: string
    className?: string
    initialData?: Tables<'user_karma'> | null
}

export function KarmaDisplay({ userId, className, initialData }: KarmaDisplayProps) {
    const [karma, setKarma] = useState<Tables<'user_karma'> | null>(initialData || null)
    const [isLoading, setIsLoading] = useState(!initialData)

    useEffect(() => {
        if (initialData) {
            setKarma(initialData)
            setIsLoading(false)
            return
        }

        async function fetchKarma() {
            try {
                const data = await getUserKarma(userId)
                setKarma(data)
            } catch (error) {
                console.error('Error fetching karma:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchKarma()
    }, [userId, initialData])

    if (isLoading && !karma) return (
        <div className={cn("flex items-center gap-2 text-muted-foreground animate-pulse", className)}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-medium">Loading karma...</span>
        </div>
    )

    if (!karma) return null

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <TooltipProvider>
                {/* Free Credits */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 cursor-help transition-all hover:bg-blue-100 shadow-sm animate-in zoom-in duration-300">
                            <Zap className="h-3.5 w-3.5 fill-blue-500" />
                            <span className="text-xs font-bold">{karma.free_validation_credits} <span className="hidden sm:inline">Free Credits</span></span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Earn free credits by sharing your validated ideas with the community</p>
                    </TooltipContent>
                </Tooltip>

                {/* Ideas Shared */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 cursor-help transition-all hover:bg-amber-100 shadow-sm">
                            <Share2 className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{karma.ideas_shared} <span className="hidden sm:inline">Shared</span></span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">{karma.ideas_shared} Ideas shared with the community</p>
                    </TooltipContent>
                </Tooltip>

                {/* Karma Points (Placeholder for future) */}
                {/* 
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100 cursor-help transition-all hover:bg-purple-100 shadow-sm">
                            <Award className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{karma.karma_points || 0} Karma</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Community contribution points</p>
                    </TooltipContent>
                </Tooltip> 
                */}
            </TooltipProvider>
        </div>
    )
}
