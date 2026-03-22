'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreCard } from "./score-card";


import { Tables } from "@/types/database";
import { ValidationResult } from "@/types/validations";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, TrendingUp, History, Lightbulb, BarChart3, ChevronDown, ExternalLink, Target } from "lucide-react";
import { cn, getScoreColor } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { exportReportToPDF } from "@/lib/utils/pdf-export";
import { FileDown, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareIdeaModal } from "./share-idea-modal";
import { ThinkingQuestionsCard } from "./thinking-questions-card";
import { ActionPlanCard } from "./action-plan-card";
import { ActionPlanUpgradeCTA } from "./action-plan-upgrade-cta";
import { ScoreImprovementBanner } from "./score-improvement-banner";
import { IterationTimeline } from "./iteration-timeline";
import { NextStepsCard } from "./next-steps-card";
import { ComparableCompaniesCard } from "./comparable-companies-card";




interface ValidationReportProps {
    validation: ValidationResult;
    idea: Tables<"ideas"> & { isArchived?: boolean };
    history?: ValidationResult[];
    percentile?: number;
    isShared?: boolean;
    sharedIdeaId?: string;
    userTier?: 'free' | 'pro' | 'premium';
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
    isShared: initialIsShared = false,
    sharedIdeaId: initialSharedIdeaId,
    userTier = 'free'
}: ValidationReportProps) {
    const [canExport, setCanExport] = useState<boolean | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isActuallyArchived] = useState(idea.isArchived || false);

    const [isShared, setIsShared] = useState(initialIsShared);
    const [sharedIdeaId, setSharedIdeaId] = useState(initialSharedIdeaId);
    const [isUnsharing, setIsUnsharing] = useState(false);

    useEffect(() => {
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
        { name: "Painkiller", score: validation.painkillerScore.score, reasoning: validation.painkillerScore.reasoning, dimensionKey: "painkiller" },
        { name: "Revenue Model", score: validation.revenueModelScore.score, reasoning: validation.revenueModelScore.reasoning, dimensionKey: "revenueModel" },
        { name: "Acquisition", score: validation.acquisitionScore.score, reasoning: validation.acquisitionScore.reasoning, dimensionKey: "acquisition" },
        { name: "Moat", score: validation.moatScore.score, reasoning: validation.moatScore.reasoning, dimensionKey: "moat" },
        { name: "Founder Fit", score: validation.founderFitScore.score, reasoning: validation.founderFitScore.reasoning, dimensionKey: "founderFit" },
        { name: "Time to Revenue", score: validation.timeToRevenueScore.score, reasoning: validation.timeToRevenueScore.reasoning, dimensionKey: "timeToRevenue" },
        { name: "Scalability", score: validation.scalabilityScore.score, reasoning: validation.scalabilityScore.reasoning, dimensionKey: "scalability" },
    ];

    function getDimensionDisplayName(key: string): string {
        const names: Record<string, string> = {
            painkiller: 'Painkiller vs. Vitamin',
            revenueModel: 'Revenue Model',
            acquisition: 'Customer Acquisition',
            moat: 'Competitive Moat',
            founderFit: 'Founder-Market Fit',
            timeToRevenue: 'Time to Revenue',
            scalability: 'Scalability',
        }
        return names[key] || key
    }

    const totalThinkingQuestions = validation.thinkingQuestions
        ? Object.values(validation.thinkingQuestions).reduce((acc, curr) => acc + curr.length, 0)
        : 0;

    const redFlags = validation.redFlags || [];
    const recommendations = validation.recommendations || [];
    const comparableCompanies = validation.comparableCompanies || [];




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

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-6 pb-6 border-b">
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


                {/* Score Improvement Banner */}
                {(history.length > 0) && (
                    <ScoreImprovementBanner
                        currentScore={validation.overallScore}
                        previousScore={history[0].overallScore}
                    />
                )}

                <Tabs defaultValue="scores" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1">
                        <TabsTrigger value="scores" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Scores Breakdown</span>
                            <span className="sm:hidden">Scores</span>
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                            <Lightbulb className="h-4 w-4" />
                            <span className="hidden sm:inline">Deep Insights</span>
                            <span className="sm:hidden">Insights</span>
                        </TabsTrigger>
                        <TabsTrigger value="action-plan" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                            <Target className="h-4 w-4" />
                            <span className="hidden sm:inline">Personalized Action Plan</span>
                            <span className="sm:hidden">Plan</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-2">
                            <History className="h-4 w-4" />
                            <span className="hidden sm:inline">Iteration History</span>
                            <span className="sm:hidden">History</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scores" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dimensionScores.map((dim) => (
                                <div key={dim.dimensionKey} className="flex flex-col">
                                    <ScoreCard
                                        name={dim.name}
                                        score={dim.score}
                                        reasoning={dim.reasoning}
                                    />
                                    {validation.thinkingQuestions?.[dim.dimensionKey] && (
                                        <ThinkingQuestionsCard
                                            questions={validation.thinkingQuestions[dim.dimensionKey]}
                                            dimensionName={getDimensionDisplayName(dim.dimensionKey)}
                                            score={dim.score}
                                        />
                                    )}
                                </div>
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
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight">Comparable Companies</h3>
                                    <p className="text-sm text-muted-foreground">Learning from those who paved the way</p>
                                </div>
                                <ComparableCompaniesCard
                                    companies={comparableCompanies}
                                    userTier={userTier}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="action-plan" className="mt-0 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black tracking-tight">Personalized Action Plan</h2>
                                <p className="text-muted-foreground">Your step-by-step roadmap to validating and building this idea.</p>
                            </div>
                        </div>

                        {userTier === 'free' ? (
                            <ActionPlanUpgradeCTA />
                        ) : (
                            validation.actionPlan ? (
                                <ActionPlanCard actionPlan={validation.actionPlan} tier={userTier} />
                            ) : (
                                <Card className="p-8 text-center bg-muted/30 border-dashed">
                                    <p className="text-muted-foreground italic">No action plan available for this validation.</p>
                                </Card>
                            )
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <IterationTimeline
                                    validations={[...history, validation].map(v => ({
                                        created_at: v.created_at || new Date().toISOString(),
                                        overall_score: v.overallScore
                                    }))}
                                />
                            </div>

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
                                                                        {snapshot.solution && <SnapshotField label="Solution" value={snapshot.solution} />}
                                                                        <SnapshotField label="Painkiller" value={snapshot.painkillerMoment} />
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

            {/* Next Steps Section */}
            <div className="mt-12">
                <NextStepsCard
                    score={validation.overallScore}
                    tier={userTier}
                    ideaId={idea.id}
                    validationId={validation.id || ''}
                    unansweredQuestionsCount={totalThinkingQuestions}
                    hasActionPlan={!!validation.actionPlan}
                />
            </div>
        </div>
    );
}
