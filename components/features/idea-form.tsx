'use client'

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createIdea, updateIdea, submitIdeaForValidation } from "@/app/actions/ideas"
import { getUserTierAction, checkValidationQuotaAction } from "@/app/actions/subscriptions"

type FieldName = keyof FormData

const ideaSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    problem: z.string().min(20, "Problem description must be at least 20 characters"),
    targetCustomer: z.string().min(10, "Target customer must be at least 10 characters"),
    painkillerMoment: z.string().min(10, "Painkiller moment must be at least 10 characters"),
    revenueModel: z.string().min(10, "Revenue model must be at least 10 characters"),
    unfairAdvantage: z.string().min(10, "Unfair advantage must be at least 10 characters"),
    distributionChannel: z.string().min(10, "Distribution channel must be at least 10 characters"),
    timeCommitment: z.enum(["nights_weekends", "part_time", "full_time"]),
})

type FormData = z.infer<typeof ideaSchema>

const STEPS = [
    { id: 1, title: "Basic Info", description: "The core concept of your idea" },
    { id: 2, title: "Business Model", description: "How you'll make money and reach users" },
    { id: 3, title: "Founder Context", description: "Why you are the right person for this" },
]

interface IdeaFormProps {
    initialData?: Partial<FormData>
    ideaId?: string
}

