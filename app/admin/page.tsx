"use client"

import React, { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { UsersIcon, ClipboardListIcon, BarChart3Icon, CheckCircle2 } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"

export default function Page() {
  const [userCount, setUserCount] = useState(0)
  const [taskCount, setTaskCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, tasksRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/tasks"),
      ])

      const usersData = await usersRes.json()
      const tasksData = await tasksRes.json()
      const todos = tasksData?.todos || []

      const total = todos.length
      const completed = todos.filter((todo: any) => todo.completed).length
      const pending = total - completed

      setUserCount(usersData?.users?.length || 0)
      setTaskCount(total)
      setCompletedCount(completed)
      setPendingCount(pending)
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Total Users</CardTitle>
                <UsersIcon className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {loading ? "..." : userCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pending Todos</CardTitle>
                <ClipboardListIcon className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {loading ? "..." : pendingCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Completed Todos</CardTitle>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {loading ? "..." : completedCount}
                </p>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tasks Assigned</CardTitle>
                <ClipboardListIcon className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {loading ? "..." : taskCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Analytics</CardTitle>
                <BarChart3Icon className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Coming soon</p>
              </CardContent>
            </Card>
          </div>

          {userCount === 0 && !loading && (
            <div className="border rounded p-6 text-center text-muted-foreground bg-muted/40">
              <p className="text-base">No users found.</p>
              <p className="text-sm text-muted mt-1">User data will appear here once users register and are approved.</p>
            </div>
          )}

          {taskCount === 0 && !loading && (
            <div className="border rounded p-6 text-center text-muted-foreground bg-muted/40">
              <p className="text-base">No tasks created yet.</p>
              <p className="text-sm text-muted mt-1">Once tasks are assigned, they will be shown here.</p>
            </div>
          )}
        </div>
      </SidebarInset>
    </>
  )
}
