import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()

    // Base routes
    const routes = [
        '',
        '/ideas',
        '/pricing',
        '/login',
    ].map((route) => ({
        url: `https://venlidate.com${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Fetch all approved shared ideas
    const { data: ideas } = await supabase
        .from('shared_ideas')
        .select('id, updated_at')
        .eq('status', 'approved')

    const ideaRoutes = (ideas || []).map((idea) => ({
        url: `https://venlidate.com/ideas/${idea.id}`,
        lastModified: new Date(idea.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...routes, ...ideaRoutes]
}
