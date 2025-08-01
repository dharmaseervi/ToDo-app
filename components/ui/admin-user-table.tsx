"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: number
  email: string
  role: string
  approved: boolean
  created_at: string
}

export default function AdminUserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      console.log("Fetched users:", data)

      setUsers(data.users)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateApproval = async (id: number, approved: boolean) => {
    const endpoint = approved
      ? `/api/admin/users/${id}/approve`
      : `/api/admin/users/${id}/reject`

    try {
      await fetch(endpoint, { method: "POST" })
      fetchUsers()
    } catch (err) {
      console.error("Failed to update approval:", err)
    }
  }

  const skeletonRows = Array.from({ length: 4 })

  return (
    <div className="px-6 py-4">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? skeletonRows.map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            : users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.approved ? "Approved" : "Pending"}</TableCell>
                  <TableCell>
                    {user.approved ? (
                      <Button variant="destructive" onClick={() => updateApproval(user.id, false)}>
                        Reject
                      </Button>
                    ) : (
                      <Button onClick={() => updateApproval(user.id, true)}>Approve</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
