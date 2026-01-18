export type DimensionScore = {
    score: number // 0-10
    reasoning: string
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
    comparableCompanies: Array<{
        name: string
        outcome: 'success' | 'failure'
        similarity: string
    }>
    recommendations: string[]
}

export type IdeaFormData = {
    title: string
    problem: string
    targetCustomer: string
    painkillerMoment: string
    revenueModel: string
    unfairAdvantage: string
    distributionChannel: string
    timeCommitment: 'nights_weekends' | 'part_time' | 'full_time'
}
