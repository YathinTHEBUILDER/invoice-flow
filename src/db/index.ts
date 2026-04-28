// / src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

// Disable prefetch/prepare for compatibility with Supabase's transaction pooler
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

