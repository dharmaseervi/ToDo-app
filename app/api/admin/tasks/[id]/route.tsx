import { db } from "@/lib/db";
import { todos } from "@/app/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = parseInt(params.id);
    if (isNaN(taskId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await db.delete(todos).where(eq(todos.id, taskId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
