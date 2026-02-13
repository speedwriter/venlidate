'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Trash2,
    Calendar,
    ArrowRight,
    Loader2,
    Lock
} from "lucide-react"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/alert-dialog"
import { deleteIdea } from "@/app/actions/ideas"
import { IdeaWithValidation } from "@/types/validations"
import { cn } from "@/lib/utils"
import { TrafficLight } from "./traffic-light"
import { IdeaDetailModal, SharedIdeaDetail } from "./idea-detail-modal"

interface IdeaCardProps {
    idea: IdeaWithValidation
    mode?: 'dashboard' | 'marketplace'
    isAuthenticated?: boolean
    userTier?: string
}

export function IdeaCard({ idea, mode = 'dashboard', isAuthenticated = true, userTier = 'free' }: IdeaCardProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const result = await deleteIdea(idea.id)
            if (!result.success) {
                throw new Error(result.error || "Failed to delete idea")
            }
            router.refresh()
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "An error occurred while deleting")
        } finally {
            setIsDeleting(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-800 border-green-200"
        if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        return "bg-red-100 text-red-800 border-red-200"
    }

    const score = idea.latest_validation?.overallScore || (idea as unknown as { overall_score: number }).overall_score
    const trafficLight = idea.latest_validation?.trafficLight || (idea as unknown as { traffic_light: 'red' | 'yellow' | 'green' }).traffic_light
    const isValidated = idea.status === 'validated' || (idea.status === 'approved' && (!!idea.latest_validation || !!score))

    const isDashboard = mode === 'dashboard'

    return (
        <>
            <Card
                className={cn(
                    "group relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20",
                    !isDashboard && (isAuthenticated ? "cursor-pointer" : "cursor-default")
                )}
                onClick={() => {
                    if (!isDashboard && isAuthenticated) {
                        setIsModalOpen(true)
                    }
                }}
            >
                {!isDashboard && !isAuthenticated && (
                    <div className="absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href="/login">
                            <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl gap-2 shadow-xl mb-4">
                                <Lock className="h-3.5 w-3.5" />
                                Sign up to see more
                            </Button>
                        </Link>
                    </div>
                )}

                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={idea.title}>
                            {idea.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 shrink-0">
                            {isValidated ? (
                                <Badge className={`${getScoreColor(score)} font-bold px-2 py-0.5 border shadow-none`} variant="secondary">
                                    {score}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-muted-foreground bg-slate-50 font-medium">
                                    {idea.status === 'validating' ? 'Validating' : 'Draft'}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(idea.created_at).toLocaleDateString()}
                        </div>
                        {trafficLight && <TrafficLight trafficLight={trafficLight} />}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 pb-6 space-y-4">
                    {idea.problem && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {idea.problem}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="pt-0 border-t bg-slate-50/50 flex gap-2 p-4">
                    {isDashboard ? (
                        <>
                            <Link href={`/dashboard/${idea.id}`} className="flex-1">
                                <Button variant="default" className="w-full gap-2 group/btn font-semibold">
                                    View Report
                                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </Link>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Idea</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete &quot;{idea.title}&quot;? This action cannot be undone and will remove all associated validation reports.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                            Delete Idea
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    ) : (
                        isAuthenticated ? (
                            <Button
                                variant="outline"
                                className="w-full gap-2 group/btn font-semibold bg-white"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsModalOpen(true)
                                }}
                            >
                                View Details
                                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Link href="/login" className="w-full" onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" className="w-full gap-2 group/btn font-semibold bg-white">
                                    <Lock className="h-4 w-4" />
                                    Login to View
                                </Button>
                            </Link>
                        )
                    )}
                </CardFooter>
            </Card>

            {/* Marketplace Modal - Outside Card to prevent bubbling */}
            {!isDashboard && isAuthenticated && (
                <IdeaDetailModal
                    sharedIdea={idea as unknown as SharedIdeaDetail}
                    isAuthenticated={isAuthenticated}
                    userTier={userTier as "free" | "pro" | "premium"}
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                />
            )}
        </>
    )
}
