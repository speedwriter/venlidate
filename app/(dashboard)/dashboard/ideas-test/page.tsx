'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    createIdea,
    getIdea,
    getUserIdeas,
    submitIdeaForValidation,
    revalidateIdea,
    deleteIdea,
} from '@/app/actions/ideas'

const DUMMY = {
    title: 'Test SaaS Idea',
    problem: 'Teams waste hours on manual data entry across spreadsheets.',
    targetCustomer: 'Operations managers at 50–200 person B2B companies',
    painkillerMoment: 'When a critical order is missed because data was entered in the wrong system',
    revenueModel: 'SaaS: $199/mo per team, annual billing',
    unfairAdvantage: 'Former ops manager who built similar tools in-house',
    distributionChannel: 'LinkedIn outreach and trade shows',
    timeCommitment: 'full_time' as const,
}

export default function IdeasTestPage() {
    const [ideaId, setIdeaId] = useState('')
    const [log, setLog] = useState<string[]>([])
    const [loading, setLoading] = useState<string | null>(null)

    const append = (msg: string) => setLog((prev) => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${msg}`])

    async function runCreateIdea() {
        setLoading('createIdea')
        const fd = new FormData()
        fd.set('title', DUMMY.title)
        fd.set('problem', DUMMY.problem)
        fd.set('targetCustomer', DUMMY.targetCustomer)
        fd.set('painkillerMoment', DUMMY.painkillerMoment)
        fd.set('revenueModel', DUMMY.revenueModel)
        fd.set('unfairAdvantage', DUMMY.unfairAdvantage)
        fd.set('distributionChannel', DUMMY.distributionChannel)
        fd.set('timeCommitment', DUMMY.timeCommitment)

        const r = await createIdea(fd)
        setLoading(null)
        if (r.success && r.data) {
            setIdeaId(r.data.id)
            append(`createIdea OK: id=${r.data.id}`)
        } else {
            append(`createIdea FAIL: ${r.error}`)
        }
    }

    async function runGetIdea() {
        if (!ideaId) {
            append('getIdea: set ideaId first (e.g. from createIdea)')
            return
        }
        setLoading('getIdea')
        const r = await getIdea(ideaId)
        setLoading(null)
        if (r.success && r.data) {
            append(`getIdea OK: title=${r.data.title}, validations=${(r.data.validations ?? []).length}`)
        } else {
            append(`getIdea FAIL: ${r.error}`)
        }
    }

    async function runGetUserIdeas() {
        setLoading('getUserIdeas')
        const r = await getUserIdeas()
        setLoading(null)
        if (r.success && r.data) {
            append(`getUserIdeas OK: count=${r.data.length}`)
        } else {
            append(`getUserIdeas FAIL: ${r.error}`)
        }
    }

    async function runSubmitForValidation() {
        if (!ideaId) {
            append('submitIdeaForValidation: set ideaId first')
            return
        }
        setLoading('submitIdeaForValidation')
        append('submitIdeaForValidation: running (AI may take 15–30s)...')
        const r = await submitIdeaForValidation(ideaId)
        setLoading(null)
        if (r.success && r.data) {
            append(`submitIdeaForValidation OK: overallScore=${r.data.overallScore}`)
        } else {
            append(`submitIdeaForValidation FAIL: ${r.error}`)
        }
    }

    async function runRevalidateIdea() {
        if (!ideaId) {
            append('revalidateIdea: set ideaId first')
            return
        }
        setLoading('revalidateIdea')
        append('revalidateIdea: running (AI may take 15–30s)...')
        const r = await revalidateIdea(ideaId)
        setLoading(null)
        if (r.success && r.data) {
            append(`revalidateIdea OK: overallScore=${r.data.overallScore}`)
        } else {
            append(`revalidateIdea FAIL: ${r.error}`)
        }
    }

    async function runDeleteIdea() {
        if (!ideaId) {
            append('deleteIdea: set ideaId first')
            return
        }
        setLoading('deleteIdea')
        const r = await deleteIdea(ideaId)
        setLoading(null)
        if (r.success) {
            setIdeaId('')
            append('deleteIdea OK')
        } else {
            append(`deleteIdea FAIL: ${r.error}`)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold">Ideas Actions Test</h1>
                <p className="text-muted-foreground text-sm">
                    Run Server Actions with dummy data. Verify in DB: ideas and validations.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Idea ID</CardTitle>
                    <CardDescription>Set by createIdea; used by get / submit / revalidate / delete.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        value={ideaId}
                        onChange={(e) => setIdeaId(e.target.value)}
                        placeholder="uuid from createIdea"
                        className="font-mono text-sm"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>1. createIdea → 2. submitIdeaForValidation (or revalidateIdea) → 3. getIdea / getUserIdeas → 4. deleteIdea</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Button onClick={runCreateIdea} disabled={!!loading} variant="default">
                        createIdea
                    </Button>
                    <Button onClick={runGetIdea} disabled={!!loading} variant="outline">
                        getIdea
                    </Button>
                    <Button onClick={runGetUserIdeas} disabled={!!loading} variant="outline">
                        getUserIdeas
                    </Button>
                    <Button onClick={runSubmitForValidation} disabled={!!loading} variant="default">
                        submitIdeaForValidation
                    </Button>
                    <Button onClick={runRevalidateIdea} disabled={!!loading} variant="outline">
                        revalidateIdea
                    </Button>
                    <Button onClick={runDeleteIdea} disabled={!!loading} variant="destructive">
                        deleteIdea
                    </Button>
                </CardContent>
            </Card>

            {loading && (
                <p className="text-sm text-amber-600">
                    Loading: {loading}
                </p>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Log</CardTitle>
                    <CardDescription>Results and errors from each action.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="font-mono text-xs bg-muted rounded-md p-3 max-h-64 overflow-y-auto space-y-1">
                        {log.length === 0 ? (
                            <span className="text-muted-foreground">Run an action to see output.</span>
                        ) : (
                            log.map((line, i) => <div key={i}>{line}</div>)
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setLog([])}
                    >
                        Clear log
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
