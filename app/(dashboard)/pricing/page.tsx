import { createClient } from '@/lib/supabase/server';
import { WaitlistForm } from '@/components/features/waitlist-form';
import { Check, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PricingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const faqs = [
        {
            question: "When will you start charging?",
            answer: "We're currently in free beta. We plan to launch our paid plans in Q2 2026. Founder's Club members will get a lifetime 50% discount."
        },
        {
            question: "What happens to my data?",
            answer: "Your data is yours. All ideas and validations you create during the beta will remain accessible and private to you after we launch."
        },
        {
            question: "Can I export my reports?",
            answer: "Yes, you can currently view and print your reports. We're working on a native PDF export feature for our Founder's Club members."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[128px]" />
                </div>

                <div className="container px-4 mx-auto text-center relative z-10">
                    <Badge variant="secondary" className="mb-4 bg-indigo-100 text-indigo-700 px-4 py-1 border-indigo-200">
                        Founder's Club Now Open
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Currently in Free Beta
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Get unlimited validations while we're in beta. Join our Founder's Club for <span className="font-bold text-indigo-600 text-2xl">50% off</span> when we launch.
                    </p>

                    <div className="max-w-xl mx-auto">
                        <WaitlistForm initialEmail={user?.email} />
                        <p className="text-sm text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                            <Info className="w-4 h-4" /> No credit card required during beta
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Comparison */}
            <section className="py-20 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Transparent Future Pricing</h2>
                        <p className="text-slate-600">Know exactly what to expect when we move out of beta.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Free Beta Card */}
                        <Card className="border-indigo-200 shadow-xl shadow-indigo-500/5 relative overflow-hidden transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-indigo-500 rotate-45" />
                            <CardHeader>
                                <CardTitle className="text-2xl">Beta Period</CardTitle>
                                <CardDescription>Full access during development</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">$0</span>
                                    <span className="text-slate-500 ml-2">/forever</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {[
                                        "Unlimited idea validations",
                                        "All core dimensions",
                                        "Basic benchmarking",
                                        "Early access to new features"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600">
                                            <div className="flex-shrink-0 w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-indigo-600" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Badge className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none justify-center">Current Plan</Badge>
                            </CardFooter>
                        </Card>

                        {/* Pro Card (After Beta) */}
                        <Card className="border-slate-200 shadow-lg transition-all hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="text-2xl">Founder's Pro</CardTitle>
                                <CardDescription>Post-beta premium plan</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-400">$99</span>
                                    <span className="text-slate-500 ml-2">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {[
                                        "Unlimited idea validations",
                                        "Iteration tracking",
                                        "Community benchmarks",
                                        "Comparable companies",
                                        "Priority support",
                                        "Exclusive community access"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600">
                                            <div className="flex-shrink-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-slate-600" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="flex-col gap-4">
                                <div className="text-center w-full p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <p className="text-sm font-semibold text-purple-700">Pre-launch Price</p>
                                    <p className="text-2xl font-bold text-purple-900">$49.50<span className="text-lg font-normal text-purple-600">/mo</span></p>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Annual Card */}
                        <Card className="border-slate-200 shadow-lg transition-all hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="text-2xl">Founder's Annual</CardTitle>
                                <CardDescription>The best value for power users</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-400">$999</span>
                                    <span className="text-slate-500 ml-2">/year</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {[
                                        "All Pro features included",
                                        "2 months free vs monthly",
                                        "Private beta access",
                                        "Team sharing (up to 3 users)",
                                        "Custom branding",
                                        "Direct founder support"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600">
                                            <div className="flex-shrink-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-slate-600" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <div className="text-center w-full p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-sm font-semibold text-amber-700 text-center">Save 50% for life</p>
                                    <p className="text-sm text-amber-600">Join the waitlist today</p>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-50">
                <div className="container px-4 mx-auto max-w-3xl">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-8">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 bg-white relative">
                <div className="container px-4 mx-auto text-center border border-indigo-100 rounded-[2.5rem] py-16 bg-gradient-to-b from-indigo-50/50 to-white max-w-4xl">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to validate your next big idea?</h2>
                    <p className="text-slate-600 mb-10 max-w-lg mx-auto">
                        Don't build in the dark. Join 500+ founders using Venlidate to build things people actually want.
                    </p>
                    <div className="max-w-md mx-auto">
                        <WaitlistForm initialEmail={user?.email} />
                    </div>
                </div>
            </section>
        </div>
    );
}
