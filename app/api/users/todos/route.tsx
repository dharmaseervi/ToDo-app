import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { todos } from '@/app/drizzle/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
    const session = await getServerSession(authOptions)
    console.log('session:', session);
    
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userTodos = await db.select().from(todos).where(eq(todos.user_id, session.user.id))
    console.log(userTodos);
    
    return NextResponse.json({ todos: userTodos })
}

