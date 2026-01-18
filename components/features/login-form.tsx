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

const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
})

export function LoginForm() {
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

        const formData = new FormData()
        formData.append('email', values.email)
        formData.append('password', values.password)

        const result = await signIn(formData)

        // Note: signIn redirects on success, so if we get a result, it's likely an error unless handled otherwise
        // However, server actions that redirect throws an error that Next.js catches.
        // Use a try-catch block wrapping server action calls if not returning simple objects?
        // In this specific implementation of signIn, it returns `{ error: string }` OR it throws a redirect.
        // So if result is returned, it is an error.

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
        // If no result returned and no redirect happened (which shouldn't happen with valid redirect), check logic.
        // Actually standard Next.js redirect in Server Action works fine. 
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-muted/20">
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
                                        <Input placeholder="name@example.com" {...field} />
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
                            <div className="text-sm font-medium text-destructive text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground">
                <div>
                    Don&apos;t have an account?{' '}
                    <NextLink href="/signup" className="text-primary hover:underline font-medium">
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
