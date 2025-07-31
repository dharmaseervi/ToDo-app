import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // adjust if your DB client is elsewhere

import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { todos } from "@/app/drizzle/schema";


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { completed } = await req.json();

    const result = await db
      .update(todos)
      .set({ completed })
      .where(eq(todos.id, Number(id)));

    return NextResponse.json({ success: true, updated: result });
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
