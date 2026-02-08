'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreCard } from "./score-card";
import { TrafficLight } from "./traffic-light";
import { BenchmarkBadge } from "./benchmark-badge";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";
import { Tables } from "@/types/database";
import { ValidationResult } from "@/types/validations";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, TrendingUp, History, Lightbulb, BarChart3, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { exportReportToPDF } from "@/lib/utils/pdf-export";
import { FileDown, Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareIdeaModal } from "./share-idea-modal";



interface ValidationReportProps {
    validation: ValidationResult;
    idea: Tables<"ideas"> & { isArchived?: boolean };
    history?: ValidationResult[];
    percentile?: number;
    isShared?: boolean;
    sharedIdeaId?: string;
}

const SnapshotField = ({ label, value }: { label: string, value: string }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = value.length > 100;

    return (
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            <div className="relative">
                <p className={cn(
                    "text-xs text-foreground transition-all duration-200",
                    !expanded && "line-clamp-3"
                )}>
                    {value}
                </p>
                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground/80 hover:text-primary mt-1 transition-colors"
                    >
                        {expanded ? "Show less" : "Show more"}
                        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", expanded && "rotate-180")} />
                    </button>
                )}
            </div>
        </div>
    );
};

export function ValidationReport({
    validation,
    idea,
    history = [],
    percentile,
    isShared: initialIsShared = false,
    sharedIdeaId: initialSharedIdeaId
}: ValidationReportProps) {
    const [mounted, setMounted] = useState(false);
    const [canExport, setCanExport] = useState<boolean | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isActuallyArchived] = useState(idea.isArchived || false);

    const [isShared, setIsShared] = useState(initialIsShared);
    const [sharedIdeaId, setSharedIdeaId] = useState(initialSharedIdeaId);
    const [isUnsharing, setIsUnsharing] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkPermission = async () => {
            const { canExportPDFAction } = await import("@/app/actions/subscriptions");
            const hasPermission = await canExportPDFAction();
            setCanExport(hasPermission);

            // We don't have created_at readily available on validation anymore
            // We'll skip archival check here or pass it as separate prop if critical
        };
        checkPermission();
    }, [idea.isArchived]);

    const handleExport = async () => {
        if (!canExport || isActuallyArchived) return;
        setIsExporting(true);
        try {
            await exportReportToPDF(idea, validation);
            toast.success("Report exported successfully", {
                description: "Your PDF is being downloaded.",
            });
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Export failed", {
                description: "There was an error generating your PDF. Please try again.",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleUnshare = async () => {
        if (!sharedIdeaId) return;
        setIsUnsharing(true);
        try {
            const { unshareIdea } = await import("@/app/actions/shared-ideas");
            const result = await unshareIdea(sharedIdeaId);
            if (result.success) {
                setIsShared(false);
                setSharedIdeaId(undefined);
                toast.success("Idea unshared", {
                    description: "It has been removed from the community showcase.",
                });
            } else {
                toast.error(result.error || "Failed to unshare idea");
            }
        } catch (error) {
            console.error("Unshare failed:", error);
            toast.error("Unshare failed");
        } finally {
            setIsUnsharing(false);
        }
    };

    const daysAgo = validation.created_at
        ? Math.floor((new Date().getTime() - new Date(validation.created_at).getTime()) / (1000 * 3600 * 24))
        : 0;

    const dimensionScores = [
        { name: "Painkiller", score: validation.painkillerScore.score, reasoning: validation.painkillerScore.reasoning },
        { name: "Revenue Model", score: validation.revenueModelScore.score, reasoning: validation.revenueModelScore.reasoning },
        { name: "Acquisition", score: validation.acquisitionScore.score, reasoning: validation.acquisitionScore.reasoning },
        { name: "Moat", score: validation.moatScore.score, reasoning: validation.moatScore.reasoning },
        { name: "Founder Fit", score: validation.founderFitScore.score, reasoning: validation.founderFitScore.reasoning },
        { name: "Time to Revenue", score: validation.timeToRevenueScore.score, reasoning: validation.timeToRevenueScore.reasoning },
        { name: "Scalability", score: validation.scalabilityScore.score, reasoning: validation.scalabilityScore.reasoning },
    ];

    const redFlags = validation.redFlags || [];
    const recommendations = validation.recommendations || [];
    const comparableCompanies = validation.comparableCompanies || [];

    // History needs careful handling. If we changed history prop to ValidationResult[], it doesn't have created_at.
    // This breaks the chart logic which sorts by date.
    // We probably need a type internal to this component: ValidationResult & { created_at?: string, id?: string }
    // Or ValidationReportProps takes array of { result: ValidationResult, date: string, id: string }
    // Ideally we update ValidationResult type to optional metadata?
    // Let's try to just map scores.

    const chartData = [...history, validation]
        .map((v, index) => ({
            name: `v${index + 1}`,
            score: v.overallScore,
            date: v.created_at ? new Date(v.created_at).toLocaleDateString() : 'N/A',
        }));

    const getScoreColor = (s: number) => {
        if (s < 50) return "#ef4444";
        if (s < 80) return "#f59e0b";
        return "#22c55e";
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 relative">
            {/* Archived Banner */}
            {isActuallyArchived && (
                <div className="sticky top-4 z-50 bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl shadow-xl backdrop-blur-md mb-8 ring-8 ring-amber-50/50 animate-in slide-in-from-top duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="bg-amber-100 p-3 rounded-2xl">
                                <AlertTriangle className="h-8 w-8 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-amber-900">Report Archived</h3>
                                <p className="text-amber-800/80">
                                    This report was created <span className="font-bold">{daysAgo} days ago</span> and is no longer accessible on the free plan.
                                </p>
                            </div>
                        </div>
                        {/* <Link href="/pricing" className="w-full md:w-auto">
                            <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all gap-2">
                                <Sparkles className="h-5 w-5 text-amber-200" />
                                Upgrade to Pro to Restore
                            </Button>
                        </Link> */}
                        <Button size="lg" className="w-full bg-slate-200 text-slate-500 font-bold px-8 rounded-2xl cursor-not-allowed" disabled>
                            Upgrade Coming Soon
                        </Button>

                    </div>
                </div>
            )}

            <div className={cn(
                "transition-all duration-700 space-y-8",
                isActuallyArchived && "blur-md pointer-events-none select-none opacity-50 grayscale-[0.5]"
            )}>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                            Validation Report
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{idea.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <TrafficLight trafficLight={validation.trafficLight} />
                            <BenchmarkBadge percentile={percentile || 0} />
                            <span className="text-xs text-muted-foreground italic" suppressHydrationWarning>
                                Validated on {validation.created_at ? new Date(validation.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border backdrop-blur-sm">
                        <div className="text-right">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Overall Score</p>
                            <p className="text-5xl font-black tracking-tighter" style={{ color: getScoreColor(validation.overallScore) }}>
                                {validation.overallScore}<span className="text-2xl text-muted-foreground/50">/100</span>
                            </p>
                        </div>
                    </div>

                    {/* Share Button / Shared Status */}
                    <div className="flex items-center gap-2">
                        {isShared ? (
                            <div className="flex items-center gap-2">
                                <Link href="/ideas" className="no-underline">
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1.5 py-1.5 px-3 rounded-xl cursor-pointer">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Shared with Community
                                        <ExternalLink className="h-3 w-3 ml-0.5 opacity-50" />
                                    </Badge>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUnshare}
                                    disabled={isUnsharing}
                                    className="h-9 px-3 text-xs font-bold text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    {isUnsharing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                    Unshare
                                </Button>
                            </div>
                        ) : (validation.id ? (
                            <ShareIdeaModal
                                validationId={validation.id}
                                ideaTitle={idea.title}
                                onSuccess={() => setIsShared(true)}
                            />
                        ) : null)}

                        <div className="w-px h-8 bg-border/50 mx-1" />

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Button
                                            variant={canExport ? "default" : "outline"}
                                            size="sm"
                                            onClick={handleExport}
                                            disabled={canExport === false || isExporting}
                                            className={cn(
                                                "gap-2 h-10 px-4 font-bold transition-all rounded-xl",
                                                canExport === false && "opacity-50 grayscale"
                                            )}
                                        >
                                            {isExporting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : canExport === false ? (
                                                <Lock className="h-4 w-4" />
                                            ) : (
                                                <FileDown className="h-4 w-4" />
                                            )}
                                            {isExporting ? "Exporting..." : "Export as PDF"}
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!canExport && canExport !== null && (
                                    <TooltipContent>
                                        <p>Upgrade to Pro to export reports</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <Tabs defaultValue="scores" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 p-1">
                        <TabsTrigger value="scores" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Scores Breakdown</span>
                            <span className="sm:hidden">Scores</span>
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Lightbulb className="h-4 w-4" />
                            <span className="hidden sm:inline">Deep Insights</span>
                            <span className="sm:hidden">Insights</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <History className="h-4 w-4" />
                            <span className="hidden sm:inline">Iteration History</span>
                            <span className="sm:hidden">History</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scores" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dimensionScores.map((dim) => (
                                <ScoreCard key={dim.name} {...dim} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="insights" className="mt-0 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Red Flags & Recommendations */}
                            <div className="space-y-8">
                                {redFlags.length > 0 && (
                                    <Card className="border-red-100 bg-red-50/30 overflow-hidden">
                                        <CardHeader className="bg-red-50/50 border-b border-red-100">
                                            <CardTitle className="flex items-center gap-2 text-red-700">
                                                <AlertTriangle className="h-5 w-5" />
                                                Critical Red Flags
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <ul className="space-y-4">
                                                {redFlags.map((flag, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-red-900 leading-relaxed">
                                                        <span className="h-5 w-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                                                            {i + 1}
                                                        </span>
                                                        {flag}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card className="border-green-100 bg-green-50/30 overflow-hidden">
                                    <CardHeader className="bg-green-50/50 border-b border-green-100">
                                        <CardTitle className="flex items-center gap-2 text-green-700">
                                            <TrendingUp className="h-5 w-5" />
                                            Strategic Recommendations
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ul className="space-y-4">
                                            {recommendations.map((rec, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-green-900 leading-relaxed">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Comparable Companies */}
                            <Card className="overflow-hidden">
                                <CardHeader className="border-b bg-muted/20">
                                    <CardTitle>Comparable Companies</CardTitle>
                                    <CardDescription>Learning from those who paved the way</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {comparableCompanies.map((company, i) => (
                                            <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-foreground">{company.name}</p>
                                                    <p className="text-xs text-muted-foreground">{company.similarity}</p>
                                                </div>
                                                <Badge
                                                    variant={company.outcome === 'success' ? 'default' : 'secondary'}
                                                    className={cn(
                                                        "capitalize",
                                                        company.outcome === 'success' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                                                    )}
                                                >
                                                    {company.outcome}
                                                </Badge>
                                            </div>
                                        ))}
                                        {comparableCompanies.length === 0 && (
                                            <div className="p-8 text-center text-muted-foreground italic">
                                                No comparable companies identified at this stage.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Score Progression</CardTitle>
                                    <CardDescription>How your idea is evolving over time</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px] pt-4">
                                    {mounted ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#888', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    domain={[0, 100]}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#888', fontSize: 12 }}
                                                />
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="#3b82f6"
                                                    strokeWidth={4}
                                                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg" />
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Iteration Log</CardTitle>
                                    <CardDescription>Recent validation rounds</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="border-t">
                                        <Accordion type="single" collapsible className="w-full">
                                            {[...history, validation].reverse().map((v, i) => {
                                                const iterationNumber = [...history, validation].length - i;
                                                const snapshot = v.ideaSnapshot || null;

                                                return (
                                                    <AccordionItem key={i} value={`val-${i}`}>
                                                        <AccordionTrigger className="px-4 hover:no-underline">
                                                            <div className="flex items-center justify-between w-full pr-4">
                                                                <div className="text-left space-y-1">
                                                                    <p className="text-sm font-medium">Iteration {iterationNumber}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-normal">
                                                                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <span className="text-lg font-black tracking-tighter" style={{ color: getScoreColor(v.overallScore) }}>
                                                                    {v.overallScore}
                                                                </span>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="bg-muted/10">
                                                            {snapshot ? (
                                                                <div className="px-4 py-3 space-y-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <SnapshotField label="Problem" value={snapshot.problem} />
                                                                        <SnapshotField label="Solution / Painkiller" value={snapshot.painkillerMoment} />
                                                                        <SnapshotField label="Target Customer" value={snapshot.targetCustomer} />
                                                                        <SnapshotField label="Revenue Model" value={snapshot.revenueModel} />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
                                                                    No input snapshot available for this iteration.
                                                                </div>
                                                            )}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
