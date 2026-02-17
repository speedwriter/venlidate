"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== "undefined") {
            const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
            const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

            if (key && host) {
                posthog.init(key, {
                    api_host: host,
                    person_profiles: "always", // or 'identified_only'
                    capture_pageview: false, // We track pageviews manually to ensure they're caught on route changes
                    capture_pageleave: true,
                });
            }
        }
    }, []);

    return <PHProvider client={posthog}><PostHogPageview />{children}</PHProvider>;
}

function PostHogPageview() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && posthog) {
            let url = window.origin + pathname;
            if (searchParams.toString()) {
                url = url + "?" + searchParams.toString();
            }
            posthog.capture("$pageview", {
                $current_url: url,
            });
        }
    }, [pathname, searchParams]);

    return null;
}
