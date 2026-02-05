import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile, getUserSubscription, getMonthlyUsage, TIER_LIMITS, SubscriptionTier } from '@/lib/utils/subscriptions'
import { SubscriptionCard } from '@/components/features/subscription-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Mail, User } from 'lucide-react'

import Link from 'next/link'

const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date))
}

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const profile = await getUserProfile(user.id)
    const subscription = await getUserSubscription(user.id)
    const usageCount = await getMonthlyUsage(user.id)

    const tier = (subscription?.tier as SubscriptionTier) || 'free'
    const limits = TIER_LIMITS[tier]

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-gray-500">Manage your account and subscription details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Your personal details and contact information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="firstName"
                                            value={profile?.first_name || ''}
                                            readOnly
                                            className="pl-9 bg-slate-50 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="lastName"
                                            value={profile?.last_name || ''}
                                            readOnly
                                            className="pl-9 bg-slate-50 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        value={user.email || ''}
                                        readOnly
                                        className="pl-9 bg-slate-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Details</CardTitle>
                            <CardDescription>Detailed information about your current billing cycle.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Current Tier</p>
                                    <p className="text-lg font-semibold capitalize">{tier}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="text-lg font-semibold capitalize text-green-600">{subscription?.status || 'Active'}</p>
                                </div>
                                {subscription?.billing_period && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Billing Period</p>
                                        <p className="text-lg font-semibold capitalize">{subscription.billing_period}</p>
                                    </div>
                                )}
                                {subscription?.started_at && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Started On</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p className="text-base">{formatDate(subscription.started_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {subscription?.expires_at && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p className="text-base">{formatDate(subscription.expires_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscription Card Section */}
                <div className="space-y-6">
                    <SubscriptionCard
                        tier={tier}
                        status={subscription?.status || 'active'}
                        validationsUsed={usageCount}
                        totalValidations={limits.validationsPerMonth}
                    />

                    {tier === 'free' && (
                        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg">Scale Your Business</h3>
                                <p className="text-blue-100 text-sm">
                                    Get unlimited iterations, PDF exports, and more validations with our Pro plan.
                                </p>
                            </div>
                            <Link href="/pricing" className="block w-full">
                                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
