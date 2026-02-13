import dotenv from 'dotenv'
import path from 'path'
import Stripe from 'stripe'

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function verifyStripeConfig() {
    console.log('🔍 Verifying Stripe Configuration...\n')

    // 1. Check Environment Variables
    const requiredVars = [
        'STRIPE_SECRET_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_PRO_MONTHLY_PRICE_ID',
        'STRIPE_PRO_ANNUAL_PRICE_ID',
        'STRIPE_PREMIUM_MONTHLY_PRICE_ID',
        'STRIPE_PREMIUM_ANNUAL_PRICE_ID',
    ]

    const missingVars = requiredVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
        console.error('❌ Missing Environment Variables:')
        missingVars.forEach(v => console.error(`   - ${v}`))
        process.exit(1)
    }

    console.log('✅ All environment variables are present.')

    // 2. Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-01-28.clover',
        typescript: true,
    })

    // 3. Verify Prices exist in Stripe
    console.log('\n📡 Connecting to Stripe to verify Price IDs...')

    const pricesToCheck = [
        { name: 'Pro Monthly', id: process.env.STRIPE_PRO_MONTHLY_PRICE_ID! },
        { name: 'Pro Annual', id: process.env.STRIPE_PRO_ANNUAL_PRICE_ID! },
        { name: 'Premium Monthly', id: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID! },
        { name: 'Premium Annual', id: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID! },
    ]

    let hasErrors = false

    for (const price of pricesToCheck) {
        try {
            const stripePrice = await stripe.prices.retrieve(price.id)

            if (!stripePrice.active) {
                console.warn(`⚠️  Warning: Price ${price.name} (${price.id}) is archived/inactive in Stripe.`)
            } else {
                const amount = stripePrice.unit_amount! / 100
                const currency = stripePrice.currency.toUpperCase()
                const interval = stripePrice.recurring?.interval || 'one-time'
                console.log(`✅ ${price.name}: ${price.id}`)
                console.log(`   ${amount} ${currency}/${interval}`)
            }
        } catch (error: unknown) {
            console.error(`❌ Failed to retrieve ${price.name} (${price.id})`)
            console.error(`   Error: ${(error as Error).message}`)
            hasErrors = true
        }
    }

    if (hasErrors) {
        console.error('\n❌ Verification failed. Please check your Price IDs in .env.local')
        console.error('💡 Tip: Go to Stripe Dashboard > Products to verify your Price IDs')
        process.exit(1)
    } else {
        console.log('\n🎉 Stripe configuration is valid and ready!')
        console.log('\n✨ Next steps:')
        console.log('   1. Start your dev server: npm run dev')
        console.log('   2. Test the pricing page: http://localhost:3000/pricing')
        console.log('   3. Try a test checkout flow')
    }
}

verifyStripeConfig().catch(console.error)
