import { createClient } from "@/lib/supabase/server"
import { getUserTier } from "@/lib/utils/subscriptions"
import { PricingTable } from "@/components/features/pricing-table"
import { redirect } from "next/navigation"

export default async function PricingPage() {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect("/login?returnTo=/pricing")
    }

    const currentTier = await getUserTier(user.id)

    return (
        <div className="container py-12 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                    Choose the Perfect Plan for Your Next Big Idea
                </h1>
                <p className="max-w-[700px] text-lg text-muted-foreground">
                    Get the data-driven insights you need to validate your product-market fit.
                    Start for free, upgrade when you&apos;re ready to scale.
                </p>
            </div>

            <PricingTable currentTier={currentTier} />
        </div>
    )
}
