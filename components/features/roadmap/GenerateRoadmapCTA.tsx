'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'

interface GenerateRoadmapCTAProps {
  ideaId: string
  ideaTitle: string
  score: number
}

export function GenerateRoadmapCTA({ ideaId, ideaTitle, score }: GenerateRoadmapCTAProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerate() {
    setIsGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: ideaId }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        if (res.status === 409 && data.roadmap_id) {
          router.push(`/roadmap/${data.roadmap_id}`)
          return
        }
        throw new Error(data.error || 'Generation failed')
      }
      
      router.push(`/roadmap/${data.roadmap_id}`)
    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Your idea scored {score} — now build it.</CardTitle>
        </div>
        <CardDescription>
          Get a personalised 5-phase roadmap built around "{ideaTitle}" with week-by-week tasks tailored to your specific score gaps. Complete 5 tasks to unlock the next sprint.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full sm:w-auto"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Building your roadmap...
            </>
          ) : (
            <>
              Build My Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
    <p className="text-xs text-muted-foreground mt-1">Takes ~10 seconds. Personalised to your idea.</p>
        <p className="text-xs text-muted-foreground">Only available for ideas scoring 70+.</p>
      </CardContent>
    </Card>
  )
}
