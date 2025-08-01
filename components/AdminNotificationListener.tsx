'use client'

import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher/client'
import { toast } from 'sonner'

export function AdminNotificationListener() {
    useEffect(() => {
        console.log('🔔 Subscribing to admin-channel')
        const channel = pusherClient.subscribe('admin-channel')

        channel.bind('task-completed', (data: any) => {
            console.log('📢 Task Completed:', data)

            toast.success(`Task #${data.todoId} completed: ${data.message}`, {
                duration: 5000,
                action: {
                    label: 'View Task',
                    onClick: () => {
                        window.location.href = `/admin/task/${data.todoId}`
                    },
                },
            })
            // Show toast, update UI, etc.
        })

        return () => {
            channel.unbind_all()
            channel.unsubscribe()
        }
    }, [])

    return null
}
