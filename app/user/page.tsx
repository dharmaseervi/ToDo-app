
'use client'
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UserHome() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
    } else if (session.user.role !== "user") {
      router.push("/unauthorized")
    }
  }, [session, status, router])

  if (status === "loading" || !session) {
    return <p className="p-4">Loading...</p>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Hello, {session.user.email}! Welcome to your User Home
      </h1>

      <div className="flex gap-4">
        <Link href="/user/todos">
          <Button variant="default">View My Tasks</Button>
        </Link>
        <Button variant="destructive" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    </div>
  )
}
