import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getFullIdea } from "@/app/actions/ideas"
import { createClient } from "@/lib/supabase/server"
import { ValidationReport } from "@/components/features/validation-report"
import { RevalidateButton } from "@/components/features/revalidate-button"
import { calculatePercentile } from "@/lib/utils/benchmarks"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { CalendarDays, Lightbulb, PlayCircle } from "lucide-react"

interface IdeaDetailPageProps {
    params: Promise<{
        ideaId: string
    }>
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
    const { ideaId } = await params
    const result = await getFullIdea(ideaId)
    const { getUserTierAction } = await import("@/app/actions/subscriptions")
    const userTier = await getUserTierAction()

    if (!result.success || !result.data) {
        if (result.error === 'Unauthorized') {
            redirect('/login')
        }
        notFound()
    }

    const idea = result.data
    const validations = idea.validations || []
    const latestValidation = validations[0]
    const history = validations.slice(1)

    let percentile = 0
    let sharedIdea = null

    if (latestValidation) {
        percentile = await calculatePercentile(latestValidation.overall_score)

        // Check if this validation is already shared
        const supabase = await createClient()
        const { data: shareData } = await supabase
            .from('shared_ideas')
            .select('id, status')
            .eq('validation_id', latestValidation.id)
            .single()

        sharedIdea = shareData
    }

    return (
        <div className="container py-8 space-y-8 max-w-6xl">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{idea.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header / Metadata */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{idea.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            Created on {new Date(idea.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                            <Lightbulb className="h-4 w-4" />
                            {idea.status}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {latestValidation && <RevalidateButton ideaId={idea.id} />}
                </div>
            </div>

            {/* Content */}
            {!latestValidation ? (
                <Card className="border-dashed py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <PlayCircle className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl">No validations yet</CardTitle>
                            <CardDescription className="max-w-md mx-auto">
                                This idea hasn&apos;t been analyzed by our AI yet. Validate it now to get deep insights into its potential.
                            </CardDescription>
                        </div>
                        <RevalidateButton ideaId={idea.id} />
                    </CardContent>
                </Card>
            ) : (
                <ValidationReport
                    idea={idea}
                    validation={latestValidation}
                    history={history}
                    percentile={percentile}
                    isShared={!!sharedIdea}
                    sharedIdeaId={sharedIdea?.id}
                    userTier={userTier}
                />
            )
            }
        </div >
    )
}
