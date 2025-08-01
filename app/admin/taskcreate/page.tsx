'use client'
import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronDown } from "lucide-react"
import { SidebarTrigger } from '@/components/ui/sidebar'
interface User {
    id: number
    email: string
}
function CreateQuickTask() {

    const [users, setUsers] = useState<User[]>([])
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [assignedTo, setAssignedTo] = useState("")
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
    const [userPopoverOpen, setUserPopoverOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<number | undefined>(undefined)
    console.log(dueDate);


    useEffect(() => {
        fetchUsers()
    }, [])


    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            console.log(data, 'users');
            setUsers(data.users)
        } catch (err) {
            console.error("Failed to fetch users:", err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await fetch("/api/admin/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    assignedTo,
                    userId,
                    dueDate: dueDate,
                }),
            })
            setTitle("")
            setDescription("")
            setAssignedTo("")
            setDueDate(undefined)
            fetchUsers()
        } catch (err) {
            console.error("Failed to create task:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <SidebarTrigger className="-ml-1" />
            <h2 className="text-xl font-semibold mb-4">Create Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <Input
                    type="text"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <Textarea
                    placeholder="Task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* User dropdown */}
                {/* User dropdown with popover */}
                <div>
                    <label className="text-sm font-medium mb-1 block">Assign to</label>
                    <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                            >
                                {assignedTo || "Select user"}
                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-max-full p-0">
                            <Command className="w-full">
                                <CommandInput placeholder="Search user..." />
                                <CommandList className="">
                                    {users?.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            onSelect={() => {
                                                setAssignedTo(user.email)
                                                setUserId(user.id)
                                                setUserPopoverOpen(false) // close on select
                                            }}
                                        >
                                            {user.email}
                                        </CommandItem>
                                    ))}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {assignedTo && (
                        <p className="text-xs mt-1 text-muted-foreground">Selected: {assignedTo}</p>
                    )}
                </div>


                {/* Due Date Picker */}
                <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium">Due Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left", !dueDate && "text-muted-foreground")}>
                                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={setDueDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Task"}
                </Button>
            </form>

        </div>
    )
}

export default CreateQuickTask
