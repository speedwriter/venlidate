import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getIdeasByIds, getUserIdeas } from '@/app/actions/ideas'
import { ComparisonView } from '@/components/features/comparison-view'
import { checkComparisonLimit, getUserTier, TIER_LIMITS } from '@/lib/utils/subscriptions'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ComparePageProps {
    searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { ids } = await searchParams
    const ideaIds = ids ? ids.split(',').filter(Boolean) : []

    // 1. Check comparison limit
    const limitCheck = await checkComparisonLimit(user.id, ideaIds.length)
    const tier = await getUserTier(user.id)
    const tierLimit = TIER_LIMITS[tier].maxComparisonIdeas

    // 2. Fetch ideas to compare
    const comparisonResult = await getIdeasByIds(ideaIds)

    // 3. Fetch all validated ideas for the selection modal
    const allIdeasResult = await getUserIdeas()
    const allValidatedIdeas = (allIdeasResult.data || []).filter(idea => idea.status === 'validated')

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Compare Ideas</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Compare Ideas</h1>
                <p className="text-muted-foreground">Analyze your startup ideas side-by-side to find the strongest potential.</p>
            </div>

            {!limitCheck.allowed && (
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Tier Limit Reached</AlertTitle>
                    <AlertDescription className="flex flex-col gap-3 mt-2">
                        <p>{limitCheck.error}</p>
                        <Link href="/pricing" className="w-fit">
                            <Button variant="destructive" size="sm">Upgrade to {tier === 'free' ? 'Pro' : 'Premium'}</Button>
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            <ComparisonView
                ideas={(comparisonResult.success && comparisonResult.data) ? comparisonResult.data : []}
                allValidatedIdeas={allValidatedIdeas}
                tierLimit={tierLimit}
            />
        </div>
    )
}
