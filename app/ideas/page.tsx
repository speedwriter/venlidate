import { getCurrentUser } from '@/lib/utils/auth-utils'
import { getSharedIdeas } from '@/app/actions/shared-ideas'
import { getUserTierAction } from '@/app/actions/subscriptions'
import { IdeaCard } from '@/components/features/idea-card'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { SharedIdea } from '@/types/shared-ideas'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Startup Idea Marketplace - Browse & Discover Validated Opportunities | Venlidate",
    description: "Explore 200+ startup ideas validated across 7 business fundamentals. Get inspiration for your next project, see what's working, and access deep AI analysis.",
}

export const dynamic = 'force-dynamic'

export default async function IdeasMarketplace() {
    const user = await getCurrentUser()
    const isAuthenticated = !!user
    const limit = isAuthenticated ? 50 : 10
    const { data: ideas = [] } = await getSharedIdeas('approved', limit, 0)
    const userTier = await getUserTierAction()

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 md:py-24">
                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Explore the Future</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
                        Browse 200+ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Validated</span> Startup Ideas
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 font-medium leading-relaxed">
                        Real-world problems scored by AI. Get inspired by what others are building, then validate your own vision.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/new-idea" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl gap-2 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                                    Validate Your Own Idea
                                    <Sparkles className="h-4 w-4 text-yellow-300" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl gap-2 shadow-xl">
                                    Sign Up Free to See All
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        {!isAuthenticated && (
                            <p className="text-sm font-bold text-slate-400">
                                Limited preview. Sign up to see full analysis.
                            </p>
                        )}
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px]" />
                </div>
            </section>

            {/* Ideas Grid */}
            <main className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ideas && ideas.map((idea: SharedIdea) => (
                        <IdeaCard
                            key={idea.id}
                            idea={{
                                ...idea,
                                created_at: idea.created_at || new Date().toISOString(),
                                status: 'approved'
                            } as any}
                            mode="marketplace"
                            isAuthenticated={isAuthenticated}
                            userTier={userTier}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {(!ideas || ideas.length === 0) && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-500 font-bold">No ideas shared yet. Be the first to share!</p>
                    </div>
                )}

                {/* Bottom CTA */}
                {!isAuthenticated && (
                    <div className="mt-20 p-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl relative overflow-hidden text-center text-white">
                        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                Want to see more?
                            </h2>
                            <p className="text-lg text-blue-100 font-medium">
                                Sign up free to browse 200+ validated ideas, or validate your own idea to earn access.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link href="/login" className="w-full sm:w-auto text-blue-600">
                                    <Button size="lg" className="w-full h-14 px-8 bg-white hover:bg-slate-50 font-black rounded-2xl shadow-xl">
                                        Sign Up Free
                                    </Button>
                                </Link>
                                <span className="font-bold text-blue-200">OR</span>
                                <Link href="/new-idea" className="w-full sm:w-auto">
                                    <Button size="lg" variant="outline" className="w-full h-14 px-8 border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl">
                                        Validate Your own
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Background Lock Icon */}
                        <Lock className="absolute bottom-[-40px] right-[-40px] h-64 w-64 text-white/10 rotate-12" />
                    </div>
                )}
            </main>
        </div>
    )
}
