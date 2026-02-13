import { getSharedIdeaById } from '@/app/actions/shared-ideas'
import { getCurrentUser } from '@/lib/utils/auth-utils'
import { getUserTierAction } from '@/app/actions/subscriptions'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Lock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { IdeaDetailModal, SharedIdeaDetail } from '@/components/features/idea-detail-modal'

interface PageProps {
    params: Promise<{ ideaId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { ideaId } = await params
    const { data: idea } = await getSharedIdeaById(ideaId)

    if (!idea || idea.status !== 'approved') {
        return {
            title: 'Idea Not Found - Venlidate'
        }
    }

    const problemSnippet = idea.problem.substring(0, 150) + '...'

    return {
        title: `${idea.title} - Validated Startup Idea`,
        description: `Scored ${idea.overall_score}/100. ${problemSnippet}`,
        openGraph: {
            title: `${idea.title} - Validated Startup Idea`,
            description: `Scored ${idea.overall_score}/100. ${problemSnippet}`,
            images: [
                {
                    url: `/api/og?title=${encodeURIComponent(idea.title)}&score=${idea.overall_score}&light=${idea.traffic_light}`,
                    width: 1200,
                    height: 630,
                    alt: idea.title,
                }
            ],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${idea.title} - Validated Startup Idea`,
            description: `Scored ${idea.overall_score}/100. ${problemSnippet}`,
            images: [`/api/og?title=${encodeURIComponent(idea.title)}&score=${idea.overall_score}&light=${idea.traffic_light}`],
        }
    }
}

export default async function IdeaPage({ params }: PageProps) {
    const { ideaId } = await params
    const { data: idea } = await getSharedIdeaById(ideaId)
    const user = await getCurrentUser()
    const isAuthenticated = !!user
    const userTier = await getUserTierAction()

    if (!idea || idea.status !== 'approved') {
        notFound()
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": `${idea.title} - Validated Startup Idea`,
                        "description": idea.problem,
                        "author": {
                            "@type": "Organization",
                            "name": "Venlidate"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Venlidate"
                        },
                        "datePublished": idea.created_at,
                        "dateModified": idea.updated_at || idea.created_at
                    })
                }}
            />

            <div className="container mx-auto px-4 py-8">
                <Link href="/ideas" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors group">
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Marketplace
                </Link>

                <div className="max-w-4xl mx-auto">
                    {/* Reuse the modal content logic but as a page component */}
                    {/* Since IdeaDetailModal is a Dialog, we might want a View version. 
                        For now, we can render the inner content or just trigger the modal state.
                        Actually, better to have a dedicated DetailView component.
                    */}
                    <IdeaDetailModal
                        sharedIdea={idea as unknown as SharedIdeaDetail}
                        isAuthenticated={isAuthenticated}
                        userTier={userTier}
                        isOpen={true}
                        onOpenChange={() => { }} // Always open on this page
                    />
                </div>
            </div>

            {/* Sticky Bottom Bar for Public Users */}
            {!isAuthenticated && (
                <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-50 animate-in slide-in-from-bottom duration-500">
                    <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-xl">
                                <Lock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 leading-tight">Full Analysis Locked</p>
                                <p className="text-xs font-medium text-slate-500">Sign up to see 7+ dimension scores & recommendations</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Link href={`/login?redirectTo=/ideas/${ideaId}`} className="flex-1 sm:flex-none">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl h-12 px-8 shadow-lg">
                                    Sign Up Free
                                </Button>
                            </Link>
                            <Link href="/new-idea" className="flex-1 sm:flex-none">
                                <Button variant="outline" className="w-full h-12 px-8 font-black rounded-xl border-slate-200 bg-white">
                                    Validate Your own
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
