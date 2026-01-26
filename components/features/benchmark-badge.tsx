import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, Star } from "lucide-react";

interface BenchmarkBadgeProps {
    percentile: number;
}

export function BenchmarkBadge({ percentile }: BenchmarkBadgeProps) {
    // Only show for Top 25%
    if (percentile > 25 || percentile <= 0) return null;

    const isTop10 = percentile <= 10;

    return (
        <Badge
            variant="secondary"
            className={cn(
                "transition-all duration-300 font-bold px-3 py-1 gap-1.5",
                isTop10
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-sm"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            )}
        >
            {isTop10 ? (
                <Trophy className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            ) : (
                <Star className="h-3.5 w-3.5 text-blue-500" />
            )}
            Top {percentile}% this month
        </Badge>
    );
}
