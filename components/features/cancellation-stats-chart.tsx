'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface CancellationStatsChartProps {
    data: Array<{ reason: string; count: number; percentage: number }>
}


interface TooltipPayload {
    value: number
    payload: { percentage: number }
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border rounded shadow-sm text-sm">
                <p className="font-semibold capitalize">{label}</p>
                <p className="text-blue-600">Count: {payload[0].value}</p>
                <p className="text-gray-500">Percentage: {payload[0].payload.percentage}%</p>
            </div>
        )
    }
    return null
}

export function CancellationStatsChart({ data }: CancellationStatsChartProps) {
    const chartData = data.map(item => ({
        name: item.reason.replace(/_/g, ' '), // Convert 'too_expensive' to 'too expensive'
        count: item.count,
        percentage: item.percentage,
        fullReason: item.reason
    }))

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Cancellation Reasons</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
