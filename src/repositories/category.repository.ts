import pool from "../config/database";
import { ICategory, ICategoryDTO } from "../models/category.model";

export const CategoryRepository = {
  // ── CREATE ────────────────────────────────────────────
  async create(data: ICategoryDTO): Promise<ICategory> {
    const query = `
      INSERT INTO categories (name, description, image_url)
      VALUES (\$1, \$2, \$3)
      RETURNING *;
    `;
    const values = [data.name, data.description, data.image_url];
    const { rows } = await pool.query<ICategory>(query, values);
    return rows[0];
  },

  // ── FIND ALL (sorted by created_at DESC) ──────────────
  async findAll(): Promise<ICategory[]> {
    const query = `
      SELECT * FROM categories
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query<ICategory>(query);
    return rows;
  },

  // ── FIND BY ID ────────────────────────────────────────
  async findById(id: string): Promise<ICategory | null> {
    const query = `
      SELECT * FROM categories
      WHERE id = \$1;
    `;
    const { rows } = await pool.query<ICategory>(query, [id]);
    return rows[0] || null;
  },

  // ── UPDATE ────────────────────────────────────────────
  async update(
    id: string,
    data: Partial<ICategoryDTO>,
  ): Promise<ICategory | null> {
    // Bangun dynamic SET clause
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = \$${paramIndex++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = \$${paramIndex++}`);
      values.push(data.description);
    }
    if (data.image_url !== undefined) {
      fields.push(`image_url = \$${paramIndex++}`);
      values.push(data.image_url);
    }

    // Selalu update updated_at
    fields.push(`updated_at = now()`);

    if (fields.length === 1) {
      // Tidak ada field yang diupdate selain updated_at
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE categories
      SET ${fields.join(", ")}
      WHERE id = \$${paramIndex}
      RETURNING *;
    `;

    const { rows } = await pool.query<ICategory>(query, values);
    return rows[0] || null;
  },

  // ── DELETE ────────────────────────────────────────────
  async delete(id: string): Promise<ICategory | null> {
    const query = `
      DELETE FROM categories
      WHERE id = \$1
      RETURNING *;
    `;
    const { rows } = await pool.query<ICategory>(query, [id]);
    return rows[0] || null;
  },
};
