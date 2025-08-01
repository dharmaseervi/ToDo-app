import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { todos } from '@/app/drizzle/schema'
import { eq, sql } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }
   
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()

    let todosResult

    if (query) {
        // Full-text search
        const result = await db.execute(
            sql`SELECT * FROM todos WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery(${query})`
        )
        todosResult = result.rows
    } else {
        // Regular fetch
        todosResult = await db.select().from(todos)
    }

    return NextResponse.json({ todos: todosResult })
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, dueDate, userId } = await req.json()

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
