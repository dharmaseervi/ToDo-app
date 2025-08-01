import { NextResponse } from 'next/server'
import { pusher } from '@/lib/pusher/server'

export async function POST(req: Request) {
  const { todoId, message } = await req.json()
    console.log("📤 Sending Pusher Event:", { todoId, message })

  await pusher.trigger('admin-channel', 'task-completed', {
    todoId,
    message,
  })

  return NextResponse.json({ success: true })
}
