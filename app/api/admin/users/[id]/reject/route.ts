import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/app/drizzle/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("Rejecting user with ID:", params.id)

  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  const { id } = params

  try {
    await db.update(users).set({ approved: false }).where(eq(users.id, id))
    return NextResponse.json({ success: true, message: "User rejected" })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to reject user" }, { status: 500 })
  }
}
