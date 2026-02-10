import Stripe from 'stripe'

// Server-side Stripe client - DO NOT import this in client components!
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
})

// Re-export STRIPE_CONFIG for server-side use
export { STRIPE_CONFIG } from './constants'
