import pool from "../config/database";
import {
  IProduct,
  IProductWithCategory,
  IProductInput,
} from "../models/product.model";

export const ProductRepository = {
  // ── CREATE ────────────────────────────────────────────
  async create(data: IProductInput): Promise<IProduct> {
    const query = `
      INSERT INTO products (category_id, name, description, image_url, stock, price)
      VALUES (\$1, \$2, \$3, \$4, COALESCE(\$5, 0), \$6)
      RETURNING *;
    `;
    const values = [
      data.category_id,
      data.name,
      data.description,
      data.image_url,
      data.stock ?? null, // Kalau undefined → NULL → COALESCE ke DEFAULT 0
      data.price,
    ];
    const { rows } = await pool.query<IProduct>(query, values);
    return rows[0];
  },

  // ── FIND ALL (with category) ──────────────────────────
  async findAll(): Promise<IProductWithCategory[]> {
    const query = `
      SELECT
        p.id,
        p.category_id,
        p.name,
        p.description,
        p.image_url,
        p.stock,
        p.price,
        p.created_at,
        p.updated_at,
        json_build_object(
          'id',          c.id,
          'name',        c.name,
          'description', c.description,
          'image_url',   c.image_url,
          'created_at',  c.created_at,
          'updated_at',  c.updated_at
        ) AS category
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC;
    `;
    const { rows } = await pool.query<IProductWithCategory>(query);
    return rows;
  },

  // ── FIND BY ID (with category) ────────────────────────
  async findById(id: string): Promise<IProductWithCategory | null> {
    const query = `
      SELECT
        p.id,
        p.category_id,
        p.name,
        p.description,
        p.image_url,
        p.stock,
        p.price,
        p.created_at,
        p.updated_at,
        json_build_object(
          'id',          c.id,
          'name',        c.name,
          'description', c.description,
          'image_url',   c.image_url,
          'created_at',  c.created_at,
          'updated_at',  c.updated_at
        ) AS category
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = \$1;
    `;
    const { rows } = await pool.query<IProductWithCategory>(query, [id]);
    return rows[0] || null;
  },

  // ── UPDATE (dynamic fields) ───────────────────────────
  async update(
    id: string,
    data: Partial<IProductInput>,
  ): Promise<IProduct | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.category_id !== undefined) {
      fields.push(`category_id = \$${paramIndex++}`);
      values.push(data.category_id);
    }
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
    if (data.stock !== undefined) {
      fields.push(`stock = \$${paramIndex++}`);
      values.push(data.stock);
    }
    if (data.price !== undefined) {
      fields.push(`price = \$${paramIndex++}`);
      values.push(data.price);
    }

    // Selalu update updated_at
    fields.push(`updated_at = now()`);

    if (fields.length === 1) {
      // Cuma updated_at, nothing to update
      const existing = await this.findById(id);
      return existing;
    }

    values.push(id);

    const query = `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = \$${paramIndex}
      RETURNING *;
    `;

    const { rows } = await pool.query<IProduct>(query, values);
    return rows[0] || null;
  },

  // ── DELETE ────────────────────────────────────────────
  async delete(id: string): Promise<IProduct | null> {
    const query = `
      DELETE FROM products
      WHERE id = \$1
      RETURNING *;
    `;
    const { rows } = await pool.query<IProduct>(query, [id]);
    return rows[0] || null;
  },
};
