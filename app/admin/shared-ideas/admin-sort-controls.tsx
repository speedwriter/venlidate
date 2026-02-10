'use client'

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowDownAZ, ArrowUpAZ, SortAsc, SortDesc } from "lucide-react"

export function AdminSortControls() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const sortBy = searchParams.get('sortBy') || 'share_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const handleSortChange = (newSortBy: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sortBy', newSortBy)
        router.push(`?${params.toString()}`)
    }

    const handleOrderChange = (newSortOrder: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sortOrder', newSortOrder)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap items-end gap-4 bg-muted/30 p-4 rounded-lg border border-muted mb-6">
            <div className="space-y-1.5">
                <Label htmlFor="sort-by" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sort By
                </Label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger id="sort-by" className="w-[180px] bg-background">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="score">Score</SelectItem>
                        <SelectItem value="share_date">Share Date</SelectItem>
                        <SelectItem value="validation_date">Validation Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="sort-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Order
                </Label>
                <Select value={sortOrder} onValueChange={handleOrderChange}>
                    <SelectTrigger id="sort-order" className="w-[180px] bg-background">
                        <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">
                            <div className="flex items-center gap-2">
                                <SortDesc className="h-4 w-4" />
                                <span>Descending</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="asc">
                            <div className="flex items-center gap-2">
                                <SortAsc className="h-4 w-4" />
                                <span>Ascending</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
