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
  title: "Venlidate - AI-Powered Startup Idea Validation & Marketplace",
  description: "Validate startup ideas with AI across 7 business fundamentals. Browse 200+ validated ideas, get actionable insights, and discover opportunities.",
  openGraph: {
    title: "Venlidate - AI-Powered Startup Idea Validation",
    description: "Validate startup ideas with AI across 7 business fundamentals. Know if your idea can scale and monetize in 60 seconds.",
    type: 'website',
  }
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
