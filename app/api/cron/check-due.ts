import { todos } from "@/app/drizzle/schema"
import { db } from "@/lib/db"
import { getIO } from "@/lib/websocket-server"
import { and, eq, lt } from "drizzle-orm"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date()
  const upcoming = new Date(now.getTime() + 5 * 60 * 1000)

  const dueTasks = await db
    .select()
    .from(todos)
    .where(and(lt(todos.due_date, upcoming), eq(todos.completed, false)))

  const io = getIO()

  for (const task of dueTasks) {
    io.to(task.user_id.toString()).emit("notify-user", {
      message: `Task "${task.title}" is due soon!`,
      taskId: task.id,
    })
  }

  return res.status(200).json({ message: "Checked due tasks", count: dueTasks.length })
}
