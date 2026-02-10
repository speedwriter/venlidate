import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('🔍 Checking Stripe Environment Variables...\n')

const checks = [
    {
        name: 'STRIPE_SECRET_KEY',
        value: process.env.STRIPE_SECRET_KEY,
        expectedPrefix: ['sk_test_', 'sk_live_'],
        description: 'Secret key for server-side Stripe API calls'
    },
    {
        name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        expectedPrefix: ['pk_test_', 'pk_live_'],
        description: 'Publishable key for client-side Stripe.js'
    },
    {
        name: 'STRIPE_WEBHOOK_SECRET',
        value: process.env.STRIPE_WEBHOOK_SECRET,
        expectedPrefix: ['whsec_'],
        description: 'Webhook signing secret'
    },
    {
        name: 'STRIPE_PRO_MONTHLY_PRICE_ID',
        value: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        expectedPrefix: ['price_'],
        description: 'Pro tier monthly price ID'
    },
    {
        name: 'STRIPE_PRO_ANNUAL_PRICE_ID',
        value: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
        expectedPrefix: ['price_'],
        description: 'Pro tier annual price ID'
    },
    {
        name: 'STRIPE_PREMIUM_MONTHLY_PRICE_ID',
        value: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        expectedPrefix: ['price_'],
        description: 'Premium tier monthly price ID'
    },
    {
        name: 'STRIPE_PREMIUM_ANNUAL_PRICE_ID',
        value: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
        expectedPrefix: ['price_'],
        description: 'Premium tier annual price ID'
    },
]

let hasErrors = false

checks.forEach(check => {
    if (!check.value) {
        console.error(`❌ ${check.name}: MISSING`)
        console.error(`   ${check.description}`)
        hasErrors = true
    } else {
        const hasValidPrefix = check.expectedPrefix.some(prefix => check.value!.startsWith(prefix))
        if (!hasValidPrefix) {
            console.error(`❌ ${check.name}: INVALID PREFIX`)
            console.error(`   Current: ${check.value.substring(0, 15)}...`)
            console.error(`   Expected to start with: ${check.expectedPrefix.join(' or ')}`)
            console.error(`   ${check.description}`)
            hasErrors = true
        } else {
            console.log(`✅ ${check.name}: ${check.value.substring(0, 20)}...`)
        }
    }
    console.log()
})

if (hasErrors) {
    console.error('❌ Configuration has errors. Please fix the issues above.')
    console.error('\n💡 Tip: Go to Stripe Dashboard > Developers > API keys to get the correct keys.')
    console.error('   - Secret keys start with sk_test_ or sk_live_')
    console.error('   - Publishable keys start with pk_test_ or pk_live_')
    console.error('   - Do NOT use restricted keys (rk_) as the secret key!')
    process.exit(1)
} else {
    console.log('🎉 All environment variables are correctly formatted!')
}
