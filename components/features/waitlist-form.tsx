'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { joinWaitlist } from '@/app/actions/waitlist';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface WaitlistFormProps {
    initialEmail?: string;
}

export function WaitlistForm({ initialEmail = '' }: WaitlistFormProps) {
    const [email, setEmail] = useState(initialEmail);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        setError(null);

        const formData = new FormData();
        formData.append('email', email);

        startTransition(async () => {
            const result = await joinWaitlist(formData);
            if (result.success) {
                setMessage(result.message || "You're on the list!");
                toast.success(result.message || "You're on the list!");
            } else if (result.error) {
                setError(result.error);
                toast.error(result.error);
            }
        });
    }

    if (message) {
        return (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center animate-in fade-in slide-in-from-bottom-4">
                {message}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/50 backdrop-blur-sm border-white/20 h-12"
                    disabled={isPending}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg hover:shadow-indigo-500/20"
            >
                {isPending ? (
                    <>
                        <LoadingSpinner className="mr-2 text-white" size={18} />
                        Joining...
                    </>
                ) : (
                    "Join Founder's Club"
                )}
            </Button>
        </form>
    );
}
