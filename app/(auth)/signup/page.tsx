import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignupForm } from '@/components/features/signup-form'

export default async function SignupPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
            <SignupForm />
        </div>
    )
}
