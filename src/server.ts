import dotenv from "dotenv";
import app from "./app";
import pool from "./config/database";
import { migrate } from "./migrate";

dotenv.config();

const PORT = process.env.PORT || "3000";
pool
  .connect()
  .then(async (client) => {
    console.log("Connected to PostgreSQL");
    client.release(); // Release client back to pool
    await migrate(pool);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.error("Error connecting to PostgreSQL:", error));