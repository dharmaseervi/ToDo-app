'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, ClipboardList, ListTodo, AlarmClock } from "lucide-react"
import { format, isPast, differenceInHours } from "date-fns"

interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
  due_date?: string
}

export default function UserHome() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [reminder, setReminder] = useState<Todo | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/login")
    else if (session.user.role !== "user") router.push("/unauthorized")
  }, [session, status, router])

  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch("/api/users/todos")
      const data = await res.json()
      const fetched = data.todos || []

      setTodos(fetched)

      const soon = fetched.find((todo: Todo) => {
        if (!todo.due_date || todo.completed) return false
        const hours = differenceInHours(new Date(todo.due_date), new Date())
        return hours >= 0 && hours <= 24
      })

      if (soon) setReminder(soon)
    }

    if (session?.user?.role === "user") fetchTodos()
  }, [session])

  const completed = todos.filter((t) => t.completed).length
  const pending = todos.length - completed
  const progress = todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0

  const recent = todos
    .sort((a, b) => new Date(b.due_date || "").getTime() - new Date(a.due_date || "").getTime())
    .slice(0, 3)

  if (status === "loading" || !session) return <p className="p-4">Loading...</p>

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">
        Welcome, {session.user.email.split("@")[0]} 👋
      </h1>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completed Tasks</p>
              <p className="text-2xl font-bold text-green-600">{completed}</p>
            </div>
            <BadgeCheck className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Tasks</p>
              <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            </div>
            <ListTodo className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-600">{todos.length}</p>
            </div>
            <ClipboardList className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      {/* Reminder */}
      {reminder && (
        <div className="bg-orange-100 border-l-4 border-orange-400 p-4 rounded-xl flex items-center gap-3">
          <AlarmClock className="text-orange-500" />
          <div>
            <p className="font-semibold">
              Reminder: <span className="text-orange-800">{reminder.title}</span> is due soon.
            </p>
            <p className="text-sm text-muted-foreground">
              Due: {format(new Date(reminder.due_date!), "PPP")}
            </p>
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Tasks</h2>
        <div className="grid gap-4">
          {recent.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent tasks.</p>
          ) : (
            recent.map((todo) => (
              <Card key={todo.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{todo.title}</p>
                      <p className="text-sm text-muted-foreground">{todo.description}</p>
                      {todo.due_date && (
                        <p className={`text-xs mt-1 ${isPast(new Date(todo.due_date)) && !todo.completed ? "text-red-600" : "text-muted-foreground"}`}>
                          Due: {format(new Date(todo.due_date), "PPP")}
                        </p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-sm ${todo.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {todo.completed ? "Completed" : "Pending"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-8">
        <Link href="/user/todos">
          <Button>Manage My Tasks</Button>
        </Link>
        <Button variant="destructive" onClick={() => signOut()}>
          Logout
        </Button>
      </div>

      {/* Motivation */}
      <div className="text-center text-sm text-muted-foreground mt-6 italic">
        "Small steps every day lead to big changes. Keep going 💪"
      </div>
    </div>
  )
}
