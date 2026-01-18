import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { LayoutDashboard, PlusCircle, CreditCard, LogOut } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Venlidate
                        </Link>
                        <nav className="hidden md:flex items-center gap-1">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/new-idea">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <PlusCircle className="h-4 w-4" />
                                    New Idea
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Pricing
                                </Button>
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden sm:inline-block">
                            {user.email}
                        </span>
                        <form action={signOut}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
