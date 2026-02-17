import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Venlidate - AI-Powered Startup Idea Validation & Marketplace",
  description: "Validate startup ideas with AI across 7 business fundamentals. Browse 200+ validated ideas, get actionable insights, and discover opportunities.",
  openGraph: {
    title: "Venlidate - AI-Powered Startup Idea Validation",
    description: "Validate startup ideas with AI across 7 business fundamentals. Know if your idea can scale and monetize in 60 seconds.",
    type: 'website',
  },
  icons: {
    icon: '/icon.svg',
  }
};

import { Toaster } from "@/components/ui/sonner";
import { PostHogProvider } from "@/components/posthog-provider";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <PostHogProvider>
            {children}
            <Toaster position="top-center" richColors />
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
