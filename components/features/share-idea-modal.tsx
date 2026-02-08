'use client'

import { useState } from 'react'
import { Gift, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { shareIdea } from '@/app/actions/shared-ideas'
import { Label } from '@/components/ui/label'

interface ShareIdeaModalProps {
    validationId: string
    ideaTitle: string
    onSuccess?: () => void
}

export function ShareIdeaModal({ validationId, ideaTitle, onSuccess }: ShareIdeaModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isAnonymous, setIsAnonymous] = useState(true)
    const [sharedByName, setSharedByName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleShare = async () => {
        setIsLoading(true)
        try {
            const result = await shareIdea(validationId, isAnonymous, sharedByName)
            if (result.success) {
                toast.success('Idea shared!', {
                    description: 'Pending approval. You earned 1 free validation credit.',
                })
                setIsOpen(false)
                onSuccess?.()
            } else {
                toast.error(result.error || 'Failed to share idea')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            console.error('Share error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300 text-amber-700 font-semibold shadow-sm transition-all hover:shadow-md h-10 px-4">
                    <Gift className="h-4 w-4" />
                    Share with Community
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-amber-100">
                <DialogHeader>
                    <div className="mx-auto bg-amber-100 p-3 rounded-2xl mb-2">
                        <Gift className="h-6 w-6 text-amber-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center">Share This Idea with the Community</DialogTitle>
                    <DialogDescription className="text-center text-base font-medium text-amber-900/70">
                        Inspire other founders and earn <span className="text-amber-600 font-bold">1 free validation credit</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Privacy Section */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="anonymous"
                                checked={isAnonymous}
                                onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                            />
                            <Label htmlFor="anonymous" className="font-bold cursor-pointer">Share anonymously</Label>
                        </div>

                        {!isAnonymous && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Your name (optional)</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Jane Doe"
                                    value={sharedByName}
                                    onChange={(e) => setSharedByName(e.target.value)}
                                    className="rounded-xl border-amber-100 focus:ring-amber-500"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Your name will be displayed as <span className="font-bold italic">&quot;Shared by {sharedByName || 'Anonymous'}&quot;</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* What will be shared */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                            <Info className="h-3 w-3" />
                            What will be shared:
                        </Label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-secondary/50 p-2 rounded-lg px-3 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>Idea title</span>
                            </div>
                            <div className="bg-secondary/50 p-2 rounded-lg px-3 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>Problem statement</span>
                            </div>
                            <div className="bg-secondary/50 p-2 rounded-lg px-3 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>Target customer</span>
                            </div>
                            <div className="bg-secondary/50 p-2 rounded-lg px-3 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>Overall score</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-amber-700/80 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 italic">
                            Note: Full validation details (reasoning, recommendations) are <span className="font-bold uppercase">not</span> shared.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-900/70">
                            Shared ideas are reviewed by our team before going live (usually within 24 hours).
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleShare}
                        disabled={isLoading}
                        className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sharing...
                            </>
                        ) : (
                            'Share Idea'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
