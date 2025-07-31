"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { format, isToday, isPast, differenceInHours } from "date-fns"
import { toast } from "sonner"

interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
  due_date?: string
}

export default function UserTodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")

  console.log('todos:', todos);
  
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/users/todos")
      const data = await res.json()
      const fetchedTodos = data.todos || []
      setTodos(fetchedTodos)

      // Check for due reminders
      const dueSoon = fetchedTodos.find((todo: Todo) => {
        if (!todo.due_date || todo.completed) return false
        const hours = differenceInHours(new Date(todo.due_date), new Date())
        return hours >= 0 && hours <= 24
      })
      if (dueSoon) {
        toast.warning(`Reminder: Task "${dueSoon.title}" is due soon.`)
      }
    } catch (err) {
      console.error("Failed to fetch todos:", err)
    }
  }

  const handleToggleComplete = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/user/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      })

      // Notify admin (mock)
      if (!currentStatus) {
        await fetch("/api/notify/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ todoId: id }),
        })
      }

      fetchTodos()
    } catch (err) {
      console.error("Failed to update todo:", err)
    }
  }

  const filteredTodos = todos.filter((todo) =>
    filter === "all" ? true : filter === "completed" ? todo.completed : !todo.completed
  )

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Tasks</h2>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-4">
        {["all", "completed", "incomplete"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f as any)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Task List */}
      {filteredTodos.length === 0 ? (
        <p className="text-muted-foreground">No todos found for selected filter.</p>
      ) : (
        <div className="grid gap-4">
          {filteredTodos.map((todo) => {
            const isDueSoon = todo.due_date && differenceInHours(new Date(todo.due_date), new Date()) <= 24
            const isOverdue = todo.due_date && isPast(new Date(todo.due_date)) && !todo.completed

            return (
              <div key={todo.id} className="border p-4 rounded-xl shadow-sm bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{todo.title}</h4>
                    <p className="text-sm text-muted-foreground">{todo.description}</p>

                    {todo.due_date && (
                      <p className={`text-xs mt-1 ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        Due: {format(new Date(todo.due_date), "PPP")}
                        {isOverdue && " (Overdue)"}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={todo.completed ? "bg-green-600 text-white" : "bg-yellow-100 text-yellow-700"}
                    >
                      {todo.completed ? "Completed" : "Pending"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleToggleComplete(todo.id, todo.completed)}
                    >
                      {todo.completed ? "Mark Incomplete" : "Mark Complete"}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
