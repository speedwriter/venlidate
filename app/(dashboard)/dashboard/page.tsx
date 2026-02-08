import Link from 'next/link'
import { getUserIdeas } from '@/app/actions/ideas'
import { IdeaWithValidation } from '@/types/validations'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Lock } from 'lucide-react'
import { IdeaCard } from '@/components/features/idea-card'
import { CompareIdeasButton } from '@/components/features/compare-ideas-button'
import { getUserTier, TIER_LIMITS, checkValidationQuota } from '@/lib/utils/subscriptions'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const result = await getUserIdeas()

    if (!result.success || !user) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-red-500 mb-4">Error: {result.error || 'Failed to load ideas'}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        )
    }

    const ideas = (result.data || []) as IdeaWithValidation[]
    const validatedIdeas = ideas.filter(idea => idea.status === 'validated' && !idea.isArchived)
    const archivedIdeas = ideas.filter(idea => idea.isArchived)
    const tier = await getUserTier(user.id)
    const quota = await checkValidationQuota(user.id)
    const tierLimit = TIER_LIMITS[tier].maxComparisonIdeas

    // Sort ideas: Validated (not archived) first, then Draft/Validating, then Archived?
    // User requested: "Mark ideas as 'archived' if all validations are inaccessible"
    const sortedIdeas = [...ideas].sort((a, b) => {
        // Priority: Validated (active) > Draft/Validating > Archived
        const aStatus = a.isArchived ? -1 : a.status === 'validated' ? 1 : 0
        const bStatus = b.isArchived ? -1 : b.status === 'validated' ? 1 : 0

        if (aStatus !== bStatus) {
            return bStatus - aStatus
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Your Ideas
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage and track your startup validation journey.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <CompareIdeasButton
                        validatedIdeas={validatedIdeas}
                        tierLimit={tierLimit}
                    />
                    <Link href="/new-idea">
                        <Button size="lg" className="rounded-full px-8 shadow-md hover:shadow-lg transition-all gap-2 bg-primary hover:bg-primary/90">
                            <Plus className="h-5 w-5" />
                            New Idea
                        </Button>
                    </Link>
                </div>
            </div>

            {tier === 'free' && !quota.allowed && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center sm:text-left">
                            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 justify-center sm:justify-start">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                Out of validations?
                            </h3>
                            <p className="text-blue-700">
                                Share your validated ideas with the community to earn <span className="font-bold">free validation credits</span>!
                            </p>
                        </div>
                        <Link href="/dashboard#ideas-grid">
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl whitespace-nowrap"
                            >
                                View My Ideas
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {sortedIdeas.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-slate-100 ring-8 ring-slate-50">
                            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-slate-900">No ideas validated yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-8 text-lg leading-relaxed">
                            You haven&apos;t validated any ideas yet. Create your first one and let AI help you analyze its potential.
                        </p>
                        <Link href="/new-idea">
                            <Button size="lg" className="rounded-xl px-10 transition-all">
                                Create Your First Idea
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div id="ideas-grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedIdeas.map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                    ))}
                </div>
            )}

            {/* Archived Reports Section for Free Tier */}
            {tier === 'free' && archivedIdeas.length > 0 && (
                <div className="pt-12 border-t">
                    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-bold border border-amber-200">
                                    <Lock className="h-4 w-4" />
                                    {archivedIdeas.length} Archived {archivedIdeas.length === 1 ? 'Report' : 'Reports'}
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900">Restore your past validations</h2>
                                <p className="text-muted-foreground text-lg max-w-xl">
                                    You have {archivedIdeas.length} archived reports from {
                                        Array.from(new Set(archivedIdeas.map(i => new Date(i.archived_at!).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })))).join(', ')
                                    }.
                                    Upgrade to Pro to restore all your past validations and never lose an insight.
                                </p>
                            </div>
                            <Link href="/pricing">
                                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-10 py-7 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all gap-2">
                                    Upgrade to Pro
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
