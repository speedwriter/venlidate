import { createClient } from '@/lib/supabase/server'

export async function isUserAdmin(userId: string): Promise<boolean> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .single()

    return !!data
}

export async function requireAdmin(userId: string): Promise<void> {
    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
    }
}
