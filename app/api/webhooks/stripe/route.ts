import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { STRIPE_CONFIG } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = await createClient()

    // Handle different event types
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session

            // Get user_id from metadata
            const userId = session.metadata?.user_id
            const tier = session.metadata?.tier as 'pro' | 'premium'

            if (!userId || !tier) {
                console.error('Missing metadata in checkout session')
                break
            }

            // Update user subscription in database
            const { error } = await supabase
                .from('user_subscriptions')
                .update({
                    tier: tier,
                    status: 'active',
                    billing_period: session.mode === 'subscription' ?
                        (session.subscription ? 'monthly' : 'annual') : null,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    started_at: new Date().toISOString(),
                })
                .eq('user_id', userId)

            if (error) {
                console.error('Error updating subscription:', error)
            }

            break
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription

            // Fetch user by stripe_customer_id
            const { data: userSub } = await supabase
                .from('user_subscriptions')
                .select('user_id')
                .eq('stripe_customer_id', subscription.customer as string)
                .single()

            if (!userSub) {
                console.error('No user found for customer:', subscription.customer)
                break
            }

            // Determine tier from price_id
            const priceId = subscription.items.data[0]?.price.id
            let tier: 'pro' | 'premium' | 'free' = 'free'

            if (priceId === STRIPE_CONFIG.plans.pro.monthly.priceId ||
                priceId === STRIPE_CONFIG.plans.pro.annual.priceId) {
                tier = 'pro'
            } else if (priceId === STRIPE_CONFIG.plans.premium.monthly.priceId ||
                priceId === STRIPE_CONFIG.plans.premium.annual.priceId) {
                tier = 'premium'
            }

            // Update subscription
            const sub = subscription as any
            await supabase
                .from('user_subscriptions')
                .update({
                    tier: tier,
                    status: sub.status,
                    stripe_price_id: priceId,
                    stripe_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    stripe_cancel_at_period_end: sub.cancel_at_period_end,
                })
                .eq('user_id', userSub.user_id)

            break
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription

            const { data: userSub } = await supabase
                .from('user_subscriptions')
                .select('user_id')
                .eq('stripe_subscription_id', subscription.id)
                .single()

            if (!userSub) break

            // Downgrade to free tier
            await supabase
                .from('user_subscriptions')
                .update({
                    tier: 'free',
                    status: 'canceled',
                    canceled_at: new Date().toISOString(),
                    stripe_subscription_id: null,
                    stripe_price_id: null,
                })
                .eq('user_id', userSub.user_id)

            break
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice

            // Update status to past_due
            await supabase
                .from('user_subscriptions')
                .update({ status: 'past_due' })
                .eq('stripe_customer_id', invoice.customer as string)

            // Optional: Send email notification to user about failed payment

            break
        }

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
}
