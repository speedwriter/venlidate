import Link from 'next/link'
import { getUserIdeas } from '@/app/actions/ideas'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Activity, Sparkles } from 'lucide-react'
import { IdeaCard } from '@/components/features/idea-card'

export default async function DashboardPage() {
    const result = await getUserIdeas()

    if (!result.success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-red-500 mb-4">Error: {result.error || 'Failed to load ideas'}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        )
    }

    const ideas = result.data || []

    // Sort ideas: Validated first, then by created_at desc
    const sortedIdeas = [...ideas].sort((a, b) => {
        // Priority to validated ideas
        const aValidated = a.status === 'validated' ? 1 : 0
        const bValidated = b.status === 'validated' ? 1 : 0

        if (aValidated !== bValidated) {
            return bValidated - aValidated
        }

        // Then sort by created_at desc
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Your Ideas
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage and track your startup validation journey.
                    </p>
                </div>
                <Link href="/new-idea">
                    <Button size="lg" className="rounded-full px-8 shadow-md hover:shadow-lg transition-all gap-2 bg-primary hover:bg-primary/90">
                        <Plus className="h-5 w-5" />
                        New Idea
                    </Button>
                </Link>
            </div>

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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedIdeas.map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                    ))}
                </div>
            )}
        </div>
    )
}
