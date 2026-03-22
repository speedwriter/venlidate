export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RoadmapOverview } from '@/components/features/roadmap/RoadmapOverview'
import { getRoadmapOverview, getActiveSprintForRoadmap } from '@/app/actions/sprint'
import { CompletionScreen } from '@/components/features/roadmap/CompletionScreen'
import { getCompletionSummary } from '@/app/actions/roadmap-completion'

export default async function RoadmapPage({ params, searchParams }: { params: Promise<{ roadmapId: string }>; searchParams: Promise<{ complete?: string }> }) {
  const [{ roadmapId }, { complete }] = await Promise.all([params, searchParams])
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [roadmap, activeSprint] = await Promise.all([
    getRoadmapOverview(roadmapId),
    getActiveSprintForRoadmap(roadmapId),
  ])

  if (!roadmap) notFound()

  if (complete === 'true' && roadmap.status === 'completed' && roadmap.completion_summary) {
    const completionData = await getCompletionSummary(roadmapId)
    if (completionData) {
      return (
        <CompletionScreen
          roadmapId={roadmapId}
          ideaTitle={completionData.idea_title}
          ideaId={roadmap.idea_id}
          summary={completionData.summary}
          choiceMade={completionData.choice_made}
        />
      )
    }
  }

  return <RoadmapOverview roadmap={roadmap} activeSprint={activeSprint} isCompleted={roadmap.status === 'completed' && !!roadmap.completion_summary} />
}
