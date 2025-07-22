import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create database connection
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "stream_overlay_db",
  ssl: false, // Disable SSL for local development
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
});

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });

// Helper function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Database connected successfully:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    console.log("✅ Database pool closed");
  } catch (error) {
    console.error("❌ Error closing database pool:", error);
  }
}

// Export pool for direct access if needed
export { pool };
