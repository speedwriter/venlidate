'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'

interface CancellationSurveyModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (reason: string, feedback?: string) => void | Promise<void>
    tier: 'pro' | 'premium' | string
    currentPeriodEnd?: string
}

const CANCELLATION_REASONS = [
    { value: 'too_expensive', label: 'Too expensive' },
    { value: 'not_using', label: 'Not using it enough' },
    { value: 'missing_features', label: 'Missing features I need' },
    { value: 'found_alternative', label: 'Found a better alternative' },
    { value: 'just_trying', label: 'Just trying it out, not ready to commit' },
    { value: 'technical_issues', label: 'Technical issues / bugs' },
    { value: 'other', label: 'Other' },
]

export function CancellationSurveyModal({
    isOpen,
    onClose,
    onSubmit,
    tier,
    currentPeriodEnd,
}: CancellationSurveyModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>('')
    const [feedbackText, setFeedbackText] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const handleSubmit = async () => {
        if (!selectedReason) return

        setIsSubmitting(true)
        try {
            await onSubmit(selectedReason, feedbackText || undefined)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSkip = () => {
        setIsSubmitting(true)
        onSubmit('skipped')
        // No need to set isSubmitting(false) as we likely redirect away
    }

    // Format message based on whether date is provided
    const billingPeriodMessage = currentPeriodEnd
        ? `You'll keep full access until your billing period ends on ${new Date(currentPeriodEnd).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })}.`
        : "You'll keep full access until the end of your current billing period."

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Before you go...</DialogTitle>
                    <DialogDescription>
                        We're sorry to see you leave. Help us improve by sharing why you're canceling.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-3">
                        <Label className="text-base font-medium">
                            What's the main reason you're considering canceling?
                        </Label>
                        <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="gap-2">
                            {CANCELLATION_REASONS.map((reason) => (
                                <div key={reason.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={reason.value} id={reason.value} />
                                    <Label
                                        htmlFor={reason.value}
                                        className="font-normal cursor-pointer w-full py-1"
                                    >
                                        {reason.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="feedback" className="text-base font-medium">
                            Anything else we should know? (optional)
                        </Label>
                        <Textarea
                            id="feedback"
                            placeholder="Your feedback helps us improve Venlidate..."
                            className="resize-none"
                            rows={3}
                            maxLength={500}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                        />
                    </div>

                    <div className="rounded-md bg-muted p-3 flex items-start gap-3 text-sm text-muted-foreground">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <span>
                            {billingPeriodMessage}
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSkip}
                        disabled={isSubmitting}
                        className="mt-2 sm:mt-0"
                    >
                        Skip
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedReason || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Continue to Cancel'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
