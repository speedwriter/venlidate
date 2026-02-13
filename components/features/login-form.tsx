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
import { signIn } from '@/app/actions/auth'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
})

import { useSearchParams } from 'next/navigation'

export function LoginForm() {
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirectTo') || undefined
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('email', values.email)
            formData.append('password', values.password)

            const result = await signIn(formData, redirectTo)

            if (result && !result.success) {
                setError(result.error || 'Invalid email or password')
                toast.error(result.error || 'Something went wrong. Please try again.')
            }
        } catch (e) {
            // Redirect errors are expected and should not be handled as errors here
            if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) {
                throw e;
            }
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
                <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                    Enter your email to sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
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
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground">
                <div>
                    Don&apos;t have an account?{' '}
                    <NextLink href={redirectTo ? `/signup?redirectTo=${redirectTo}` : "/signup"} className="text-primary hover:underline font-medium">
                        Sign up
                    </NextLink>
                </div>
                <div>
                    <NextLink href="/reset-password" className="text-xs hover:underline">
                        Forgot your password?
                    </NextLink>
                </div>
            </CardFooter>
        </Card>
    )
}
