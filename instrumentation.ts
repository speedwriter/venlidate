const REQUIRED_ENV_VARS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CRON_SECRET',
] as const

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v])
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
        }

        await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
        await import('./sentry.edge.config');
    }
}
