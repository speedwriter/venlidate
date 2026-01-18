import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowRight, Activity } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // Layout handles redirect, but good for type safety
        return null
    }

    const { data: ideas } = await supabase
        .from('ideas')
        .select(`
            *,
            validations (
                id,
                overall_score,
                created_at
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Helper to get latest validation
    const getLatestValidation = (validations: any[]) => {
        if (!validations || validations.length === 0) return null
        // Sort by created_at desc just in case, though usually reliable if query ordered (we didn't order nested yet)
        return validations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-800 hover:bg-green-100"
        if (score >= 50) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        return "bg-red-100 text-red-800 hover:bg-red-100"
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Ideas</h1>
                    <p className="text-muted-foreground">Manage and validate your startup ideas.</p>
                </div>
                <Link href="/new-idea">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Idea
                    </Button>
                </Link>
            </div>

            {!ideas || ideas.length === 0 ? (
                <Card className="bg-slate-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Start your validation journey by creating your first startup idea. We'll help you analyze its potential.
                        </p>
                        <Link href="/new-idea">
                            <Button>Create Your First Idea</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {ideas.map((idea) => {
                        const latestValidation = getLatestValidation(idea.validations)

                        return (
                            <Card key={idea.id} className="flex flex-col hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-xl line-clamp-1" title={idea.title}>
                                            {idea.title}
                                        </CardTitle>
                                        {latestValidation ? (
                                            <Badge className={getScoreColor(latestValidation.overall_score)} variant="secondary">
                                                {latestValidation.overall_score}/100
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-500">Draft</Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Created {new Date(idea.created_at).toLocaleDateString()}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 pb-4">
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {idea.description || 'No description provided.'}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Link href={`/dashboard/${idea.id}`} className="w-full">
                                        <Button variant="outline" className="w-full gap-2 group">
                                            View Details
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
