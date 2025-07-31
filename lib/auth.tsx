import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { users } from '@/app/drizzle/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const userRes = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1)
                const user = userRes[0]

                if (!user) {
                    throw new Error('User not found')
                }

                if (!user.approved) {
                    throw new Error('Your account is not approved by admin yet')
                }

                const validPassword = await bcrypt.compare(credentials.password, user.password!)

                if (!validPassword) {
                    throw new Error('Invalid credentials')
                }

                return {
                    id: user.id,
                    email: user.email ?? '',
                    role: user.role ?? 'user',
                    approved: user.approved,
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        signIn: async ({ user, account }) => {
            if (account?.provider === 'google' && user?.email) {
                const userRes = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email))
                    .limit(1)

                const existingUser = userRes[0]

                if (!existingUser || !existingUser.approved) {
                    return false // ⛔️ This blocks sign-in and redirects with `?error=AccessDenied`
                }
            }

            return true
        }
        ,
        async jwt({ token, user, account }) {
            // Handle Google login
            if (account?.provider === 'google' && user?.email) {
                let userRes = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email))
                    .limit(1)

                let existingUser = userRes[0]

                // If user doesn't exist, insert it
                if (!existingUser) {
                    const inserted = await db
                        .insert(users)
                        .values({
                            email: user.email,
                            role: 'user',
                            approved: false,
                            created_at: new Date(), // Optional
                        })
                        .returning()

                    existingUser = inserted[0]
                }

                token.id = existingUser.id
                token.role = existingUser.role
                token.approved = true
                return token
            }

            // Handle credentials login (approved check is already in authorize)
            if (user) {
                token.id = user.id
                token.role = user.role
                token.approved = user.approved
            }

            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as number
                session.user.role = token.role as string
                session.user.approved = token.approved as boolean
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
}
