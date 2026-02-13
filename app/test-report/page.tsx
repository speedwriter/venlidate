import { ValidationReport } from "@/components/features/validation-report";
import { Tables } from "@/types/database";
import { ValidationResult } from "@/types/validations";

const mockIdea: Tables<"ideas"> = {
    id: "idea-123",
    title: "AI-Powered Personal Greenhouse Assistant",
    problem: "Urban dwellers struggle to maintain indoor plants due to lack of knowledge and consistent care.",
    solution: "An AI-powered app that connects to soil sensors and provides personalized care instructions using computer vision.",
    target_customer: "Millennial urban professionals living in apartments.",
    distribution_channel: "Instagram/TikTok influencers in the #PlantParent community.",
    painkiller_moment: "Receiving a notification that their Rare Monstera needs 'exactly 200ml of water and 2 hours of indirect light' right now.",
    revenue_model: "SaaS subscription for advanced monitoring + Affiliate commissions on plant care products.",
    unfair_advantage: "Proprietary computer vision model trained on 1M+ rare plant health images.",
    time_commitment: "full_time",
    status: "validated",
    user_id: "user-456",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
};

const mockValidation: unknown = {
    id: "val-789",
    idea_id: "idea-123",
    user_id: "user-456",
    overallScore: 82,
    trafficLight: "green",
    painkillerScore: { score: 9, reasoning: "Strong emotional connection to plant health among the target demographic. High willingness to pay for 'peace of mind'." },
    revenueModelScore: { score: 7, reasoning: "Subscription model is standard but requires high retention. Affiliate model adds nice diversified upside." },
    acquisitionScore: { score: 8, reasoning: "Highly visual product perfectly suited for social media discovery. Strong organic growth potential." },
    moatScore: { score: 8, reasoning: "The proprietary dataset of rare plant images provides a defensible data moat over time." },
    founderFitScore: { score: 9, reasoning: "Team has background in both AI/ML and horticulture. Perfect alignment with the problem space." },
    timeToRevenueScore: { score: 6, reasoning: "Requires hardware integration or high-fidelity image processing which takes time to refine.", estimate: "4-6 months" },
    scalabilityScore: { score: 9, reasoning: "Zero marginal cost for AI analysis. Can easily expand to B2B (nurseries) in the future." },
    redFlags: [
        "High churn potential if plant health doesn't visibly improve within 30 days.",
        "Hardware competitors might bundle similar software for free."
    ],
    recommendations: [
        "Focus on high-value 'rare plants' market first where margins are higher.",
        "Implement a 'community diagnosis' feature to supplement AI results.",
        "Partner with niche nurseries for early customer acquisition."
    ],
    comparableCompanies: [
        { name: "PictureThis", outcome: "success", similarity: "Direct competitor in plant ID" },
        { name: "Planta", outcome: "success", similarity: "Indirect competitor in plant care" },
        { name: "PlantSnap", outcome: "failure", similarity: "Poor accuracy led to high churn" }
    ],
    created_at: new Date().toISOString(),
};

const mockHistory: unknown[] = [
    {
        ...mockValidation as ValidationResult,
        id: "val-111",
        overallScore: 65,
        trafficLight: "yellow",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        ...mockValidation as ValidationResult,
        id: "val-222",
        overallScore: 74,
        trafficLight: "yellow",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

export default function TestReportPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Internal Test Page</h1>
                    <p className="text-muted-foreground">Verifying the ValidationReport component with mock data.</p>
                </div>
                <ValidationReport
                    idea={mockIdea}
                    validation={mockValidation as ValidationResult}
                    history={mockHistory as ValidationResult[]}
                    percentile={85}
                />
            </div>
        </div>
    );
}
