'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                    <h1 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong!</h1>
                    <p className="mb-8 text-muted-foreground max-w-md">
                        {error.message || "An unexpected error occurred."}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
