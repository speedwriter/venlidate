'use client'

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Trash2, Calendar, User, Check, RotateCcw } from "lucide-react"
import { approveSharedIdea, moveToPending } from "@/app/actions/shared-ideas"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TrafficLight } from "./traffic-light"
import { createClient } from "@/lib/supabase/client"

interface IdeaApprovedCardProps {
    sharedIdea: any
    mode?: 'approved' | 'rejected' | 'removed'
}

export function IdeaApprovedCard({ sharedIdea, mode = 'approved' }: IdeaApprovedCardProps) {
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRemove = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('shared_ideas')
                .update({
                    status: 'removed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', sharedIdea.id)

            if (error) throw error

            toast.success("Idea removed from marketplace")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to remove idea")
        } finally {
            setIsLoading(false)
        }
    }

    const handleReapprove = async () => {
        setIsLoading(true)
        try {
            const result = await approveSharedIdea(sharedIdea.id)
            if (result.success) {
                toast.success("Idea re-approved!")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to re-approve")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleMoveToPending = async () => {
        setIsLoading(true)
        try {
            const result = await moveToPending(sharedIdea.id)
            if (result.success) {
                toast.success("Moved back to pending approval")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to move to pending")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-800 border-green-200"
        if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        return "bg-red-100 text-red-800 border-red-200"
    }

    return (
        <Card className="flex flex-col h-full opacity-90 hover:opacity-100 transition-opacity">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
                        {sharedIdea.title}
                    </CardTitle>
                    <Badge className={`${getScoreColor(sharedIdea.overall_score)} font-bold shrink-0`}>
                        {sharedIdea.overall_score}
                    </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(sharedIdea.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {sharedIdea.is_anonymous ? 'Anonymous' : (sharedIdea.shared_by_name || 'User')}
                    </div>
                    {sharedIdea.traffic_light && <TrafficLight trafficLight={sharedIdea.traffic_light} />}
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4 text-sm text-muted-foreground line-clamp-2">
                {sharedIdea.problem}
            </CardContent>
            <CardFooter className="pt-0 flex gap-2 p-4 bg-muted/10 border-t">
                {mode === 'approved' ? (
                    <>
                        <Link href={`/ideas`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-2 font-medium">
                                <ExternalLink className="h-3.5 w-3.5" /> View
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={handleMoveToPending}
                            disabled={isLoading}
                            title="Move to Pending"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleRemove}
                            disabled={isLoading}
                            title="Remove"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            onClick={handleReapprove}
                            disabled={isLoading}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2 font-semibold"
                            size="sm"
                        >
                            {isLoading ? "Processing..." : <><Check className="h-4 w-4" /> Re-approve</>}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                            onClick={handleMoveToPending}
                            disabled={isLoading}
                            title="Move to Pending"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    )
}
