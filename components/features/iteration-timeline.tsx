'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface IterationTimelineProps {
    validations: Array<{
        created_at: string
        overall_score: number
    }>
}

export function IterationTimeline({ validations }: IterationTimelineProps) {
    // Sort oldest to newest for the chart
    const chartData = [...validations]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((v, index) => ({
            iteration: `V${index + 1}`,
            score: v.overall_score,
            date: new Date(v.created_at).toLocaleDateString(),
            fullDate: new Date(v.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        }))

    const currentScore = chartData[chartData.length - 1]?.score || 0
    const maxScore = Math.max(...chartData.map(d => d.score))

    const improvement = chartData.length > 1 ? currentScore - chartData[0].score : 0

    return (
        <Card className="mb-8">
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Iteration History</CardTitle>
                        <CardDescription>
                            You&apos;ve validated this idea {validations.length} times
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-sm">
                            Best: {maxScore}
                        </Badge>
                        <Badge
                            variant={improvement > 0 ? "default" : "secondary"}
                            className={`${improvement > 0 ? "bg-green-600 hover:bg-green-700" : ""}`}
                        >
                            Total Change: {improvement > 0 ? '+' : ''}{improvement}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="iteration"
                                tickLine={false}
                                axisLine={false}
                                padding={{ left: 20, right: 20 }}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-popover border text-popover-foreground rounded-lg shadow-md p-3 text-sm">
                                                <div className="font-semibold mb-1">{data.iteration}: {data.score}/100</div>
                                                <div className="text-muted-foreground text-xs">{data.fullDate}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <ReferenceLine y={70} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#2563eb"
                                strokeWidth={3}
                                connectNulls={true}
                                dot={{ r: 4, strokeWidth: 2, fill: "#ffffff", stroke: "#2563eb" }}
                                activeDot={{ r: 6, strokeWidth: 2, fill: "#2563eb", stroke: "#ffffff" }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 text-sm text-muted-foreground text-center">
                    {currentScore >= 70 ? (
                        <span className="text-green-600 font-medium">🎉 Your idea is in the green zone! Ready to build.</span>
                    ) : (
                        <span>Keep iterating! You&apos;re <span className="font-medium text-foreground">{70 - currentScore} points</span> away from the green zone (70+).</span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
