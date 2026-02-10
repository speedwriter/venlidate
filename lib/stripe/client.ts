import { loadStripe } from '@stripe/stripe-js'

export async function getStripe() {
    const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
    return stripePromise
}
