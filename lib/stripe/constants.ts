// Client-safe Stripe configuration
// This file can be imported by client components

export const STRIPE_CONFIG = {
    currency: 'usd',
    plans: {
        pro: {
            monthly: {
                priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
                amount: 3900, // $39.00 in cents
                interval: 'month' as const,
            },
            annual: {
                priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID!,
                amount: 39000, // $390.00 in cents
                interval: 'year' as const,
            },
        },
        premium: {
            monthly: {
                priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
                amount: 7900, // $79.00 in cents
                interval: 'month' as const,
            },
            annual: {
                priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ANNUAL_PRICE_ID!,
                amount: 79000, // $790.00 in cents
                interval: 'year' as const,
            },
        },
    },
} as const
