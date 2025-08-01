'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { signIn } from 'next-auth/react'

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export default function SignupPage() {
    const { register, handleSubmit, formState } = useForm({
        resolver: zodResolver(formSchema),
    })
    const router = useRouter()
    const [error, setError] = useState('')

    const onSubmit = async (data: any) => {
        setError('')
        const res = await fetch('/api/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        })
        const result = await res.json()
        if (result.success) {
            router.push('/login')
        } else {
            setError(result.message || 'Something went wrong.')
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="max-w-sm w-full">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Sign Up</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input placeholder="Email" {...register('email')} />
                        <Input type="password" placeholder="Password" {...register('password')} />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full">
                            Create Account
                        </Button>
                    </form>
              
                    <Button className='mt-4 w-full' variant="outline" onClick={() => router.push('/login')}>
                        <p className="text-blue-500 hover:underline">
                            Already have an account? Login
                        </p>
                    </Button>

                </CardContent>
            </Card>
        </div>
    )
}
