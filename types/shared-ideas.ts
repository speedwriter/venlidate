// Type definitions for shared ideas and validations

export interface SharedIdeaValidation {
    id: string
    idea_id: string
    user_id: string
    overall_score: number
    traffic_light: 'red' | 'yellow' | 'green'
    painkiller_score: number
    painkiller_reasoning: string
    revenue_model_score: number
    revenue_model_reasoning: string
    acquisition_score: number
    acquisition_reasoning: string
    moat_score: number
    moat_reasoning: string
    founder_fit_score: number
    founder_fit_reasoning: string
    time_to_revenue_score: number
    time_to_revenue_reasoning: string
    time_to_revenue_estimate: string | null
    scalability_score: number
    scalability_reasoning: string
    red_flags: string[] | null
    comparable_companies: string[] | null
    recommendations: string[] | null
    model_used: string
    processing_time_ms: number
    idea_snapshot: Record<string, unknown>
    created_at: string
}

export interface SharedIdea {
    id: string
    validation_id: string
    idea_id: string
    user_id: string
    title: string
    problem: string
    solution: string
    target_customer: string
    overall_score: number
    traffic_light: 'red' | 'yellow' | 'green'
    is_anonymous: boolean
    shared_by_name: string | null
    status: 'pending' | 'approved' | 'rejected' | 'removed'
    view_count: number
    approved_at: string | null
    approved_by: string | null
    created_at: string
    updated_at: string
    validations?: SharedIdeaValidation | SharedIdeaValidation[] | null
}
