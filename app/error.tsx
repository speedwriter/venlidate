'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-destructive/10">
                <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong!</h1>
            <p className="mb-8 text-muted-foreground max-w-md">
                {error.message || "We encountered an unexpected error. Our team has been notified."}
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Try again
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    Go home
                </Button>
            </div>
        </div>
    );
}
