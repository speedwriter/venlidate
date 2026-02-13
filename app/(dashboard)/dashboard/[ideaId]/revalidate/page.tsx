import { notFound, redirect } from "next/navigation"
import { IdeaForm } from "@/components/features/idea-form"
import { getIdea } from "@/app/actions/ideas"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

interface RevalidateIdeaPageProps {
    params: Promise<{
        ideaId: string
    }>
}

export default async function RevalidateIdeaPage({ params }: RevalidateIdeaPageProps) {
    const { ideaId } = await params
    const result = await getIdea(ideaId)

    if (!result.success || !result.data) {
        if (result.error === 'Unauthorized') {
            redirect('/login')
        }
        notFound()
    }

    const idea = result.data

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/dashboard/${idea.id}`}>{idea.title}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Revalidate</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Revalidate Idea</h1>
                <p className="text-muted-foreground">
                    Update your idea details to get a fresh AI validation.
                </p>
            </div>

            <IdeaForm
                ideaId={idea.id}
                initialData={{
                    title: idea.title,
                    problem: idea.problem,
                    solution: idea.solution,
                    targetCustomer: idea.target_customer,
                    painkillerMoment: idea.painkiller_moment,
                    revenueModel: idea.revenue_model,
                    unfairAdvantage: idea.unfair_advantage,
                    distributionChannel: idea.distribution_channel,
                    timeCommitment: idea.time_commitment,
                }}
            />
        </div>
    )
}
