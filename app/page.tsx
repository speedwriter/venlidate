import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Target,
  BarChart3,
  Flame,
  ShieldCheck,
  Clock,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const dimensions = [
    {
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      title: "Painkiller Level",
      description: "Is your idea solving a 'hair-on-fire' problem or just a 'nice-to-have'?"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
      title: "Revenue Model",
      description: "Clear paths to monetization and sustainable unit economics."
    },
    {
      icon: <Target className="h-6 w-6 text-purple-500" />,
      title: "Acquisition",
      description: "How easily and cheaply you can reach your target customers."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
      title: "The Moat",
      description: "Defensibility against competitors and market shifts."
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Founder Fit",
      description: "Do you have the unique edge to execute this specific idea?"
    },
    {
      icon: <Clock className="h-6 w-6 text-slate-500" />,
      title: "Time to Revenue",
      description: "How quickly can you get to your first \$1,000 in sales?"
    },
    {
      icon: <Zap className="h-6 w-6 text-cyan-500" />,
      title: "Scalability",
      description: "Growth potential without linear increases in costs."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-zinc-50 border-b">
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 mb-8 text-sm font-medium text-blue-700 bg-blue-50 rounded-full ring-1 ring-inset ring-blue-700/10">
              New: AI-Powered Startup Analysis
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 mb-8 leading-[1.1]">
              Validate Your Startup Idea <span className="text-blue-600">Before Quitting Your Job</span>
            </h1>
            <p className="text-xl text-zinc-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              AI-powered analysis across 7 business model fundamentals. Know if your idea can scale and monetize in 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 text-lg border-zinc-200" asChild>
                <Link href="/test-report">See Example Report</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Subtle decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl opacity-50" />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">How It Works</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">From napkin sketch to data-backed validation in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 font-bold text-2xl">1</div>
              <h3 className="text-xl font-bold mb-3">Answer 7 Questions</h3>
              <p className="text-zinc-500">Provide the core details about your startup idea, market, and unique approach.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 font-bold text-2xl">2</div>
              <h3 className="text-xl font-bold mb-3">AI Deep Analysis</h3>
              <p className="text-zinc-500">Our engine analyzes your idea against proven business frameworks and market data.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 font-bold text-2xl">3</div>
              <h3 className="text-xl font-bold mb-3">Get Scored Report</h3>
              <p className="text-zinc-500">Receive a detailed breakdown with scores and actionable recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Dimensions Showcase */}
      <section className="py-24 bg-zinc-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">The 7 Dimensions of Validation</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">We analyze your idea across the core fundamentals that determine startup success vs. failure.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {dimensions.map((dim, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{dim.icon}</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{dim.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{dim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="text-5xl font-extrabold text-blue-600 mb-2">500+</div>
            <div className="text-xl font-medium text-zinc-600">Aspiring founders already validated their ideas.</div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                quote: "Venlidate saved me 6 months of building something nobody wanted. The 'Moat' analysis was a wake-up call.",
                author: "Sarah J.",
                role: "Product Manager turned Founder"
              },
              {
                quote: "The speed is incredible. I had 3 ideas, and in 10 minutes I knew exactly which one had the best unit economics.",
                author: "Michael R.",
                role: "Serial Entrepreneur"
              }
            ].map((t, i) => (
              <div key={i} className="p-8 bg-zinc-50 rounded-3xl relative">
                <p className="text-lg text-zinc-700 italic mb-6">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex-shrink-0" />
                  <div>
                    <div className="font-bold text-zinc-900">{t.author}</div>
                    <div className="text-sm text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-blue-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to validate your idea?</h2>
          <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto">
            Stop guessing and start building with confidence. Get your validation report in 60 seconds.
          </p>
          <Button asChild size="lg" className="rounded-full px-12 text-lg bg-white text-blue-600 hover:bg-zinc-100 shadow-xl border-none">
            <Link href="/signup">Sign Up Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-zinc-100">
        <div className="container px-4 mx-auto text-center">
          <div className="text-xl font-bold tracking-tight text-zinc-900 mb-4">Venlidate</div>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Venlidate. Build something that matters.</p>
        </div>
      </footer>
    </div>
  );
}
