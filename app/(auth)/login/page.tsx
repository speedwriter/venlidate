import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/features/login-form'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string }>
}) {
    const { redirectTo } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect(redirectTo || '/dashboard')
    }

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
            <LoginForm />
        </div>
    )
}
