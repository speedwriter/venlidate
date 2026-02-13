'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isUserAdmin, requireAdmin } from '@/lib/utils/admin'
import { validateIdea } from '@/lib/ai/validator'
import { IdeaFormData } from '@/types/validations'

/**
 * Shares a validated idea to the public marketplace.
 * Rewards the user with 1 free validation credit.
 */
export async function shareIdea(validationId: string, isAnonymous: boolean = true, sharedByName?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Fetch validation and verify ownership
    const { data: validation, error: validationError } = await supabase
        .from('validations')
        .select(`
            *,
            ideas (
                id,
                title,
                problem,
                solution,
                target_customer
            )
        `)
        .eq('id', validationId)
        .eq('user_id', user.id)
        .single()

    if (validationError || !validation) {
        return { success: false, error: 'Validation report not found or unauthorized' }
    }

    // 2. Check if already shared
    const { data: existingShare } = await supabase
        .from('shared_ideas')
        .select('id')
        .eq('validation_id', validationId)
        .single()

    if (existingShare) {
        return { success: false, error: 'This idea is already shared' }
    }

    const idea = validation.ideas as {
        id: string;
        title: string;
        problem: string;
        solution: string;
        target_customer: string
    } // Type cast because of join

    // 3. Insert into shared_ideas
    const { data: sharedIdea, error: shareError } = await supabase
        .from('shared_ideas')
        .insert({
            validation_id: validationId,
            idea_id: idea.id,
            user_id: user.id,
            title: idea.title,
            problem: idea.problem,
            solution: idea.solution,
            target_customer: idea.target_customer,
            overall_score: validation.overall_score,
            traffic_light: validation.traffic_light,
            is_anonymous: isAnonymous,
            shared_by_name: isAnonymous ? null : (sharedByName || user.email),
            status: 'pending'
        })
        .select()
        .single()

    if (shareError) {
        console.error('Error sharing idea:', shareError)
        return { success: false, error: 'Failed to share idea.' }
    }

    // 4. Update user karma (Increment ideas_shared and free_validation_credits)
    // We use upsert to handle cases where a record might not exist yet
    const { data: currentKarma } = await supabase
        .from('user_karma')
        .select('ideas_shared, free_validation_credits')
        .eq('user_id', user.id)
        .single()

    const { error: karmaError } = await supabase
        .from('user_karma')
        .upsert({
            user_id: user.id,
            email: user.email,
            ideas_shared: (currentKarma?.ideas_shared || 0) + 1,
            free_validation_credits: (currentKarma?.free_validation_credits || 0) + 1,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })

    if (karmaError) {
        console.error('Error updating karma:', karmaError)
        // We don't fail the whole action if karma update fails, but log it
    }

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/${idea.id}`)
    revalidatePath('/ideas')

    return {
        success: true,
        data: sharedIdea,
        message: 'Idea shared! Pending admin approval. You earned 1 free validation credit.'
    }
}

/**
 * Removes an idea from the public marketplace.
 * Reverts the free validation credit reward.
 */
export async function unshareIdea(sharedIdeaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Fetch shared idea and verify ownership
    const { data: sharedIdea, error: fetchError } = await supabase
        .from('shared_ideas')
        .select('*')
        .eq('id', sharedIdeaId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !sharedIdea) {
        return { success: false, error: 'Shared idea not found or unauthorized' }
    }

    // 2. Delete from shared_ideas
    const { error: deleteError } = await supabase
        .from('shared_ideas')
        .delete()
        .eq('id', sharedIdeaId)

    if (deleteError) {
        console.error('Error unsharing idea:', deleteError)
        return { success: false, error: 'Failed to unshare idea.' }
    }

    // 3. Update user karma (Decrement ideas_shared and free_validation_credits)
    const { data: karma } = await supabase
        .from('user_karma')
        .select('ideas_shared, free_validation_credits')
        .eq('user_id', user.id)
        .single()

    const { error: karmaError } = await supabase
        .from('user_karma')
        .upsert({
            user_id: user.id,
            email: user.email,
            ideas_shared: Math.max(0, (karma?.ideas_shared || 1) - 1),
            free_validation_credits: Math.max(0, (karma?.free_validation_credits || 1) - 1),
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })

    if (karmaError) {
        console.error('Error updating karma during unshare:', karmaError)
    }

    revalidatePath('/dashboard')
    const ideaId = sharedIdea.idea_id
    if (ideaId) {
        revalidatePath(`/dashboard/${ideaId}`)
    }
    revalidatePath('/ideas')

    return { success: true }
}

/**
 * Fetches shared ideas for the marketplace.
 * Admins can see pending/all ideas.
 */
export async function getSharedIdeas(
    status: 'approved' | 'pending' | 'rejected' | 'removed' | 'all' = 'approved',
    limit: number = 20,
    offset: number = 0,
    sortBy: 'score' | 'share_date' | 'validation_date' = 'share_date',
    sortOrder: 'asc' | 'desc' = 'desc'
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. If requesting non-approved, check admin
    if (status !== 'approved') {
        if (!user) return { success: false, error: 'Unauthorized' }
        const isAdmin = await isUserAdmin(user.id)
        if (!isAdmin) return { success: false, error: 'Unauthorized: Admin access required' }
    }

    let query = supabase
        .from('shared_ideas')
        .select(`
            *,
            validations${sortBy === 'validation_date' ? '!inner' : ''} (
                *
            )
        `)

    if (status !== 'all') {
        query = query.eq('status', status)
    }

    // 3. Apply sorting
    if (sortBy === 'score') {
        query = query.order('overall_score', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'share_date') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'validation_date') {
        // Since shared_ideas 1:1 validations, we can order by validation's created_at
        query = query.order('validations(created_at)', { ascending: sortOrder === 'asc' })
    } else {
        // Fallback
        query = query.order(status === 'approved' ? 'approved_at' : 'created_at', { ascending: false })
    }

    const { data, error } = await query
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching shared ideas:', error)
        return { success: false, error: 'Failed to fetch ideas.' }
    }

    return { success: true, data }
}

/**
 * Fetches a random approved shared idea and increments its view count.
 */
export async function getRandomSharedIdea() {
    const supabase = await createClient()

    // We use a custom RPC or a workaround for random selection in Supabase
    // For MVP, we'll fetch a count and then a random offset or use a simple query
    const { count } = await supabase
        .from('shared_ideas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

    if (!count || count === 0) return null

    const randomOffset = Math.floor(Math.random() * count)
    const { data, error } = await supabase
        .from('shared_ideas')
        .select(`
            *,
            validations (*)
        `)
        .eq('status', 'approved')
        .range(randomOffset, randomOffset)
        .single()

    if (error || !data) return null

    // Increment view count (fire and forget)
    supabase
        .from('shared_ideas')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)
        .then(({ error }) => {
            if (error) console.error('Error incrementing view count:', error)
        })

    return data
}

/**
 * Approves a shared idea (Admin only).
 */
export async function approveSharedIdea(sharedIdeaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    await requireAdmin(user.id)

    const { error } = await supabase
        .from('shared_ideas')
        .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: user.id,
            updated_at: new Date().toISOString()
        })
        .eq('id', sharedIdeaId)

    if (error) {
        console.error('Error approving idea:', error)
        return { success: false, error: 'Failed to approve idea.' }
    }

    revalidatePath('/ideas')
    revalidatePath('/admin/shared-ideas')

    return { success: true }
}

/**
 * Rejects a shared idea (Admin only).
 */
export async function rejectSharedIdea(sharedIdeaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    await requireAdmin(user.id)

    const { error } = await supabase
        .from('shared_ideas')
        .update({
            status: 'rejected',
            updated_at: new Date().toISOString()
        })
        .eq('id', sharedIdeaId)

    if (error) {
        console.error('Error rejecting idea:', error)
        return { success: false, error: 'Failed to reject idea.' }
    }

    // Future: send notification to user with reason

    revalidatePath('/ideas')
    revalidatePath('/admin/shared-ideas')

    return { success: true }
}

/**
 * Creates, validates, and immediately shares an idea (Admin only).
 */
export async function createAdminIdea(ideaData: IdeaFormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    await requireAdmin(user.id)

    try {
        // 1. Create idea
        const { data: idea, error: ideaError } = await supabase
            .from('ideas')
            .insert({
                user_id: user.id,
                title: ideaData.title,
                problem: ideaData.problem,
                target_customer: ideaData.targetCustomer,
                painkiller_moment: ideaData.painkillerMoment,
                revenue_model: ideaData.revenueModel,
                unfair_advantage: ideaData.unfairAdvantage,
                distribution_channel: ideaData.distributionChannel,
                time_commitment: ideaData.timeCommitment,
                status: 'validated'
            })
            .select('id')
            .single()

        if (ideaError || !idea) throw new Error('Failed to create admin idea')

        // 2. Validate idea
        const startTime = Date.now()
        const { validation, modelUsed } = await validateIdea(ideaData)
        const endTime = Date.now()

        const { data: validationRecord, error: validationError } = await supabase
            .from('validations')
            .insert({
                idea_id: idea.id,
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
                processing_time_ms: endTime - startTime,
                idea_snapshot: ideaData
            })
            .select('id')
            .single()

        if (validationError || !validationRecord) throw new Error('Failed to save admin validation')

        // 3. Share idea (Immediately approved since it's admin)
        const { data: sharedIdea, error: shareError } = await supabase
            .from('shared_ideas')
            .insert({
                validation_id: validationRecord.id,
                idea_id: idea.id,
                user_id: user.id,
                title: ideaData.title,
                problem: ideaData.problem,
                solution: ideaData.solution,
                target_customer: ideaData.targetCustomer,
                overall_score: validation.overallScore,
                traffic_light: validation.trafficLight,
                is_anonymous: false,
                shared_by_name: 'Admin',
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: user.id
            })
            .select('id')
            .single()

        if (shareError || !sharedIdea) throw new Error('Failed to share admin idea')

        revalidatePath('/ideas')

        return {
            success: true,
            data: {
                ideaId: idea.id,
                validationId: validationRecord.id,
                sharedIdeaId: sharedIdea.id
            }
        }

    } catch (error) {
        console.error('Admin idea creation failed:', error)
        return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
}

/**
 * Fetches a single shared idea by ID.
 */
export async function getSharedIdeaById(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('shared_ideas')
        .select(`
            *,
            validations (
                *
            )
        `)
        .eq('id', id)
        .single()

    if (error || !data) {
        return { success: false, error: 'Idea not found' }
    }

    return { success: true, data }
}

/**
 * Fetches user karma and validation credits.
 */
export async function getUserKarma(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_karma')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code === 'PGRST116') {
        // Record doesn't exist, create it
        const { data: newData, error: insertError } = await supabase
            .from('user_karma')
            .insert({
                user_id: userId,
                email: (await supabase.auth.getUser()).data.user?.email
            })
            .select('*')
            .single()

        if (insertError) {
            console.error('Error creating user karma:', insertError)
            return null
        }
        return newData
    }

    if (error) {
        console.error('Error fetching user karma:', error)
        return null
    }

    return data
}

/**
 * Moves an idea back to pending status (Admin only).
 */
export async function moveToPending(sharedIdeaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }
    await requireAdmin(user.id)

    const { error } = await supabase
        .from('shared_ideas')
        .update({
            status: 'pending',
            approved_at: null,
            approved_by: null,
            updated_at: new Date().toISOString()
        })
        .eq('id', sharedIdeaId)

    if (error) {
        console.error('Error moving idea to pending:', error)
        return { success: false, error: 'Failed to move idea to pending.' }
    }

    revalidatePath('/ideas')
    revalidatePath('/admin/shared-ideas')

    return { success: true }
}
