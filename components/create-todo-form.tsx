"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "./ui/textarea"

interface User {
    id: number
    email: string
}

export default function CreateTodoForm() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        title: "",
        description: "",
        userId: ""
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            setUsers(data.users.filter((u: User & { approved: boolean }) => u.approved))
        } catch (err) {
            console.error("Error loading users:", err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.userId) return alert("Title and User are required")

        setLoading(true)
        try {
            const res = await fetch("/api/admin/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            if (!res.ok) throw new Error("Failed to create todo")
            setForm({ title: "", description: "", userId: "" })
            alert("Todo created successfully")
        } catch (err) {
            console.error("Create todo error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4 px-6 py-4">
            <h2 className="text-xl font-semibold mb-2">Create Task for User</h2>

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Task title"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Task details (optional)"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="user">Assign To</Label>
                <Select
                    value={form.userId}
                    onValueChange={(value) => setForm({ ...form, userId: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((user) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                                {user.email}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Task"}
            </Button>
        </form>
    )
}
