// pages/api/admin/tasks/bulk-delete.ts

import { db } from "@/lib/db"

import { and, eq, inArray } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { todos } from "@/app/drizzle/schema"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
  }

  const { ids } = await req.json()
  if (!Array.isArray(ids)) {
    return NextResponse.json({ success: false, error: "Invalid IDs" }, { status: 400 })
  }

  await db.delete(todos).where(inArray(todos.id, ids))
  return NextResponse.json({ success: true })
}
