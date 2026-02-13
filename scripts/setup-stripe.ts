import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
});

async function createProducts() {
    try {
        console.log('Creating products...');

        // 1. Venlidate Pro
        const proProduct = await stripe.products.create({
            name: 'Venlidate Pro',
            description: 'For aspiring founders with multiple ideas. 10 validations/month, unlimited iterations, full archive access.',
        });
        console.log(`Created Product: ${proProduct.name} (${proProduct.id})`);

        const proMonthly = await stripe.prices.create({
            product: proProduct.id,
            unit_amount: 3900,
            currency: 'usd',
            recurring: { interval: 'month' },
        });
        console.log(`- Pro Monthly Price: ${proMonthly.id}`);

        const proAnnual = await stripe.prices.create({
            product: proProduct.id,
            unit_amount: 39000,
            currency: 'usd',
            recurring: { interval: 'year' },
        });
        console.log(`- Pro Annual Price: ${proAnnual.id}`);

        // 2. Venlidate Premium
        const premiumProduct = await stripe.products.create({
            name: 'Venlidate Premium',
            description: 'For serial validators and consultants. Unlimited validations, advanced features, priority support.',
        });
        console.log(`Created Product: ${premiumProduct.name} (${premiumProduct.id})`);

        const premiumMonthly = await stripe.prices.create({
            product: premiumProduct.id,
            unit_amount: 7900,
            currency: 'usd',
            recurring: { interval: 'month' },
        });
        console.log(`- Premium Monthly Price: ${premiumMonthly.id}`);

        const premiumAnnual = await stripe.prices.create({
            product: premiumProduct.id,
            unit_amount: 79000,
            currency: 'usd',
            recurring: { interval: 'year' },
        });
        console.log(`- Premium Annual Price: ${premiumAnnual.id}`);

        console.log('\n--- SUCCESS ---');
        console.log('Copy these IDs into lib/stripe/config.ts:');
        console.log(JSON.stringify({
            pro: {
                monthly: proMonthly.id,
                annual: proAnnual.id,
            },
            premium: {
                monthly: premiumMonthly.id,
                annual: premiumAnnual.id,
            }
        }, null, 2));

    } catch (error) {
        console.error('Error creating products:', error);
        process.exit(1);
    }
}

createProducts();
