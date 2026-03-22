'use client'

import { useState } from 'react'
import { GenerateRoadmapCTA } from "@/components/features/roadmap/GenerateRoadmapCTA"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestRoadmapCTA() {
  const [ideaId, setIdeaId] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center">Testing Roadmap CTA Component</h1>
        <p className="text-center text-muted-foreground">
          This is a temporary test page to verify the CTA component renders correctly.
          You need an existing <strong>Idea ID</strong> from your database for it to work.
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="idea-id">Existing Idea ID</Label>
          <Input 
            id="idea-id"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" 
            value={ideaId}
            onChange={(e) => setIdeaId(e.target.value)}
          />
        </div>

        {ideaId ? (
          <GenerateRoadmapCTA 
            ideaId={ideaId}
            ideaTitle="My Awesome App Idea"
            score={85}
          />
        ) : (
          <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground mt-4">
            Enter a valid Idea ID above to render the component.
          </div>
        )}
      </div>
    </div>
  )
}
