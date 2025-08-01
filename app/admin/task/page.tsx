"use client"

import { format } from "date-fns"
import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, CheckCircle2, Cross, Delete, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { se } from "date-fns/locale"

interface Task {
  id: number
  title: string
  description: string
  assignedTo: string
  createdAt: string
  due_date?: string
  completed?: boolean
}

export default function Task() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")
  const [search, setSearch] = useState("")
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([])


  useEffect(() => {
    fetchTasks()
  }, [])


  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tasks?q=${encodeURIComponent(search)}`)
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

  const handleToggleSelect = (id: number) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }


  const handleBulkDelete = async () => {
    if (!confirm("Delete selected tasks?")) return;

    try {
      await fetch("/api/admin/tasks/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedTaskIds }),
      })
      setTasks(tasks.filter(task => !selectedTaskIds.includes(task.id)))
      setSelectedTaskIds([])
    } catch (err) {
      console.error("Bulk delete failed", err)
    }
  }


  return (
    <>
      <div className="max-w-4xl p-6">
        <SidebarTrigger className="-ml-1" />
        <h3 className="text-2xl font-semibold mb-6">Assigned Tasks</h3>

        <div className="flex flex-col gap-3 mb-6">
          {/* Search and Buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              type="text"
              placeholder="Search tasks..."
              className="w-full sm:max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button onClick={fetchTasks} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>

            <Button
              onClick={() => {
                setSearch("")
                fetchTasks()
              }}
              variant="outline"
            >
              Clear
            </Button>

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

            <Button variant="outline" onClick={handleExport}>
              Export Tasks (CSV)
            </Button>

            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={selectedTaskIds.length === 0}
            >
              Delete Selected
            </Button>
          </div>
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
          <p className="text-center text-muted-foreground">
            No tasks found for selected filter.
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`relative rounded-2xl border p-5 shadow-sm bg-white hover:shadow-md transition`}
              >
                <div className="absolute top-4 left-4">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.includes(task.id)}
                    onChange={() => handleToggleSelect(task.id)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="pl-10"> {/* Push content right to make space for checkbox */}
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

                  <div className="flex justify-between ">
                    {task.due_date && (
                      <div className=" flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due: {format(new Date(task.due_date), "PPP")}</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  )
}
