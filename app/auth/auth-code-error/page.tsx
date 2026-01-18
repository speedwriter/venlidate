import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCodeErrorPage() {
    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
            <Card className="w-full max-w-md mx-auto shadow-lg border-muted/20">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-destructive">Authentication Error</CardTitle>
                    <CardDescription className="text-center">
                        There was a problem authenticating your request.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    <p>The link may have expired or is invalid. Please try generating a new link.</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild>
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
