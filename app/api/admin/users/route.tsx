import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { users } from '@/app/drizzle/schema'
import { eq } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
  }

  const allUsers = await db.select().from(users)

  return NextResponse.json({ success: true, users: allUsers })
}
