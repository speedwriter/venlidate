'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Check, X } from "lucide-react"

export function MarketplaceComparisonTable() {
    return (
        <div className="w-full mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Compare Marketplace Features</h2>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[300px] font-bold text-base">Feature</TableHead>
                            <TableHead className="text-center font-bold text-base">Free</TableHead>
                            <TableHead className="text-center font-bold text-base text-primary">Pro</TableHead>
                            <TableHead className="text-center font-bold text-base text-purple-600 dark:text-purple-400">Premium</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="bg-muted/20">
                            <TableCell colSpan={4} className="font-semibold py-4">Idea Discovery</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Browse shared ideas</TableCell>
                            <TableCell className="text-center">10 recent</TableCell>
                            <TableCell className="text-center">Full archive</TableCell>
                            <TableCell className="text-center">Full archive</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">View idea details</TableCell>
                            <TableCell className="text-center">Preview only</TableCell>
                            <TableCell className="text-center">Full scores</TableCell>
                            <TableCell className="text-center">Full reasoning</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Save Favourites (Upcoming Feature)</TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center flex items-center justify-center gap-1"><Check className="h-4 w-4 text-primary" /> Up to 10</TableCell>
                            <TableCell className="text-center flex items-center justify-center gap-1"><Check className="h-4 w-4 text-purple-600" /> Unlimited</TableCell>
                        </TableRow>

                        <TableRow className="bg-muted/20">
                            <TableCell colSpan={4} className="font-semibold py-4">Filters & Search (Upcoming Features)</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Filter by score</TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center">Basic</TableCell>
                            <TableCell className="text-center">Advanced</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Filter by industry</TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-purple-600" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Keyword search</TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-purple-600" /></TableCell>
                        </TableRow>

                        <TableRow className="bg-muted/20">
                            <TableCell colSpan={4} className="font-semibold py-4">Sharing & Rewards</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Share your ideas</TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Earn free credits</TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                        </TableRow>


                        <TableRow className="bg-muted/20">
                            <TableCell colSpan={4} className="font-semibold py-4">Notifications</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">New idea alerts</TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-purple-600" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Weekly digest</TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center"><X className="mx-auto h-4 w-4 text-muted-foreground" /></TableCell>
                            <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-purple-600" /></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
