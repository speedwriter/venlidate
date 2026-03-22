import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getFullIdea } from "@/app/actions/ideas"
import { createClient } from "@/lib/supabase/server"
import { ValidationReport } from "@/components/features/validation-report"
import { RevalidateButton } from "@/components/features/revalidate-button"
import { TrafficLight } from "@/components/features/traffic-light"
import { BenchmarkBadge } from "@/components/features/benchmark-badge"
import { calculatePercentile } from "@/lib/utils/benchmarks"
import { getScoreColor } from "@/lib/utils"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { CalendarDays, Lightbulb, PlayCircle, ArrowRight } from "lucide-react"
import { GenerateRoadmapCTA } from "@/components/features/roadmap/GenerateRoadmapCTA"
import { Button } from "@/components/ui/button"

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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let percentile = 0
    let sharedIdea = null

    if (latestValidation) {
        percentile = await calculatePercentile(latestValidation.overall_score)

        // Check if this validation is already shared
        const { data: shareData } = await supabase
            .from('shared_ideas')
            .select('id, status')
            .eq('validation_id', latestValidation.id)
            .single()

        sharedIdea = shareData
    }

    // Check for existing roadmap
    let roadmapId = null
    if (user) {
        const { data: roadmapData } = await supabase
            .from('roadmap')
            .select('id')
            .eq('idea_id', ideaId)
            .eq('user_id', user.id)
            .maybeSingle()

        roadmapId = roadmapData?.id
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{idea.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-muted-foreground border border-muted-foreground/10">
                            <CalendarDays className="h-4 w-4 text-primary/60" />
                            Created {new Date(idea.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-muted-foreground border border-muted-foreground/10 capitalize">
                            <Lightbulb className="h-4 w-4 text-amber-500/60" />
                            {idea.status}
                        </div>
                        {latestValidation && (
                            <TrafficLight trafficLight={latestValidation.trafficLight} />
                        )}
                        <BenchmarkBadge percentile={percentile} />
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end md:self-auto">
                    {latestValidation && (
                        <div className="flex items-center gap-3 bg-secondary/30 px-5 py-2.5 rounded-2xl border backdrop-blur-sm transition-all hover:bg-secondary/40">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-muted-foreground uppercase leading-none tracking-widest">Overall Score</p>
                                <p className="text-4xl font-black tracking-tighter leading-none mt-1" style={{ color: getScoreColor(latestValidation.overallScore) }}>
                                    {latestValidation.overallScore}<span className="text-sm text-muted-foreground/50 ml-0.5">/100</span>
                                </p>
                            </div>
                        </div>
                    )}
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
                <div className="space-y-8">
                    {/* Roadmap CTA/Status */}
                    {latestValidation && (
                        <div className="w-full">
                            {roadmapId ? (
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                Roadmap in Progress
                                            </CardTitle>
                                            <CardDescription>
                                                You are currently working through the execution roadmap for this idea.
                                            </CardDescription>
                                        </div>
                                        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95">
                                            <Link href={`/roadmap/${roadmapId}`}>
                                                Continue Roadmap
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : latestValidation.overallScore >= 70 && !idea.roadmap_generated ? (
                                <GenerateRoadmapCTA 
                                    ideaId={idea.id} 
                                    ideaTitle={idea.title} 
                                    score={latestValidation.overallScore} 
                                />
                            ) : latestValidation.overallScore < 70 ? (
                                <Card className="bg-muted/30 border-dashed">
                                    <CardContent className="flex items-center gap-4 py-6">
                                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                            <Lightbulb className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold text-foreground/80">Strengthen your idea first</CardTitle>
                                            <CardDescription className="text-sm">
                                                A personalised roadmap unlocks once your idea hits an overall score of 70+. Use the recommendations below to improve your score.
                                            </CardDescription>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </div>
                    )}

                    <ValidationReport
                        idea={idea}
                        validation={latestValidation}
                        history={history}
                        percentile={percentile}
                        isShared={!!sharedIdea}
                        sharedIdeaId={sharedIdea?.id}
                        userTier={userTier}
                    />
                </div>
            )
            }
        </div >
    )
}
