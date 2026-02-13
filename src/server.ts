import dotenv from "dotenv";
import app from "./app";
import pool from "./config/database";

dotenv.config();

const PORT = process.env.PORT || "5432";
pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL");
    client.release(); // Release client back to pool
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.error("Error connecting to PostgreSQL:", error));