'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CancellationSurveyModal } from '@/components/features/cancellation-survey-modal'
import { saveCancellationFeedback } from '@/app/actions/cancellation'
import { createBillingPortalSession } from '@/app/actions/stripe'
import { toast } from 'sonner'
import { Settings } from 'lucide-react'

interface ManageSubscriptionButtonProps {
    userId: string
    tier: 'pro' | 'premium' | string
    currentPeriodEnd?: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    className?: string
}

export function ManageSubscriptionButton({
    userId,
    tier,
    currentPeriodEnd,
    variant = 'outline',
    className
}: ManageSubscriptionButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showSurvey, setShowSurvey] = useState(false)

    const handleManageClick = () => {
        setShowSurvey(true)
    }

    async function handleSurveySubmit(reason: string, feedback?: string) {
        // Close survey modal
        setShowSurvey(false)

        // Save feedback to database (unless user clicked "Skip")
        // Note: 'skipped' is passed as reason if they click Skip
        if (reason && reason !== 'skipped') {
            try {
                const result = await saveCancellationFeedback(reason, feedback)
                if (!result.success) {
                    console.error('Failed to save feedback:', result.error)
                    // We continue anyway, don't block the user
                }
            } catch (error) {
                console.error('Failed to save cancellation feedback:', error)
                // Don't block user from canceling if feedback save fails
            }
        }

        // Now proceed to Stripe billing portal
        setIsLoading(true)

        try {
            const result = await createBillingPortalSession()

            if (!result || !result.success || !result.url) {
                throw new Error(result?.error || 'Failed to open billing portal')
            }

            // Redirect to Stripe
            window.location.href = result.url

        } catch (error: any) {
            console.error('Billing portal error:', error)
            toast.error('Failed to open billing portal. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button
                onClick={handleManageClick}
                disabled={isLoading}
                variant={variant}
                className={className}
            >
                {isLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>

            <CancellationSurveyModal
                isOpen={showSurvey}
                onClose={() => setShowSurvey(false)}
                onSubmit={handleSurveySubmit}
                tier={tier}
                currentPeriodEnd={currentPeriodEnd}
            />
        </>
    )
}
