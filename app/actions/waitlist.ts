'use strict';
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function joinWaitlist(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;

    if (!email) {
        return { success: false, error: 'Email is required' };
    }

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('waitlist')
        .insert({
            email,
            user_id: user?.id || null,
        });

    if (error) {
        if (error.code === '23505') {
            return { success: true, message: "You're already on the list! We'll email you with early-bird pricing." };
        }
        console.error('Waitlist error:', error);
        return { success: false, error: 'Failed to join waitlist. Please try again.' };
    }

    revalidatePath('/pricing');
    return { success: true, message: "You're on the list! We'll email you with early-bird pricing." };
}
