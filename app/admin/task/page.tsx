"use client"

import { format } from "date-fns"
import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, CheckCircle2, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/tasks")
      const data = await res.json()
      setTasks(data.todos || [])
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed
    if (filter === "incomplete") return !task.completed
    return true
  })

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export")
      if (!res.ok) throw new Error("Failed to export tasks")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tasks-${new Date().toISOString()}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      console.error("Failed to export tasks:", err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  return (
    <div className="max-w-4xl p-6">
      <h3 className="text-2xl font-semibold mb-6">Assigned Tasks</h3>

      <div className="flex gap-2 mb-4">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
        <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")}>Completed</Button>
        <Button variant={filter === "incomplete" ? "default" : "outline"} onClick={() => setFilter("incomplete")}>Incomplete</Button>
        <Button variant={"outline"} onClick={handleExport}>Export Tasks (CSV)</Button>

      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border p-5 shadow-sm bg-white space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
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
                  className={`text-xs px-3 py-1 rounded-full ${task.completed
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
              <div className=" flex justify-end">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </Button>
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
