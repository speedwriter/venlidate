'use client'

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from "lucide-react"
import { toast } from "sonner"

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
import { createAdminIdea } from "@/app/actions/shared-ideas"

const ideaSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    problem: z.string().min(20, "Problem description must be at least 20 characters"),
    solution: z.string().min(20, "Solution must be at least 20 characters"),
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

export function AdminIdeaForm() {
    const [step, setStep] = React.useState(1)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [validationStatus, setValidationStatus] = React.useState<string | null>(null)

    const form = useForm<FormData>({
        resolver: zodResolver(ideaSchema),
        defaultValues: {
            title: "",
            problem: "",
            solution: "",
            targetCustomer: "",
            painkillerMoment: "",
            revenueModel: "",
            unfairAdvantage: "",
            distributionChannel: "",
            timeCommitment: "nights_weekends",
        },
    })

    async function onSubmit(values: FormData) {
        setIsSubmitting(true)
        setValidationStatus("Validating and auto-approving...")

        try {
            const result = await createAdminIdea(values)

            if (!result.success) {
                toast.error(result.error || "Failed to create admin idea")
                throw new Error(result.error || "Failed to create admin idea")
            }

            toast.success("Idea validated and auto-approved!")
            form.reset()
            setStep(1)
        } catch (error) {
            console.error(error)
            setValidationStatus(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = async () => {
        const fields = getFieldsForStep(step) as (keyof FormData)[]
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
            case 1: return ["title", "problem", "solution", "targetCustomer"]
            case 2: return ["painkillerMoment", "revenueModel", "distributionChannel"]
            case 3: return ["unfairAdvantage", "timeCommitment"]
            default: return []
        }
    }

    const progress = (step / STEPS.length) * 100

    return (
        <Card className="border shadow-md">
            <CardHeader className="bg-primary/5 rounded-t-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            {STEPS[step - 1].title}
                        </CardTitle>
                        <CardDescription>{STEPS[step - 1].description}</CardDescription>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        Step {step} of 3
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="pt-6">
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="problem"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Problem</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the problem..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="solution"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proposed Solution</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the solution..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetCustomer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Customer</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Who is this for?" {...field} />
                                            </FormControl>
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
                                            <FormLabel>Painkiller Moment</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Peak frustration moment..."
                                                    className="min-h-[80px]"
                                                    {...field}
                                                />
                                            </FormControl>
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
                                                <Input placeholder="How will it make money?" {...field} />
                                            </FormControl>
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
                                                <Input placeholder="How will you reach users?" {...field} />
                                            </FormControl>
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
                                                    placeholder="Why you? Why now?"
                                                    className="min-h-[80px]"
                                                    {...field}
                                                />
                                            </FormControl>
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
                                                        <SelectValue placeholder="Select availability" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="nights_weekends">Nights & Weekends</SelectItem>
                                                    <SelectItem value="part_time">Part-time</SelectItem>
                                                    <SelectItem value="full_time">Full-time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/30 py-4 px-6 rounded-b-lg">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={step === 1 || isSubmitting}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90">
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90 min-w-[140px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                Create & Approve
                                <CheckCircle2 className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>

            {isSubmitting && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg p-6 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Creating Curated Idea</h3>
                    <p className="text-muted-foreground text-sm max-w-[200px]">
                        {validationStatus}
                    </p>
                </div>
            )}
        </Card>
    )
}
