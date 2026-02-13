'use server'

import { createClient } from '@/lib/supabase/server'

export async function getIdeaValidations(ideaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { data: validations, error } = await supabase
        .from('validations')
        .select('*')
        .eq('idea_id', ideaId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, data: validations }
}
