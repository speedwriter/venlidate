import { getSharedIdeas } from "@/app/actions/shared-ideas"
import { IdeaPendingCard } from "@/components/features/idea-pending-card"
import { IdeaApprovedCard } from "@/components/features/idea-approved-card"
import { AdminIdeaForm } from "@/components/features/admin-idea-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SharedIdea } from "@/types/shared-ideas"

export default async function AdminSharedIdeasPage() {
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        getSharedIdeas('pending'),
        getSharedIdeas('approved'),
        getSharedIdeas('rejected')
    ])

    const pendingIdeas = pendingRes.success ? pendingRes.data : []
    const approvedIdeas = approvedRes.success ? approvedRes.data : []
    const rejectedIdeas = rejectedRes.success ? rejectedRes.data : []

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shared Ideas Moderation</h1>
                    <p className="text-muted-foreground mt-1">
                        Review, approve, and manage community shared ideas.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
                    <TabsTrigger value="pending" className="relative">
                        Pending Approval
                        {pendingIdeas && pendingIdeas.length > 0 && (
                            <Badge className="ml-2 bg-orange-500 hover:bg-orange-600 border-none px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center">
                                {pendingIdeas.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approved">Recently Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="create">Create Curated</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-6">
                    {pendingIdeas && pendingIdeas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingIdeas.map((idea: SharedIdea) => (
                                <IdeaPendingCard key={idea.id} sharedIdea={idea} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed border-muted">
                            <h3 className="text-lg font-medium text-muted-foreground">No pending ideas</h3>
                            <p className="text-sm text-muted-foreground">All caught up!</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-6">
                    {approvedIdeas && approvedIdeas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {approvedIdeas.map((idea: SharedIdea) => (
                                <IdeaApprovedCard key={idea.id} sharedIdea={idea} mode="approved" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed border-muted">
                            <h3 className="text-lg font-medium text-muted-foreground">No approved ideas yet</h3>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-6">
                    {rejectedIdeas && rejectedIdeas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rejectedIdeas.map((idea: SharedIdea) => (
                                <IdeaApprovedCard key={idea.id} sharedIdea={idea} mode="rejected" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed border-muted">
                            <h3 className="text-lg font-medium text-muted-foreground">No rejected ideas</h3>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="create" className="max-w-2xl">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold">Create Curated Idea</h3>
                        <p className="text-sm text-muted-foreground">
                            Manually create and validate an idea that gets immediately approved for the marketplace.
                        </p>
                    </div>
                    <AdminIdeaForm />
                </TabsContent>
            </Tabs>
        </div>
    )
}
