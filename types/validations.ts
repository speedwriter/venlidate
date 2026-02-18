export type DimensionScore = {
    score: number // 0-10
    reasoning: string
}

export type ActionPlanPriority = {
    rank: number
    dimension: string
    issue: string
    criticalQuestion: string
    validationMethod: string
    successCriteria: string
    estimatedDays: number
}

export type ActionPlan = {
    priorities: ActionPlanPriority[]
    overallTimeline: string
    readinessCriteria: string
}

export type ComparableCompany = {
    name: string
    situation: string
    description?: string // Legacy field for free users
    similarity?: string // Legacy field for similarity score
    whatWorked?: string[] // Pro/Premium only
    whatDidntWork?: string[] // Pro/Premium only
    lessonsForYou?: string[] // Pro/Premium only
    keyMetric?: string // Pro/Premium only
}

export type ValidationResult = {
    painkillerScore: DimensionScore
    revenueModelScore: DimensionScore
    acquisitionScore: DimensionScore
    moatScore: DimensionScore
    founderFitScore: DimensionScore
    timeToRevenueScore: DimensionScore & { estimate?: string }
    scalabilityScore: DimensionScore
    overallScore: number // 0-100
    trafficLight: 'red' | 'yellow' | 'green'
    redFlags: string[]
    comparableCompanies: ComparableCompany[]
    recommendations: string[]
    thinkingQuestions?: Record<string, string[]> // { dimension: ["q1", "q2"] }
    actionPlan?: ActionPlan | null
    created_at?: string
    id?: string
    ideaSnapshot?: IdeaFormData
}

export type IdeaFormData = {
    title: string
    problem: string
    solution: string
    targetCustomer: string
    painkillerMoment: string
    revenueModel: string
    unfairAdvantage: string
    distributionChannel: string
    timeCommitment: 'nights_weekends' | 'part_time' | 'full_time'
}

export type IdeaWithValidation = {
    id: string
    title: string
    problem: string
    solution: string
    status: string
    created_at: string
    latest_validation?: ValidationResult | null
    isArchived?: boolean
    archived_at?: string | null
    validations?: unknown[] // Optional if we want to include raw array
}
