import pool from "../config/database";
import { IBank, IBankDTO } from "../models/bank.model";

export const BankRepository = {
  async create(data: IBankDTO): Promise<IBank> {
    const query = `
            INSERT INTO banks (bank_name, account_name, account_number)
            VALUES (\$1, \$2, \$3)
            RETURNING *;
        `;
    const values = [data.bank_name, data.account_name, data.account_number];
    const { rows } = await pool.query<IBank>(query, values);
    return rows[0];
  },

  async findAll(): Promise<IBank[]> {
    const query = `
            SELECT * FROM banks
            ORDER BY created_at DESC;
        `;
    const { rows } = await pool.query<IBank>(query);
    return rows;
  },

  async findById(id: string): Promise<IBank> {
    const query = `
            SELECT * FROM banks
            WHERE id = \$1;
        `;
    const { rows } = await pool.query<IBank>(query, [id]);
    return rows[0] || null;
  },

  async update(id: string, data: Partial<IBankDTO>): Promise<IBank | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.bank_name !== undefined) {
      fields.push(`bank_name = \$${paramIndex++}`);
      values.push(data.bank_name);
    }
    if (data.account_name !== undefined) {
      fields.push(`account_name = \$${paramIndex++}`);
      values.push(data.account_name);
    }
    if (data.account_number !== undefined) {
      fields.push(`account_number = \$${paramIndex++}`);
      values.push(data.account_number);
    }

    fields.push(`updated_at = now()`);

    if (fields.length === 1) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
           UPDATE banks
           SET ${fields.join(", ")}
           WHERE id = \$${paramIndex}
           RETURNING *; 
        `;

    const { rows } = await pool.query<IBank>(query, values);
    return rows[0] || null;
  },

  async delete(id: string): Promise<IBank | null> {
    const query = `
            DELETE FROM banks
            WHERE id = \$1
            RETURNING *;
        `;
    const { rows } = await pool.query<IBank>(query, [id]);
    return rows[0] || null;
  },
};
