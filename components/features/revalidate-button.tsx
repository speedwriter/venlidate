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
    const router = useRouter()

    function handleRevalidate() {
        router.push(`/dashboard/${ideaId}/revalidate`)
    }

    return (
        <Button
            onClick={handleRevalidate}
            variant="outline"
            className="flex items-center gap-2"
        >
            <RefreshCw className="h-4 w-4" />
            Revalidate Idea
        </Button>
    )
}
