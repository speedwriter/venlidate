import { IdeaForm } from "@/components/features/idea-form"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { RefreshCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface NewIdeaPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NewIdeaPage({ searchParams }: NewIdeaPageProps) {
    const { prefill } = await searchParams
    let initialData = undefined
    let originalIdeaTitle = undefined

    if (prefill && typeof prefill === 'string') {
        const { getIdea } = await import('@/app/actions/ideas')
        const result = await getIdea(prefill)
        if (result.success && result.data) {
            const idea = result.data
            initialData = {
                title: idea.title,
                problem: idea.problem,
                solution: idea.solution,
                targetCustomer: idea.target_customer,
                painkillerMoment: idea.painkiller_moment,
                revenueModel: idea.revenue_model,
                distributionChannel: idea.distribution_channel,
                unfairAdvantage: idea.unfair_advantage,
                timeCommitment: idea.time_commitment
            }
            originalIdeaTitle = idea.title
        }
    }

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
                        <BreadcrumbPage>New Idea</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {initialData ? 'Re-validate Idea' : 'Submit New Idea'}
                </h1>
                <p className="text-muted-foreground">
                    {initialData
                        ? 'Update your inputs based on previous feedback to see if your score improves.'
                        : 'Fill out the form below to get your idea validated by our AI engine.'}
                </p>
            </div>

            {initialData && (
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/50">
                    <RefreshCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold">
                        Re-validating: {originalIdeaTitle}
                    </AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                        We&apos;ve pre-filled the form with your previous answers. Make changes to address the risks identified in your last report.
                    </AlertDescription>
                </Alert>
            )}

            <IdeaForm initialData={initialData} ideaId={typeof prefill === 'string' ? prefill : undefined} />
        </div>
    )
}
