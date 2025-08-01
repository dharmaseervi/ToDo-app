import { parse } from "json2csv";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { todos } from "@/app/drizzle/schema";

export async function GET() {
  const todo = await db.select().from(todos);

  const csv = parse(todo); // Converts array of objects to CSV

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=todos.csv",
    },
  });
}
