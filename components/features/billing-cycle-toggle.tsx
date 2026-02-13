'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BillingCycleToggleProps {
    value: 'monthly' | 'annual'
    onChange: (value: 'monthly' | 'annual') => void
}

export default function BillingCycleToggle({ value, onChange }: BillingCycleToggleProps) {
    return (
        <div className="flex flex-col items-center gap-2 mb-8">
            <div className="inline-flex items-center p-1 bg-muted rounded-lg">
                <button
                    onClick={() => onChange('monthly')}
                    className={cn(
                        "px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                        value === 'monthly'
                            ? "bg-white shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Monthly
                </button>
                <button
                    onClick={() => onChange('annual')}
                    className={cn(
                        "px-6 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2",
                        value === 'annual'
                            ? "bg-white shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Annual
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                        Save 16%
                    </Badge>
                </button>
            </div>
            <p className="text-xs text-muted-foreground">
                {value === 'annual' ? '💰 Save up to $156/year with annual billing' : 'Switch to annual and save'}
            </p>
        </div>
    )
}
