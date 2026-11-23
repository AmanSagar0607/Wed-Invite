import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/lib/db-schema";

let pool: Pool | undefined;
let client: NodePgDatabase<typeof schema> | undefined;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!pool) {
    const connectionUrl = new URL(process.env.DATABASE_URL);
    const sslMode = connectionUrl.searchParams.get("sslmode");
    if (["prefer", "require", "verify-ca"].includes(sslMode ?? "")) {
      connectionUrl.searchParams.set("sslmode", "verify-full");
    }
    pool = new Pool({ connectionString: connectionUrl.toString(), max: 5 });
    client = drizzle(pool, { schema });
  }

  return client!;
}
