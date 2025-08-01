import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { eq, inArray } from "drizzle-orm";
import { todos } from "@/app/drizzle/schema";

export async function PUT(req: NextRequest) {
    const { ids, completed } = await req.json();

    try {
        await db
            .update(todos)
            .set({ completed })
            .where(inArray(todos.id, ids));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Bulk update error:", err);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