export function IdeaForm({ initialData, ideaId }: IdeaFormProps) {
    const [step, setStep] = React.useState(1)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [validationStatus, setValidationStatus] = React.useState<string | null>(null)
    const [quotaWarning, setQuotaWarning] = React.useState<string | null>(null)
    const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
    const router = useRouter()

    const form = useForm<FormData>({
        resolver: zodResolver(ideaSchema),
        defaultValues: {
            title: initialData?.title || "",
            problem: initialData?.problem || "",
            targetCustomer: initialData?.targetCustomer || "",
            painkillerMoment: initialData?.painkillerMoment || "",
            revenueModel: initialData?.revenueModel || "",
            unfairAdvantage: initialData?.unfairAdvantage || "",
            distributionChannel: initialData?.distributionChannel || "",
            timeCommitment: initialData?.timeCommitment || "nights_weekends",
        },
    })

    React.useEffect(() => {
        async function fetchQuotaStatus() {
            try {
                const tier = await getUserTierAction()
                const quota = await checkValidationQuotaAction(ideaId)

                if (quota.usingCredit && typeof quota.remaining === 'number') {
                    setQuotaWarning(`You have ${quota.remaining} free credit${quota.remaining !== 1 ? 's' : ''} (earned from sharing ideas).`)
                } else if (quota.remaining === 0 && tier === 'free') {
                    setQuotaWarning("You've used all your validations this month. Upgrade to continue.")
                } else if (quota.remaining === 1) {
                    setQuotaWarning("This is your last validation this month.")
                } else if (typeof quota.remaining === 'number' && quota.remaining > 1) {
                    setQuotaWarning(`You have ${quota.remaining} validations remaining this month.`)
                }
            } catch (error) {
                console.error("Failed to fetch quota status:", error)
            }
        }
        fetchQuotaStatus()
    }, [ideaId])


    async function onSubmit(values: FormData) {
        setIsSubmitting(true)
        setValidationStatus("Saving your idea draft...")

        try {
            // Prepare FormData for the server action
            const formData = new FormData()
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value)
            })

            // If new idea logic was removed above, we need to ensure we don't declare result twice if we merge logic blocks.
            // But here I'm replacing the whole block logic.
            // Wait, I need to match the target content exactly.
            // The logic above handles both cases. 
            // The previous chunk started at line 95.
            // This chunk should delete lines 87-94 and incorporate them into the logic above?
            // Actually, I can replace the whole try block content or just the part that differs.

            // Let's look at lines 87-94 in original:
            // const result = await createIdea(formData)
            // if (!result.success || !result.data) {
            //    toast.error(result.error || "Failed to create idea")
            //    throw new Error(result.error || "Failed to create idea")
            // }
            // const ideaId = result.data.id

            // My earlier chunk replaced lines 95 onwards.
            // So I need to replace lines 87-94 as well or handle them.
            // Let's do a larger replacement covering from line 87 to 105.

            let targetIdeaId = ideaId

            if (ideaId) {
                // Update existing idea
                const result = await updateIdea(ideaId, formData)
                if (!result.success) {
                    toast.error(result.error || "Failed to update idea")
                    throw new Error(result.error || "Failed to update idea")
                }
            } else {
                // Create new idea
                const result = await createIdea(formData)

                if (!result.success || !result.data) {
                    toast.error(result.error || "Failed to create idea")
                    throw new Error(result.error || "Failed to create idea")
                }
                targetIdeaId = result.data.id
            }

            setValidationStatus("AI is validating your idea. This usually takes 15-30 seconds...")

            if (!targetIdeaId) throw new Error("No idea ID found")

            const validationResult = await submitIdeaForValidation(targetIdeaId)

            if (!validationResult.success) {
                if ((validationResult as { success: boolean, error?: string, upgradeRequired?: boolean }).upgradeRequired) {
                    setShowUpgradeModal(true)
                } else {
                    toast.error(validationResult.error || "AI validation failed")
                }
                throw new Error(validationResult.error || "AI validation failed")
            }

            toast.success(validationResult.message || "Idea validated successfully!")
            router.push(`/dashboard/${targetIdeaId}`)
        } catch (error) {
            console.error(error)
            setValidationStatus(null)
            if (!(error instanceof Error && error.message.includes("NEXT_REDIRECT"))) {
                toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = async () => {
        const fields = getFieldsForStep(step) as FieldName[]
        const isValid = await form.trigger(fields)
        if (isValid) {
            setStep((s) => Math.min(s + 1, 3))
        }
    }

    const prevStep = () => {
        setStep((s) => Math.max(s - 1, 1))
    }

    const getFieldsForStep = (s: number) => {
        switch (s) {
            case 1: return ["title", "problem", "targetCustomer"]
            case 2: return ["painkillerMoment", "revenueModel", "distributionChannel"]
            case 3: return ["unfairAdvantage", "timeCommitment"]
            default: return []
        }
    }

    const progress = (step / STEPS.length) * 100

    return (
        <Card className="border-none shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center mb-4">
                    <div className="space-y-1">
                        <CardTitle>{STEPS[step - 1].title}</CardTitle>
                        <CardDescription>{STEPS[step - 1].description}</CardDescription>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        Step {step} of 3
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
                {quotaWarning && (
                    <Alert variant="warning" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Subscription Quota</AlertTitle>
                        <AlertDescription>{quotaWarning}</AlertDescription>
                    </Alert>
                )}
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Idea Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Uber for Pet Grooming" {...field} />
                                            </FormControl>
                                            <FormDescription>A short, catchy name for your idea.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="problem"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>What problem are you solving?</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the specific pain point your customers face today..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>Min 20 characters. Be specific about the frustration.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetCustomer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Who is your target customer?</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Busy pet owners in urban areas" {...field} />
                                            </FormControl>
                                            <FormDescription>Who has this problem most acutely?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="painkillerMoment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>The Painkiller Moment</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="When do they desperately need this solution? Describe that moment..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>The &apos;emergency&apos; or peak frustration moment.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="revenueModel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Revenue Model</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Monthly subscription, Transaction fee..." {...field} />
                                            </FormControl>
                                            <FormDescription>How will you charge for your value?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="distributionChannel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Distribution Channel</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Instagram Ads, Partnerships with Vets..." {...field} />
                                            </FormControl>
                                            <FormDescription>How will you find and reach your first 100 customers?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="unfairAdvantage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unfair Advantage / Moat</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="What makes you uniquely qualified or what&apos;s hard to copy?"
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>Why won&apos;t a big player just copy this tomorrow?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="timeCommitment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time Commitment</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your availability" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="nights_weekends">Nights & Weekends</SelectItem>
                                                    <SelectItem value="part_time">Part-time</SelectItem>
                                                    <SelectItem value="full_time">Full-time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>How much time can you realistically dedicate?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 py-6 px-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1 || isSubmitting}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                {step < 3 ? (
                    <Button type="button" onClick={nextStep}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Validating...
                            </>
                        ) : (
                            <>
                                <>
                                    {ideaId ? "Update & Revalidate" : "Submit for Validation"}
                                    <CheckCircle2 className="ml-2 h-4 w-4" />
                                </>
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>

            {isSubmitting && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg p-6 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Analyzing your idea</h3>
                    <p className="text-muted-foreground max-w-sm">
                        {validationStatus}
                    </p>
                </div>
            )}

            <AlertDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>You&apos;ve reached your validation limit</AlertDialogTitle>
                        <AlertDialogDescription>
                            Upgrade to Pro for 10 validations/month or Premium for unlimited validations and more features.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Maybe later</AlertDialogCancel>
                        <AlertDialogAction disabled className="bg-slate-200 text-slate-500 cursor-not-allowed">
                            Upgrade Coming Soon
                        </AlertDialogAction>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
