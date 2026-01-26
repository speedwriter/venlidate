'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateIdea } from '@/lib/ai/validator'
import type { IdeaFormData, ValidationResult } from '@/types/validations'

/**
 * Creates a new idea in the database.
 * Status is set to 'draft' by default.
 */
export async function createIdea(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const title = formData.get('title') as string
    const problem = formData.get('problem') as string
    const targetCustomer = formData.get('targetCustomer') as string
    const painkillerMoment = formData.get('painkillerMoment') as string
    const revenueModel = formData.get('revenueModel') as string
    const unfairAdvantage = formData.get('unfairAdvantage') as string
    const distributionChannel = formData.get('distributionChannel') as string
    const timeCommitment = formData.get('timeCommitment') as IdeaFormData['timeCommitment']

    // Basic validation
    if (!title || !problem || !targetCustomer || !painkillerMoment || !revenueModel || !unfairAdvantage || !distributionChannel || !timeCommitment) {
        return { success: false, error: 'All fields are required' }
    }

    const { data, error } = await supabase
        .from('ideas')
        .insert({
            user_id: user.id,
            title,
            problem,
            target_customer: targetCustomer,
            painkiller_moment: painkillerMoment,
            revenue_model: revenueModel,
            unfair_advantage: unfairAdvantage,
            distribution_channel: distributionChannel,
            time_commitment: timeCommitment,
            status: 'draft'
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error creating idea:', error)
        return { success: false, error: 'Failed to create idea. Please try again.' }
    }

    return { success: true, data: { id: data.id } }
}

/**
 * Submits an idea for AI validation.
 * Fetches idea data, calls validator, and saves result to validations table.
 */
export async function submitIdeaForValidation(ideaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Fetch idea and verify ownership
    const { data: idea, error: ideaError } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .single()

    if (ideaError || !idea) {
        return { success: false, error: 'Idea not found or unauthorized' }
    }

    try {
        const ideaData: IdeaFormData = {
            title: idea.title,
            problem: idea.problem,
            targetCustomer: idea.target_customer,
            painkillerMoment: idea.painkiller_moment,
            revenueModel: idea.revenue_model,
            unfairAdvantage: idea.unfair_advantage,
            distributionChannel: idea.distribution_channel,
            timeCommitment: idea.time_commitment,
        }

        const startTime = Date.now()
        const { validation, modelUsed } = await validateIdea(ideaData)
        const endTime = Date.now()
        const processingTimeMs = endTime - startTime

        // Insert validation result following the schema
        const { error: validationError } = await supabase
            .from('validations')
            .insert({
                idea_id: ideaId,
                user_id: user.id,
                overall_score: validation.overallScore,
                traffic_light: validation.trafficLight,
                painkiller_score: validation.painkillerScore.score,
                painkiller_reasoning: validation.painkillerScore.reasoning,
                revenue_model_score: validation.revenueModelScore.score,
                revenue_model_reasoning: validation.revenueModelScore.reasoning,
                acquisition_score: validation.acquisitionScore.score,
                acquisition_reasoning: validation.acquisitionScore.reasoning,
                moat_score: validation.moatScore.score,
                moat_reasoning: validation.moatScore.reasoning,
                founder_fit_score: validation.founderFitScore.score,
                founder_fit_reasoning: validation.founderFitScore.reasoning,
                time_to_revenue_score: validation.timeToRevenueScore.score,
                time_to_revenue_reasoning: validation.timeToRevenueScore.reasoning,
                time_to_revenue_estimate: validation.timeToRevenueScore.estimate,
                scalability_score: validation.scalabilityScore.score,
                scalability_reasoning: validation.scalabilityScore.reasoning,
                red_flags: validation.redFlags,
                comparable_companies: validation.comparableCompanies,
                recommendations: validation.recommendations,
                model_used: modelUsed,
                processing_time_ms: processingTimeMs
            })

        if (validationError) {
            console.error('Error saving validation:', validationError)
            return { success: false, error: 'Failed to save validation results.' }
        }

        // Update idea status
        const { error: updateError } = await supabase
            .from('ideas')
            .update({ status: 'validated' })
            .eq('id', ideaId)

        if (updateError) {
            console.error('Failed to update idea status:', updateError)
        }

        revalidatePath('/dashboard')
        revalidatePath(`/dashboard/${ideaId}`)

        return { success: true, data: validation }
    } catch (error) {
        console.error('Validation process failed:', error)
        return { success: false, error: error instanceof Error ? error.message : 'An error occurred during validation' }
    }
}

/**
 * Fetches a single idea along with its latest validation result.
 */
export async function getIdea(ideaId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ideas')
        .select(`
            *,
            validations (
                *
            )
        `)
        .eq('id', ideaId)
        .order('created_at', { foreignTable: 'validations', ascending: false })
        .limit(1, { foreignTable: 'validations' })
        .single()

    if (error || !data) {
        return { success: false, error: 'Idea not found' }
    }

    return { success: true, data }
}

/**
 * Fetches a single idea along with ALL its validation results.
 * Verifies ownership by checking user_id.
 */
export async function getFullIdea(ideaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('ideas')
        .select(`
            *,
            validations (
                *
            )
        `)
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .order('created_at', { foreignTable: 'validations', ascending: false })
        .single()

    if (error || !data) {
        return { success: false, error: 'Idea not found' }
    }

    return { success: true, data }
}

/**
 * Fetches all ideas for the current user, each with its latest validation score.
 */
export async function getUserIdeas() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, error } = await supabase
        .from('ideas')
        .select(`
            id,
            title,
            problem,
            status,
            created_at,
            validations (
                overall_score,
                traffic_light,
                created_at
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .order('created_at', { foreignTable: 'validations', ascending: false })

    if (error) {
        console.error('Error fetching user ideas:', error)
        return { success: false, error: 'Failed to fetch ideas.' }
    }

    // Map to include only the latest validation for each idea in the result
    const ideasWithLatestValidation = data.map((idea) => ({
        ...idea,
        latest_validation: (idea.validations as any)?.[0] || null,
        validations: undefined // Remove the array to keep it clean
    }))

    return { success: true, data: ideasWithLatestValidation }
}

/**
 * Deletes an idea. Cascade delete will handle validations.
 */
export async function deleteIdea(ideaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting idea:', error)
        return { success: false, error: 'Failed to delete idea.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Convenience function to re-trigger validation for an existing idea.
 * This creates a new entry in the validations table.
 */
export async function revalidateIdea(ideaId: string) {
    return submitIdeaForValidation(ideaId)
}
