import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto p-8 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-4 w-[350px]" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card text-card-foreground shadow space-y-4 p-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-[100px]" />
                            <Skeleton className="h-8 w-[100px]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
