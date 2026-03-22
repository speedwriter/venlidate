'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BookOpen, RefreshCw, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { recordPostCompletionChoice } from '@/app/actions/roadmap-completion'

interface CompletionSummary {
  what_you_built: string
  key_lessons: string[]
  where_you_stand: string
}

interface CompletionScreenProps {
  roadmapId: string
  ideaTitle: string
  ideaId: string
  summary: CompletionSummary
  choiceMade: string | null
}

export function CompletionScreen({
  roadmapId,
  ideaTitle,
  ideaId,
  summary,
  choiceMade,
}: CompletionScreenProps) {
  const [selecting, setSelecting] = useState<string | null>(null)
  const router = useRouter()

  async function handleChoice(choice: 'course' | 'pivot') {
    setSelecting(choice)
    await recordPostCompletionChoice(roadmapId, choice)

    if (choice === 'course') {
      window.open('https://ideabuild.thenewleverage.com', '_blank')
      setSelecting(null)
    } else if (choice === 'pivot') {
      router.push(`/dashboard/${ideaId}/revalidate`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

      <Link
        href={`/roadmap/${roadmapId}`}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Roadmap
      </Link>

      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">You built it.</h1>
        <p className="text-muted-foreground">"{ideaTitle}" — all 5 phases complete.</p>
      </div>

      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Journey in Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              What You Built
            </p>
            <p className="text-sm leading-relaxed">{summary.what_you_built}</p>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Key Lessons
            </p>
            <ul className="space-y-1.5">
              {summary.key_lessons.map((lesson, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Where You Stand Now
            </p>
            <p className="text-sm leading-relaxed">{summary.where_you_stand}</p>
          </div>
        </CardContent>
      </Card>

      {/* 3-Option Decision Panel */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-center text-muted-foreground">
          What's your next move?
        </p>

        {/* Option 1: Course */}
        <Card
          className={`cursor-pointer border-2 transition-all hover:border-primary/40 hover:bg-primary/5 ${choiceMade === 'course' ? 'border-primary bg-primary/5' : ''}`}
          onClick={() => !selecting && handleChoice('course')}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Learn how to build the app</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Access our course on going from validated idea to shipped product
              </p>
            </div>
            {selecting === 'course' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {choiceMade === 'course' && <Badge variant="secondary">Selected</Badge>}
          </CardContent>
        </Card>

        {/* Option 2: Pivot */}
        <Card
          className={`cursor-pointer border-2 transition-all hover:border-primary/40 hover:bg-primary/5 ${choiceMade === 'pivot' ? 'border-primary bg-primary/5' : ''}`}
          onClick={() => !selecting && handleChoice('pivot')}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <RefreshCw className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Pivot and revalidate</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your idea evolved — validate the new direction and generate a fresh roadmap
              </p>
            </div>
            {selecting === 'pivot' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {choiceMade === 'pivot' && <Badge variant="secondary">Selected</Badge>}
          </CardContent>
        </Card>

      </div>

      {choiceMade && (
        <p className="text-xs text-center text-muted-foreground">
          You can return to this page anytime.
        </p>
      )}
    </div>
  )
}
