'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, X } from 'lucide-react'

export default function FeatureComparisonTable() {
    return (
        <div className="max-w-6xl mx-auto py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Feature</TableHead>
                            <TableHead className="text-center">Free</TableHead>
                            <TableHead className="text-center bg-primary/5">Pro</TableHead>
                            <TableHead className="text-center">Premium</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Validations */}
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={4} className="font-semibold text-sm">Validations</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Validations per month</TableCell>
                            <TableCell className="text-center">1</TableCell>
                            <TableCell className="text-center bg-primary/5">10</TableCell>
                            <TableCell className="text-center">Unlimited</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Re-validate same idea</TableCell>
                            <TableCell className="text-center">1 iteration</TableCell>
                            <TableCell className="text-center bg-primary/5">Unlimited</TableCell>
                            <TableCell className="text-center">Unlimited</TableCell>
                        </TableRow>

                        {/* AI Guidance */}
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={4} className="font-semibold text-sm">AI Validation</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Thinking questions</TableCell>
                            <TableCell className="text-center">All dimensions</TableCell>
                            <TableCell className="text-center bg-primary/5">All dimensions</TableCell>
                            <TableCell className="text-center">All dimensions</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Iteration tracking</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Score improvement charts</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>

                        {/* Execution Roadmap */}
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={4} className="font-semibold text-sm">Execution Roadmap</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>5-Phase Execution Roadmap</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Concurrent active roadmaps</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5">1</TableCell>
                            <TableCell className="text-center">Unlimited</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Adaptive AI sprint generation</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>AI completion debrief</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Shareable validation reports</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>

                        {/* Idea Comparison */}
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={4} className="font-semibold text-sm">Idea Comparison</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Side-by-side comparison</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5">3 ideas</TableCell>
                            <TableCell className="text-center">5 ideas</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Comparison history</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>

                        {/* Reports & Export */}
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={4} className="font-semibold text-sm">Reports & Export</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Report storage</TableCell>
                            <TableCell className="text-center">30 days</TableCell>
                            <TableCell className="text-center bg-primary/5">Forever</TableCell>
                            <TableCell className="text-center">Forever</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>PDF export</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Shareable report link</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>CSV export</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>

                        {/* Support */}
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={4} className="font-semibold text-sm">Support</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Email support</TableCell>
                            <TableCell className="text-center">Community</TableCell>
                            <TableCell className="text-center bg-primary/5">Standard</TableCell>
                            <TableCell className="text-center">Priority (&lt;24hr)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Early feature access</TableCell>
                            <TableCell className="text-center"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center bg-primary/5"><X className="h-5 w-5 text-red-500 inline" /></TableCell>
                            <TableCell className="text-center"><Check className="h-5 w-5 text-green-500 inline" /></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
