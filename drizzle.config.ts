import { config } from 'dotenv';
config(); // Load .env variables

import type { Config } from "drizzle-kit";


export default {
  schema: "./app/drizzle/schema.tsx",
  out: './drizzle',
  dialect: "postgresql", // 👈 required field!
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
