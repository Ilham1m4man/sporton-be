import pool from "../config/database";
import { IUser } from "../models/user.model";

export const UserRepository = {
  // Find user by email
  async findByEmail(email: string): Promise<IUser | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = \$1", [
      email,
    ]);
    return result.rows[0] || null;
  },

  // Find user by ID
  async findById(id: string): Promise<IUser | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = \$1", [id]);
    return result.rows[0] || null;
  },

  // Count all users
  async countUsers(): Promise<number> {
    const result = await pool.query("SELECT COUNT(*) FROM users");
    return parseInt(result.rows[0].count);
  },

  // Create new user
  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<IUser> {
    const result = await pool.query(
      `INSERT INTO users (email, hashed_pass, name)
     VALUES (\$1, \$2, \$3)
     RETURNING *`,
      [email, password, name],
    );
    return result.rows[0];
  },
};
