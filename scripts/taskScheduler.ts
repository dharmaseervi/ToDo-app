// scripts/taskScheduler.ts
import { todos } from "../app/drizzle/schema";
import { db } from "@/lib/db"
import { getIO, initSocket } from "@/lib/websocket-server"
import { and, eq, lt } from "drizzle-orm"
import cron from "node-cron"



initSocket() // if you have socket server setup

cron.schedule("* * * * *", async () => {
  const now = new Date()
  const upcoming = new Date(now.getTime() + 5 * 60 * 1000)

  const dueTasks = await db
    .select()
    .from(todos)
    .where(and(lt(todos.due_date, upcoming), eq(todos.completed, false)))

    console.log(`🔍 Found ${dueTasks} tasks due soon`);
    
  const io = getIO()

  for (const task of dueTasks) {
     console.log("Processing task:", task)
    if (task.user_id !== null && task.user_id !== undefined) {
      io.to(task.user_id.toString()).emit("notify-user", {
        message: `Task "${task.title}" is due soon!`,
        taskId: task.id,
      })
    }
  }

  console.log(`🔔 Sent ${dueTasks.length} due soon notifications`)
})
