'use client'

import { useState, useEffect } from 'react'
import { createIdea, submitIdeaForValidation, getIdea, getUserIdeas, deleteIdea } from '@/app/actions/ideas'

/**
 * Test page for verifying Ideas Server Actions.
 * NOT intended for production use.
 */
export default function TestIdeasPage() {
    const [ideas, setIdeas] = useState<any[]>([])
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const loadIdeas = async () => {
        const res = await getUserIdeas()
        if (res.success) {
            setIdeas(res.data as any[])
        } else {
            setResult(res)
        }
    }

    useEffect(() => {
        loadIdeas()
    }, [])

    const handleCreate = async () => {
        setLoading(true)
        const formData = new FormData()
        formData.append('title', 'Test Startup ' + Math.floor(Math.random() * 1000))
        formData.append('problem', 'People are too busy to cook healthy meals.')
        formData.append('targetCustomer', 'Busy professionals')
        formData.append('painkillerMoment', 'When they order unhealthy takeout for the 3rd time in a week.')
        formData.append('revenueModel', 'Subscription based meal kits')
        formData.append('unfairAdvantage', 'Proprietary sorting algorithm for fresh produce')
        formData.append('distributionChannel', 'Instagram ads and local gyms')
        formData.append('timeCommitment', 'full_time')

        const res = await createIdea(formData)
        setResult(res)
        if (res.success) {
            await loadIdeas()
        }
        setLoading(false)
    }

    const handleValidate = async (id: string) => {
        setLoading(true)
        setResult({ status: 'Validating... this may take 10-20 seconds' })
        const res = await submitIdeaForValidation(id)
        setResult(res)
        await loadIdeas()
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        setLoading(true)
        const res = await deleteIdea(id)
        setResult(res)
        await loadIdeas()
        setLoading(false)
    }

    const handleGetIdea = async (id: string) => {
        setLoading(true)
        const res = await getIdea(id)
        setResult(res)
        setLoading(false)
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold">Ideas Server Actions Tester</h1>
            <p className="text-gray-600">Use this page to verify database operations and AI validation connectivity.</p>

            <div className="flex space-x-4">
                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                    Create Dummy Idea
                </button>
                <button
                    onClick={loadIdeas}
                    className="bg-white border text-gray-700 px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-colors"
                >
                    Refresh List
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">User Ideas ({ideas.length})</h2>
                    {ideas.length === 0 && !loading && (
                        <div className="p-8 border-2 border-dashed rounded-xl text-center text-gray-500">
                            No ideas found. Create one to get started.
                        </div>
                    )}
                    <div className="space-y-4">
                        {ideas.map((idea) => (
                            <div key={idea.id} className="border p-4 rounded-xl bg-white shadow-sm border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{idea.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${idea.status === 'validated' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {idea.status}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(idea.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {idea.latest_validation && (
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-indigo-600">{idea.latest_validation.overall_score}</div>
                                            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Score</div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleValidate(idea.id)}
                                        disabled={loading}
                                        className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                                    >
                                        Validate
                                    </button>
                                    <button
                                        onClick={() => handleGetIdea(idea.id)}
                                        disabled={loading}
                                        className="text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-md font-medium transition-colors"
                                    >
                                        Get Details
                                    </button>
                                    <button
                                        onClick={() => handleDelete(idea.id)}
                                        disabled={loading}
                                        className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md font-medium transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Last Action Result</h2>
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        )}
                        <pre className="bg-slate-900 text-emerald-400 p-6 rounded-xl overflow-auto max-h-[700px] text-xs font-mono border border-slate-800 shadow-xl">
                            {result ? JSON.stringify(result, null, 2) : '// No action performed yet'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}
