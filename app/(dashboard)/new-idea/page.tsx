import { IdeaForm } from "@/components/features/idea-form"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export default function NewIdeaPage() {
    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>New Idea</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Submit New Idea</h1>
                <p className="text-muted-foreground">
                    Fill out the form below to get your idea validated by our AI engine.
                </p>
            </div>

            <IdeaForm />
        </div>
    )
}
