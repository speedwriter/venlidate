'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { revalidateIdea } from "@/app/actions/ideas"
import { toast } from "sonner"

interface RevalidateButtonProps {
    ideaId: string
}

export function RevalidateButton({ ideaId }: RevalidateButtonProps) {
    const [isPending, setIsPending] = React.useState(false)
    const router = useRouter()


    async function handleRevalidate() {
        setIsPending(true)
        try {
            const result = await revalidateIdea(ideaId)
            if (!result.success) {
                toast.error(result.error || "Failed to revalidate idea")
                throw new Error(result.error || "Failed to revalidate idea")
            }
            toast.success("Idea revalidated successfully!")
            router.refresh()
        } catch (error) {
            console.error(error)
            if (!(error instanceof Error && error.message.includes("NEXT_REDIRECT"))) {
                toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
            }
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Button
            onClick={handleRevalidate}
            disabled={isPending}
            variant="outline"
            className="flex items-center gap-2"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Revalidating...
                </>
            ) : (
                <>
                    <RefreshCw className="h-4 w-4" />
                    Revalidate Idea
                </>
            )}
        </Button>
    )
}
