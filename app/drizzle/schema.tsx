// drizzle/schema.ts
import { pgTable, serial, varchar, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).unique(),
  password: varchar("password", { length: 256 }),
  role: varchar("role", { enum: ['admin', 'user'] }),
  approved: boolean("approved").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  completed: boolean("completed").default(false),
  due_date: timestamp("due_date"),
  user_id: integer("user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
