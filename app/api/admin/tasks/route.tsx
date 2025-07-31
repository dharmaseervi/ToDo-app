import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { todos } from '@/app/drizzle/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userTodos = await db.select().from(todos).where(eq(todos.user_id, session.user.id))
    return NextResponse.json({ todos: userTodos })
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, dueDate ,userId } = await req.json()

    const parsedDueDate = dueDate ? new Date(dueDate) : null

    const result = await db.insert(todos).values({
        title,
        description,
        user_id: userId,
        completed: false,
        due_date: parsedDueDate,
        created_at: new Date(),
        updated_at: new Date(),
    }).returning()

    return NextResponse.json({ todo: result[0] })
}
