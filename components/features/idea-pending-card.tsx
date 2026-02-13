'use client'

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Calendar, User } from "lucide-react"
import { approveSharedIdea, rejectSharedIdea } from "@/app/actions/shared-ideas"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { TrafficLight } from "./traffic-light"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface IdeaPendingCardProps {
    sharedIdea: {
        id: string
        title: string
        overall_score: number
        created_at: string
        is_anonymous: boolean
        shared_by_name: string | null
        traffic_light: 'red' | 'yellow' | 'green' | null
        problem: string
        target_customer: string
    }
    onApprove?: () => void
    onReject?: () => void
}

export function IdeaPendingCard({ sharedIdea, onApprove, onReject }: IdeaPendingCardProps) {
    const [isApproveLoading, setIsApproveLoading] = React.useState(false)
    const [isRejectLoading, setIsRejectLoading] = React.useState(false)
    const [showRejectDialog, setShowRejectDialog] = React.useState(false)
    const router = useRouter()

    const handleApprove = async () => {
        setIsApproveLoading(true)
        try {
            const result = await approveSharedIdea(sharedIdea.id)
            if (result.success) {
                toast.success("Idea approved successfully!")
                router.refresh()
                onApprove?.()
            } else {
                toast.error(result.error || "Failed to approve idea")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsApproveLoading(false)
        }
    }

    const handleReject = async () => {
        setIsRejectLoading(true)
        try {
            const result = await rejectSharedIdea(sharedIdea.id)
            if (result.success) {
                toast.success("Idea rejected")
                router.refresh()
                onReject?.()
            } else {
                toast.error(result.error || "Failed to reject idea")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsRejectLoading(false)
            setShowRejectDialog(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-800 border-green-200"
        if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        return "bg-red-100 text-red-800 border-red-200"
    }

    return (
        <>
            <Card className="flex flex-col h-full border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg font-bold leading-tight">
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
                <CardContent className="flex-1 pb-4">
                    <div className="space-y-3">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Problem</span>
                            <p className="text-sm line-clamp-3 text-foreground/80 leading-relaxed">
                                {sharedIdea.problem}
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Target Customer</span>
                            <p className="text-sm line-clamp-1 text-foreground/80">
                                {sharedIdea.target_customer}
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2 p-4 bg-muted/20 border-t">
                    <Button
                        onClick={handleApprove}
                        disabled={isApproveLoading || isRejectLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 font-semibold"
                        size="sm"
                    >
                        {isApproveLoading ? "Approving..." : <><Check className="h-4 w-4" /> Approve</>}
                    </Button>
                    <Button
                        onClick={() => setShowRejectDialog(true)}
                        disabled={isApproveLoading || isRejectLoading}
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-2 font-semibold"
                        size="sm"
                    >
                        <X className="h-4 w-4" /> Reject
                    </Button>
                </CardFooter>
            </Card>

            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Idea</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject &quot;{sharedIdea.title}&quot;?
                            The user will be notified that their idea was not approved for the marketplace.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRejectLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleReject()
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isRejectLoading}
                        >
                            {isRejectLoading ? "Rejecting..." : "Reject Idea"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
