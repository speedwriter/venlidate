'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import NextLink from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPassword } from '@/app/actions/auth'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
})

export function ResetPasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const formData = new FormData()
            formData.append('email', values.email)

            const result = await resetPassword(formData)

            if (result && !result.success) {
                setError(result.error || 'Something went wrong')
                toast.error(result.error || 'Something went wrong. Please try again.')
            } else if (result && result.success) {
                setSuccess('Check your email for the password reset link.')
                toast.success('Reset link sent! Please check your email.')
                form.reset()
            }
        } catch (e) {
            console.error(e)
            setError('An unexpected error occurred.')
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-muted/20 animate-in fade-in duration-500">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Reset password</CardTitle>
                <CardDescription className="text-center">
                    Enter your email address and we&apos;ll send you a link to reset your password
                </CardDescription>
            </CardHeader>
            <CardContent>
                {success ? (
                    <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 text-center animate-in zoom-in duration-300" role="alert">
                        <span className="font-medium">Success!</span> {success}
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <div className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner className="mr-2 text-primary-foreground" size={16} />
                                        Sending link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>
                    </Form>
                )}
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <NextLink href="/login" className="text-primary hover:underline font-medium">
                    Back to login
                </NextLink>
            </CardFooter>
        </Card>
    )
}
