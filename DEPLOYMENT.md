# Deployment Checklist

## Stripe Setup

1. **Create Products in Stripe LIVE Mode**
   - Switch to **Live Mode** in Stripe Dashboard.
   - Create "Venlidate Pro" and "Venlidate Premium" products matching test mode.
   - Create Monthly and Annual prices for each.

2. **Configure Webhooks**
   - Go to **Developers > Webhooks** in Stripe Dashboard (Live Mode).
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **Signing secret** (`whsec_...`).

3. **Configure Environment Variables (Vercel)**
   Add the following environment variables to your Vercel project settings:

   | Variable | Value Source |
   |----------|--------------|
   | `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API keys (Live focus) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API keys (Live focus) |
   | `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks > Signing secret |
   | `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe Dashboard > Products > Venlidate Pro > Monthly Price ID |
   | `STRIPE_PRO_ANNUAL_PRICE_ID` | Stripe Dashboard > Products > Venlidate Pro > Annual Price ID |
   | `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Stripe Dashboard > Products > Venlidate Premium > Monthly Price ID |
   | `STRIPE_PREMIUM_ANNUAL_PRICE_ID` | Stripe Dashboard > Products > Venlidate Premium > Annual Price ID |

4. **Verify Deployment**
   - Deploy the application.
   - Check Vercel logs to ensure build succeeds.
   - Verify `https://your-domain.com/api/webhooks/stripe` is accessible.

## Common Issues

**Webhook not receiving events:**
- Verify endpoint URL is correct and publicly accessible.
- Check webhook signing secret matches.
- Check Stripe Dashboard > Webhooks > Logs for errors.

**Checkout not working:**
- Verify price IDs are correct in Vercel environment variables.
- Check browser console for errors.
- Verify Stripe publishable key is correct.

**Database not updating:**
- Check webhook handler logs in Vercel.
- Verify Supabase connection works in webhook route.
- Check RLS policies allow updates.

## Final Testing

- [ ] **Real Purchase / Test Card:** Make a purchase in production (Stripe allows test cards in live mode if configured, otherwise use a real card and refund).
- [ ] **Cancellation:** Test cancelling the subscription and ensure it downgrades gracefully at the end of the period.
- [ ] **Upgrade/Downgrade:** Test switching plans if applicable.
