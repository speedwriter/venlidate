import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { STRIPE_CONFIG } from '@/lib/stripe/config'
import { createAdminClient } from '@/lib/supabase/admin'
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

    const supabase = createAdminClient()

    // Handle different event types
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session

            // Get user_id from metadata
            const metadata = session.metadata as Record<string, unknown>
            const userId = metadata?.user_id as string
            const tier = metadata?.tier as 'pro' | 'premium'

            if (!userId || !tier) {
                console.error('Missing metadata in checkout session')
                return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
            }

            // Determine billing period from the subscription's price ID
            let billingPeriod: 'monthly' | 'annual' | null = null
            if (session.mode === 'subscription' && session.subscription) {
                const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
                const priceId = stripeSubscription.items.data[0]?.price.id
                const annualPriceIds = [
                    STRIPE_CONFIG.plans.pro.annual.priceId,
                    STRIPE_CONFIG.plans.premium.annual.priceId,
                ]
                billingPeriod = annualPriceIds.includes(priceId) ? 'annual' : 'monthly'
            }

            // Update user subscription in database
            const { error } = await supabase
                .from('user_subscriptions')
                .update({
                    tier: tier,
                    status: 'active',
                    billing_period: billingPeriod,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    started_at: new Date().toISOString(),
                })
                .eq('user_id', userId)

            if (error) {
                console.error('Error updating subscription:', error)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

            break
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription

            // Fetch user by stripe_customer_id
            const { data: userSub, error: fetchError } = await supabase
                .from('user_subscriptions')
                .select('user_id')
                .eq('stripe_customer_id', subscription.customer as string)
                .single()

            if (fetchError || !userSub) {
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

            // Determine billing period from price ID
            const annualPriceIds = [
                STRIPE_CONFIG.plans.pro.annual.priceId,
                STRIPE_CONFIG.plans.premium.annual.priceId,
            ]
            const billingPeriod = annualPriceIds.includes(priceId) ? 'annual' : 'monthly'

            // Update subscription
            // When cancel_at_period_end is true, cancel_at holds the scheduled end date
            const expiresAt = subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : null

            const { error } = await supabase
                .from('user_subscriptions')
                .update({
                    tier: tier,
                    status: subscription.status,
                    billing_period: billingPeriod,
                    stripe_price_id: priceId,
                    stripe_cancel_at_period_end: subscription.cancel_at_period_end ?? false,
                    expires_at: expiresAt,
                })
                .eq('user_id', userSub.user_id)

            if (error) {
                console.error('Error updating subscription:', error)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

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
            const endedAt = subscription.ended_at
                ? new Date(subscription.ended_at * 1000).toISOString()
                : new Date().toISOString()

            const { error } = await supabase
                .from('user_subscriptions')
                .update({
                    tier: 'free',
                    status: 'canceled',
                    canceled_at: endedAt,
                    expires_at: endedAt,
                    stripe_subscription_id: null,
                    stripe_price_id: null,
                })
                .eq('user_id', userSub.user_id)

            if (error) {
                console.error('Error downgrading subscription:', error)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

            break
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice

            // Update status to past_due
            const { error } = await supabase
                .from('user_subscriptions')
                .update({ status: 'past_due' })
                .eq('stripe_customer_id', invoice.customer as string)

            if (error) {
                console.error('Error updating past_due status:', error)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

            break
        }

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
}
