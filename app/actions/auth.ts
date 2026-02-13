'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signIn(formData: FormData, redirectTo?: string) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    redirect(redirectTo || '/dashboard')
}

export async function signUp(formData: FormData, redirectTo?: string) {
    const origin = (await headers()).get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const supabase = await createClient()

    const emailRedirectTo = redirectTo 
        ? `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `${origin}/auth/callback`

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo,
            data: {
                first_name: firstName,
                last_name: lastName,
            }
        },
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

import { createAdminClient } from '@/lib/supabase/admin'

export async function resetPassword(formData: FormData) {
    const origin = (await headers()).get('origin')
    const email = formData.get('email') as string
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    if (profileError || !profile) {
        return { success: false, error: 'No user found with this email address.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password/update`,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}
