'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Trash2,
    Calendar,
    ArrowRight,
    MoreVertical,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2
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

interface IdeaCardProps {
    idea: {
        id: string
        title: string
        problem?: string
        status: string
        created_at: string
        latest_validation?: {
            overall_score: number
            traffic_light: 'red' | 'yellow' | 'green'
        } | null
    }
}

export function IdeaCard({ idea }: IdeaCardProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const router = useRouter()

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


    const isValidated = idea.status === 'validated' && idea.latest_validation

    return (
        <Card className="group relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={idea.title}>
                        {idea.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                        {isValidated ? (
                            <Badge className={`${getScoreColor(idea.latest_validation!.overall_score)} font-bold px-2 py-0.5 border shadow-none`} variant="secondary">
                                {idea.latest_validation!.overall_score}
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
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-6 space-y-4">
                {idea.problem && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {idea.problem}
                    </p>
                )}

                {!isValidated && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-sm font-medium text-slate-600">
                            {idea.status === 'validating' ? 'Validation in progress...' : 'Ready for validation'}
                        </span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0 border-t bg-slate-50/50 flex gap-2 p-4">
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
            </CardFooter>
        </Card>
    )
}
