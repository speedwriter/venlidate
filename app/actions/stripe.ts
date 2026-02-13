'use server'

import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'


/**
 * Creates a Stripe Checkout Session for a subscription tier.
 */
export async function createCheckoutSession(
    priceId: string,
    tier: 'pro' | 'premium',
    successUrl?: string,
    cancelUrl?: string
) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' }
        }

        const userId = user.id
        const email = user.email

        if (!email) {
            return { success: false, error: 'User email not found' }
        }

        // 1. Fetch or create Stripe customer
        let stripeCustomerId: string | null = null

        const supabaseAdmin = createAdminClient()

        const { data: subscription, error: subError } = await supabaseAdmin
            .from('user_subscriptions')
            .select('stripe_customer_id, status, tier')
            .eq('user_id', userId)
            .maybeSingle()

        if (subError) {
            console.error('Error fetching subscription:', subError)
            return { success: false, error: 'Database error' }
        }

        if (subscription?.stripe_customer_id) {
            const cid = subscription.stripe_customer_id

            // Verify customer still exists in Stripe
            try {
                const customer = await stripe.customers.retrieve(cid)
                if (customer.deleted) {
                    stripeCustomerId = null
                } else {
                    stripeCustomerId = cid
                }
            } catch (err) {
                const stripeErr = err as { code?: string };
                if (stripeErr.code === 'resource_missing') {
                    stripeCustomerId = null
                } else {
                    throw err
                }
            }
        }

        if (!stripeCustomerId) {
            // Create Stripe customer
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    supabase_user_id: userId,
                },
            })
            stripeCustomerId = customer.id

            // Save customer.id to user_subscriptions
            // We use upsert because user_subscriptions might not exist yet for this user
            const { error: upsertError } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert({
                    user_id: userId,
                    stripe_customer_id: stripeCustomerId,
                    status: subscription?.status || 'incomplete',
                    tier: subscription?.tier || 'free',
                }, { onConflict: 'user_id' })

            if (upsertError) {
                console.error('Error saving customer ID:', upsertError)
                return { success: false, error: 'Failed to initialize customer' }
            }
        }

        if (!stripeCustomerId) {
            return { success: false, error: 'Customer creation failed' }
        }

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
            metadata: {
                user_id: userId,
                tier: tier,
            },
        })

        return { success: true, sessionId: session.id, url: session.url }
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return { success: false, error: (error as Error).message || 'Payment initialization failed' }
    }
}

/**
 * Creates a Stripe Billing Portal Session for subscription management.
 */
export async function createBillingPortalSession() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' }
        }

        const { data: subscription, error: subError } = await supabase
            .from('user_subscriptions')
            .select('stripe_customer_id, stripe_subscription_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (subError || !subscription?.stripe_customer_id) {
            console.error('Error fetching subscription info or customer ID missing:', subError)
            // Redirect to subscription page (or pricing if subscription doesn't exist)
            // for users without a Stripe ID (e.g. manually added Premium users)
            return {
                success: true,
                url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`
            }
        }

        // Verify customer exists in Stripe
        try {
            const customer = await stripe.customers.retrieve(subscription.stripe_customer_id)
            if (customer.deleted) {
                return { success: false, error: 'Stripe customer record not found. Please contact support.' }
            }
        } catch (err: unknown) {
            const stripeErr = err as { code?: string };
            if (stripeErr.code === 'resource_missing') {
                return { success: false, error: 'Stripe customer record not found. Please contact support.' }
            }
            throw err
        }

        // If no subscription ID (e.g. test user or manual upgrade), redirect to subscription page
        // instead of trying to open Stripe portal or showing an error
        if (!subscription.stripe_subscription_id) {
            return {
                success: true,
                url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`
            }
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
            flow_data: {
                type: 'subscription_cancel',
                subscription_cancel: {
                    subscription: subscription.stripe_subscription_id,
                },
                after_completion: {
                    type: 'redirect',
                    redirect: {
                        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?cancelled=true`,
                    },
                },
            },
        })

        return { success: true, url: session.url }
    } catch (error: unknown) {
        console.error('Error creating billing portal session:', error)
        return { success: false, error: (error as Error).message || 'Failed to open billing portal' }
    }
}

/**
 * Retrieves the current subscription status for a user.
 */
export async function getSubscriptionStatus(userId: string) {
    try {
        const supabase = await createClient()

        const { data: subData, error: subError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()

        if (subError || !subData) {
            return {
                success: true,
                data: {
                    tier: 'free',
                    status: 'none',
                    currentPeriodEnd: null,
                    cancelAtPeriodEnd: false,
                    priceId: null,
                }
            }
        }

        if (!subData.stripe_subscription_id) {
            // Likely a record exists but no active stripe sub yet
            return {
                success: true,
                data: {
                    tier: subData.tier || 'free',
                    status: subData.status || 'none',
                    currentPeriodEnd: null,
                    cancelAtPeriodEnd: false,
                    priceId: null,
                }
            }
        }

        // Fetch latest data from Stripe
        try {
            const subscription = await stripe.subscriptions.retrieve(
                subData.stripe_subscription_id
            )

            // TypeScript sometimes wraps the response in a Response object depending on version
            const sub = subscription as unknown as {
                status: string;
                current_period_end: number;
                cancel_at_period_end: boolean;
                items: { data: { price: { id: string } }[] }
            }

            return {
                success: true,
                data: {
                    tier: subData.tier || 'free',
                    status: sub.status,
                    currentPeriodEnd: sub.current_period_end,
                    cancelAtPeriodEnd: sub.cancel_at_period_end,
                    priceId: sub.items.data[0].price.id,
                }
            }
        } catch (err: unknown) {
            const stripeErr = err as { code?: string };
            if (stripeErr.code === 'resource_missing') {
                // Subscription was likely deleted in Stripe
                return {
                    success: true,
                    data: {
                        tier: 'free',
                        status: 'none',
                        currentPeriodEnd: null,
                        cancelAtPeriodEnd: false,
                        priceId: null,
                    }
                }
            }
            throw err
        }
    } catch (error: unknown) {
        console.error('Error getting subscription status:', error)
        return { success: false, error: (error as Error).message || 'Failed to fetch subscription status' }
    }
}
