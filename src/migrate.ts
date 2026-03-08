import { Pool } from "pg";
import fs from "fs";
import path from "path";

export async function migrate(pool: Pool): Promise<void> {
  const sql = fs.readFileSync(
    path.join(process.cwd(), "migrations", "sporton.sql"),
    "utf-8"
  );

  await pool.query(sql);
  console.log("Migration done!");
}