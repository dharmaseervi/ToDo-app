import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { users } from '@/app/drizzle/schema'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const existing = await db.select().from(users).where(eq(users.email, email))
  if (existing.length > 0) {
    return NextResponse.json({ success: false, message: 'Email already exists' })
  }

  const hashed = await bcrypt.hash(password, 10)

  await db.insert(users).values({
    email,
    password: hashed,
    role: 'user',
    approved: false,
  })

  return NextResponse.json({ success: true })
}
