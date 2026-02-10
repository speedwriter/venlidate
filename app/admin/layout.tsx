import { createClient } from '@/lib/supabase/server'
import { isUserAdmin } from '@/lib/utils/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, BarChart3, MessageSquare } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const isAdmin = await isUserAdmin(user.id)

    if (!isAdmin) {
        notFound()
    }

    const navItems = [
        {
            title: 'Shared Ideas',
            href: '/admin/shared-ideas',
            icon: MessageSquare,
        },
        {
            title: 'User Management',
            href: '/admin/users',
            icon: Users,
            disabled: true,
        },
        {
            title: 'Cancellation Stats',
            href: '/admin/analytics/cancellations',
            icon: BarChart3,
        },
    ]

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/30 hidden md:flex flex-col">
                <div className="p-6">
                    <h2 className="text-lg font-bold tracking-tight">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground mt-1">Venlidate Moderation</p>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.disabled ? '#' : item.href}
                            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${item.disabled
                                ? 'text-muted-foreground/50 cursor-not-allowed'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                            {item.disabled && (
                                <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase">Soon</span>
                            )}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-background">
                <header className="h-16 border-b flex items-center px-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex-1">
                        <h1 className="text-sm font-medium">Administration</h1>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
