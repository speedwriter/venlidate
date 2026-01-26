import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
    name: string;
    score: number;
    reasoning: string;
}

export function ScoreCard({ name, score, reasoning }: ScoreCardProps) {
    const getScoreColor = (s: number) => {
        if (s <= 4) return "border-red-500 text-red-600";
        if (s <= 7) return "border-yellow-500 text-yellow-600";
        return "border-green-500 text-green-600";
    };

    const colorClass = getScoreColor(score);

    return (
        <Card className={cn("border-l-4 transition-all hover:shadow-md", colorClass)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {name}
                    </CardTitle>
                    <span className={cn("text-2xl font-bold", colorClass.split(' ')[1])}>
                        {score}/10
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                    {reasoning}
                </p>
            </CardContent>
        </Card>
    );
}
