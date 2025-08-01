'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPage() {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })
    const [error, setError] = React.useState<string | null>(null)

    const onSubmit = async (data: LoginForm) => {
        const res = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
            callbackUrl: '/',
        })

        if (res?.error) {
            console.error('Login error:', res.error)
            setError(res.error)
            // Optionally show error to user via toast or state
        } else {
            router.push('/') // or wherever you want after login
        }
    }


    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-md p-4">
                <CardHeader>
                    <CardTitle className="text-center text-xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input
                                type="email"
                                placeholder="Email"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                type="password"
                                placeholder="Password"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </Button>
                        {error && (
                            <p className="text-sm text-red-500 mt-2">{error}</p>
                        )}
                        <p className="text-sm text-center text-gray-500 mt-4">
                            Don't have an account? <a href="/signup" className="text-blue-500">Sign up</a>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginPage

