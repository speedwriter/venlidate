import { ValidationReport } from "@/components/features/validation-report";
import { Tables } from "@/types/database";

const mockIdea: Tables<"ideas"> = {
    id: "idea-123",
    title: "AI-Powered Personal Greenhouse Assistant",
    problem: "Urban dwellers struggle to maintain indoor plants due to lack of knowledge and consistent care.",
    target_customer: "Millennial urban professionals living in apartments.",
    painkiller_moment: "Receiving a notification that their Rare Monstera needs 'exactly 200ml of water and 2 hours of indirect light' right now.",
    revenue_model: "SaaS subscription for advanced monitoring + Affiliate commissions on plant care products.",
    unfair_advantage: "Proprietary computer vision model trained on 1M+ rare plant health images.",
    distribution_channel: "Instagram/TikTok influencers in the #PlantParent community.",
    time_commitment: "full_time",
    status: "validated",
    user_id: "user-456",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
};

const mockValidation: Tables<"validations"> = {
    id: "val-789",
    idea_id: "idea-123",
    user_id: "user-456",
    overall_score: 82,
    traffic_light: "green",
    painkiller_score: 9,
    painkiller_reasoning: "Strong emotional connection to plant health among the target demographic. High willingness to pay for 'peace of mind'.",
    revenue_model_score: 7,
    revenue_model_reasoning: "Subscription model is standard but requires high retention. Affiliate model adds nice diversified upside.",
    acquisition_score: 8,
    acquisition_reasoning: "Highly visual product perfectly suited for social media discovery. Strong organic growth potential.",
    moat_score: 8,
    moat_reasoning: "The proprietary dataset of rare plant images provides a defensible data moat over time.",
    founder_fit_score: 9,
    founder_fit_reasoning: "Team has background in both AI/ML and horticulture. Perfect alignment with the problem space.",
    time_to_revenue_score: 6,
    time_to_revenue_reasoning: "Requires hardware integration or high-fidelity image processing which takes time to refine.",
    time_to_revenue_estimate: "4-6 months",
    scalability_score: 9,
    scalability_reasoning: "Zero marginal cost for AI analysis. Can easily expand to B2B (nurseries) in the future.",
    red_flags: [
        "High churn potential if plant health doesn't visibly improve within 30 days.",
        "Hardware competitors might bundle similar software for free."
    ],
    recommendations: [
        "Focus on high-value 'rare plants' market first where margins are higher.",
        "Implement a 'community diagnosis' feature to supplement AI results.",
        "Partner with niche nurseries for early customer acquisition."
    ],
    comparable_companies: [
        { name: "PictureThis", outcome: "success", similarity: "Direct competitor in plant ID" },
        { name: "Planta", outcome: "success", similarity: "Indirect competitor in plant care" },
        { name: "PlantSnap", outcome: "failure", similarity: "Poor accuracy led to high churn" }
    ],
    model_used: "gpt-4-turbo",
    processing_time_ms: 4500,
    created_at: new Date().toISOString(),
} as any; // Cast type because of JSON fields and potential minor mismatches

const mockHistory: Tables<"validations">[] = [
    {
        ...mockValidation,
        id: "val-111",
        overall_score: 65,
        traffic_light: "yellow",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    } as any,
    {
        ...mockValidation,
        id: "val-222",
        overall_score: 74,
        traffic_light: "yellow",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    } as any,
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
                    validation={mockValidation}
                    history={mockHistory}
                />
            </div>
        </div>
    );
}
