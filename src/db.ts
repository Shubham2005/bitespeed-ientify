import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🔥 Auto create table on startup
export const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Contact" (
      id SERIAL PRIMARY KEY,
      "phoneNumber" TEXT,
      email TEXT,
      "linkedId" INTEGER,
      "linkPrecedence" TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deletedAt" TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_email ON "Contact"(email);
    CREATE INDEX IF NOT EXISTS idx_phone ON "Contact"("phoneNumber");
    CREATE INDEX IF NOT EXISTS idx_linkedId ON "Contact"("linkedId");
  `);

  console.log("Database initialized");
};