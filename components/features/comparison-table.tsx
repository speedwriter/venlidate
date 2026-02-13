'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function ComparisonTable() {
    return (
        <div className="overflow-hidden rounded-xl border shadow-sm bg-white">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[40%] pl-6 py-4 text-base font-bold text-slate-500">Traditional Methods</TableHead>
                        <TableHead className="w-[60%] pl-6 py-4 text-base font-bold text-primary bg-primary/5">Venlidate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <ComparisonRow
                        competitor="Business Plan Templates"
                        competitorDesc="Fill in the blanks. Hope for the best."
                        venlidate="AI-Powered Analysis"
                        venlidateDesc="Get scored on 7 proven fundamentals with specific reasoning."
                    />
                    <ComparisonRow
                        competitor="Founder Communities"
                        competitorDesc="Ask Reddit. Get 47 conflicting opinions."
                        venlidate="Personalized Action Plan"
                        venlidateDesc="Here are the 3 things to fix first, in priority order."
                    />
                    <ComparisonRow
                        competitor="Accelerator Applications"
                        competitorDesc="Build first, validate later. (Too late.)"
                        venlidate="Validate BEFORE Building"
                        venlidateDesc="Know what's broken before wasting months."
                    />
                    <ComparisonRow
                        competitor="One-Time Feedback"
                        competitorDesc="Get advice once. Never improve."
                        venlidate="Iteration Loop"
                        venlidateDesc="Track score improvements. See progress. Build confidence."
                        isLast
                    />
                </TableBody>
            </Table>
        </div>
    )
}

function ComparisonRow({
    competitor,
    competitorDesc,
    venlidate,
    venlidateDesc,
    isLast = false
}: {
    competitor: string
    competitorDesc: string
    venlidate: string
    venlidateDesc: string
    isLast?: boolean
}) {
    return (
        <TableRow className="hover:bg-transparent">
            {/* Competitor Cell */}
            <TableCell className={cn("p-6 align-top", !isLast && "border-b")}>
                <div className="flex gap-4">
                    <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 mt-1">
                        <X className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 mb-1">{competitor}</div>
                        <div className="text-sm text-slate-500 leading-relaxed">{competitorDesc}</div>
                    </div>
                </div>
            </TableCell>

            {/* Venlidate Cell */}
            <TableCell className={cn("p-6 align-top bg-primary/5", !isLast && "border-b border-primary/10")}>
                <div className="flex gap-4">
                    <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground mt-1 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <div className="font-semibold text-primary mb-1">{venlidate}</div>
                        <div className="text-sm text-slate-600 leading-relaxed">{venlidateDesc}</div>
                    </div>
                </div>
            </TableCell>
        </TableRow>
    )
}
