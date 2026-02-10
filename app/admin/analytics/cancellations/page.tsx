import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isUserAdmin } from '@/lib/utils/admin'
import { getCancellationStats } from '@/app/actions/cancellation'
import { CancellationStatsChart } from '@/components/features/cancellation-stats-chart'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function CancellationAnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const isAdmin = await isUserAdmin(user.id)
    if (!isAdmin) {
        redirect('/dashboard')
    }

    const { success, data: stats, error } = await getCancellationStats()

    if (!success || !stats) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">Error loading stats</h1>
                <p>{error || 'Unknown error'}</p>
            </div>
        )
    }

    const chartData = stats.byReason.map(item => ({
        reason: item.reason,
        count: item.count,
        percentage: item.percentage
    }))

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cancellation Analytics</h1>
                <p className="text-muted-foreground mt-2">
                    Understand why users are leaving and review their feedback.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Total Cancellations</CardTitle>
                        <CardDescription>All time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Key Insights</CardTitle>
                        <CardDescription>Top reasons for churn</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.byReason.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex justify-between items-center mb-2 last:mb-0">
                                <span className="capitalize font-medium block">
                                    {item.reason.replace(/_/g, ' ')}
                                </span>
                                <Badge variant="secondary">{item.percentage}% ({item.count})</Badge>
                            </div>
                        ))}
                        {stats.byReason.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CancellationStatsChart data={chartData} />

                <Card className="max-h-[500px] overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Feedback</CardTitle>
                        <CardDescription>Latest comments from users</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-auto flex-1 p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Feedback</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentFeedback.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize text-xs">
                                                {item.tier}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="capitalize text-sm font-medium">
                                            {item.reason.replace(/_/g, ' ')}
                                        </TableCell>
                                        <TableCell className="text-sm max-w-[200px] truncate" title={item.feedback}>
                                            {item.feedback || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {stats.recentFeedback.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No feedback recorded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
