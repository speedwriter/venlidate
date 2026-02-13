import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { CheckCircle, TrendingUp, Users, Star, TrendingDown, ClipboardCheck, Map, Rocket, Lock, Target } from 'lucide-react'
import { HeroAnimation } from '@/components/features/hero-animation'
import { ComparisonTable } from '@/components/features/comparison-table'
import { PricingPreviewSection } from '@/components/features/pricing-preview-section'
import { IdeaCard } from '@/components/features/idea-card'
import { getSharedIdeas } from '@/app/actions/shared-ideas'

export const metadata = {
  title: 'Venlidate - Validate and Improve Your Startup Idea with AI',
  description: 'Stop guessing. AI validates your startup idea, gives you a personalized action plan, and tracks your improvement from 52 to 74. Join 500+ founders building with confidence.',
  openGraph: {
    title: 'Venlidate - Validate and Improve Your Startup Idea',
    description: 'Get your startup idea scored by AI, see exactly what to fix, and track your progress. Free to start.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venlidate - AI-Powered Startup Validation',
    description: 'Validate your idea. Get a roadmap. Build with confidence.',
    images: ['/og-image.png'],
  },
}

export default async function LandingPage() {
  // Section 6: Idea Marketplace Preview Data
  const { data: sharedIdeas } = await getSharedIdeas('approved', 6, 0)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Section 1: Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white py-20 lg:py-32">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 pointer-events-none" />

        <div className="container px-4 max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                AI-Powered Startup Validation
              </div>

              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Turn Your Startup Idea Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Winning Business Plan</span>
              </h1>

              <p className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0">
                AI validates your idea, shows you exactly what to fix, and guides you to a 70+ score. Join <span className="text-white font-semibold">500+ founders</span> who stopped guessing and started building.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="text-lg px-8 h-14 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20" asChild>
                  <Link href="/signup">Validate Your Idea Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:text-white text-slate-300" asChild>
                  <Link href="/ideas">Browse 200+ Ideas (in beta testing)</Link>
                </Button>
              </div>

              <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span className="ml-2 font-medium text-slate-300">4.8/5 from founders</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-700" />
                <div><span className="text-white font-bold">1,200+</span> ideas validated</div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
              <HeroAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Problem Statements */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              You Have Ideas. But Which One Won&apos;t Waste Your Time?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Decision Paralysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  You have 5 ideas in your Notes app. No idea which one to pursue first, so you pursue none of them.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">False Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  You spent 6 months building... nobody wanted it. You missed the clear warning signs early on.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle className="text-xl">Guesswork</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Every mentor gives different advice. Your mom loves it, VC Twitter hates it. You&apos;re more confused than before.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl font-medium text-slate-900">Stop guessing. Start validating.</p>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Validate. Improve. Build. (In That Order.)
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute top-0 left-6 -mt-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">Step 1</div>
              <Card className="h-full border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                    <ClipboardCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Validate Your Idea</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <span>Answer 7 questions (5 mins)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <span>AI scores across proven fundamentals</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <span>Get your score in 60 seconds</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute top-0 left-6 -mt-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">Step 2</div>
              <Card className="h-full border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all bg-indigo-50/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                      <Map className="w-6 h-6 text-indigo-600" />
                    </div>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none">Pro</Badge>
                  </div>
                  <CardTitle className="text-lg">Get Your Roadmap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <span className="font-semibold">See exactly what&apos;s broken</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <span>Get personalized thinking questions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5" />
                    <span>Prioritized action plan</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute top-0 left-6 -mt-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">Step 3</div>
              <Card className="h-full border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Improve Your Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Validate assumptions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Answer the critical questions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Re-validate and see score rise</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute top-0 left-6 -mt-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">Step 4</div>
              <Card className="h-full border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <Rocket className="w-6 h-6 text-slate-700" />
                  </div>
                  <CardTitle className="text-lg">Build with Confidence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span>Hit 70+ score (Green Zone)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span>You&apos;re ready to build</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-500 mt-0.5" />
                    <span>Share your validated idea</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" className="px-8 bg-indigo-600 hover:bg-indigo-700 font-semibold" asChild>
              <Link href="/signup">Start Validating Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Differentiation */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Unlike Templates, Mentors, or Guesswork—This Actually Works
            </h2>
          </div>
          <ComparisonTable />
        </div>
      </section>

      {/* Section 5: Testimonial */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
            &quot;I went from 52 to 74 in 2 weeks by answering the thinking questions. The action plan told me exactly what to validate first. Now I&apos;m confident enough to quit my job and build this.&quot;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xl">S</div>
            <div className="text-left">
              <div className="font-bold">Sarah K.</div>
              <div className="text-slate-400 text-sm">Former Consultant &rarr; Founder</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Idea Marketplace Preview */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
              No Ideas? Browse ideas validated by Our Community (in beta testing)
            </h2>
            <p className="text-lg text-slate-500">Developers, designers, marketers—people with skills but no ideas. Start here.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sharedIdeas?.map((idea) => (
              <div key={idea.id} className="h-[400px]">
                <IdeaCard idea={idea} mode="marketplace" isAuthenticated={false} />
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Button size="lg" variant="outline" className="px-8 border-slate-300 bg-white hover:bg-slate-50" asChild>
              <Link href="/ideas">Browse All Ideas</Link>
            </Button>
            <p className="text-sm text-slate-500">200+ ideas shared | 45 in the green zone | New ideas added daily</p>
          </div>
        </div>
      </section>

      {/* Section 7: Pricing Preview */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
              Start Free. Upgrade When You&apos;re Ready to Build.
            </h2>
          </div>

          <PricingPreviewSection />

          <div className="mt-12 text-center">
            <p className="text-slate-500 mb-4">No credit card required. Cancel anytime.</p>
            <Link href="/pricing" className="text-indigo-600 font-semibold hover:underline">See Full Pricing &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Section 8: Trust Builders */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl border-b inline-block pb-4 border-slate-300">
              Built by Founders, for Founders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Real Results</h3>
              <ul className="text-slate-600 space-y-2">
                <li>1,200+ ideas validated</li>
                <li>Average improvement: +18 points</li>
                <li>73% who hit 70+ actually built</li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Privacy First</h3>
              <ul className="text-slate-600 space-y-2">
                <li>Your ideas stay private</li>
                <li>(unless you chose to share)</li>
                <li>No data selling. Ever.</li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold">No BS Guarantee</h3>
              <ul className="text-slate-600 space-y-2">
                <li>If it scores 30/100, we&apos;ll tell you</li>
                <li>No false validation</li>
                <li>Save months of wasted time</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: FAQ */}
      <section className="py-20 bg-white">
        <div className="container px-4 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Common Questions</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg">Is this just a form that spits out random scores?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                No. We use multi-LLM models to analyze, validate and critique your idea against proven startup fundamentals. The AI reads your specific answers, compares them against successful business models, and gives personalized reasoning for each score.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg">Can&apos;t I just ask ChatGPT to validate my idea?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                You could. But ChatGPT will often be overly positive (&quot;hallucinating helpfulness&quot;) and won&apos;t give you a structured framework. We force you to think through 7 critical dimensions and track your improvement over time with specific scoring algorithms.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg">What if I don&apos;t have an idea yet?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                Browse our marketplace of 500+ validated ideas. You can filter by score, industry, or time commitment to find something that resonates with your skills.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg">Do I need to pay to get value?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                No. The Free tier gives you 1 validation/month plus thinking questions. That&apos;s enough to validate your best idea. Upgrade to Pro ($39) only when you need the detailed action plan or want to validate multiple ideas.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg">What if my idea scores low?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                Good! Now you know what&apos;s broken before wasting time building it. Most users improve 15-20 points after answering the thinking questions and re-validating. It&apos;s part of the process.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left text-lg">How is this different from Lean Canvas?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                Lean Canvas is a static framework. Venlidate is active analysis. We score your idea, show you specifically what&apos;s weak, and track your progress as you iterate. It&apos;s like having a mentor check your homework.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Section 10: Final CTA */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
              Ready to Stop Guessing and Start Building?
            </h2>
            <p className="text-indigo-200 text-xl max-w-2xl mx-auto">
              Join 5,000+ creators who trust Venlidate to verify their next big thing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">I Have Ideas to Validate</CardTitle>
                <CardDescription className="text-slate-400">Get your score in 2 minutes</CardDescription>
              </CardHeader>
              <CardContent className="h-full flex items-end">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold" size="lg" asChild>
                  <Link href="/signup">Validate My Idea Free</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">I Need Ideas First</CardTitle>
                <CardDescription className="text-slate-400">Find a validated problem to solve</CardDescription>
              </CardHeader>
              <CardContent className="h-full flex items-end">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-semibold" size="lg" asChild>
                  <Link href="/ideas">Browse Marketplace</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30 text-white hover:border-indigo-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-300">I Want the Action Plan</CardTitle>
                <CardDescription className="text-slate-400">Get the full roadmap</CardDescription>
              </CardHeader>
              <CardContent className="h-full flex items-end">
                <Button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold shadow-lg shadow-indigo-900/50" size="lg" asChild>
                  <Link href="/signup?plan=pro">Start Pro Free Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
