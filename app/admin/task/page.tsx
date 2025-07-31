"use client"

import { format } from "date-fns"
import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, CheckCircle2, XCircle } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  assignedTo: string
  createdAt: string
  dueDate?: string
  completed?: boolean
}

export default function Task() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/admin/tasks")
      const data = await res.json()
      setTasks(data.todos || [])
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed
    if (filter === "incomplete") return !task.completed
    return true
  })

  return (
    <div className="max-w-4xl p-6">
      <h3 className="text-2xl font-semibold mb-6">Assigned Tasks</h3>

      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filter === "incomplete" ? "default" : "outline"}
          onClick={() => setFilter("incomplete")}
        >
          Incomplete
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-center text-muted-foreground">No tasks found for selected filter.</p>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border p-5 shadow-sm bg-white hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold mb-1">{task.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                </div>
                <Badge
                  variant={task.completed ? "default" : "outline"}
                  className={`text-xs px-3 py-1 rounded-full ${
                    task.completed
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-100 text-red-600 border border-red-300"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {task.completed ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Incomplete
                      </>
                    )}
                  </div>
                </Badge>
              </div>

              {task.dueDate && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Due: {format(new Date(task.dueDate), "PPP")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
