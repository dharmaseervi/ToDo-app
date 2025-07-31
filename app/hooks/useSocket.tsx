import { useEffect } from "react"
import { io } from "socket.io-client"
import { toast } from "sonner"

useEffect(() => {
    const socket = io("http://localhost:3001", {
        query: { userId: currentUserId } // must match server `socket.join(userId)`
    })

    socket.on("notify-user", (data) => {
        toast.info(data.message)
    })

    return () => {
        socket.disconnect()
    }
}, [])
