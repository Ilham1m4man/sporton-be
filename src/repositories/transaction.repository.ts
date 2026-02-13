import { PoolClient } from "pg";
import pool from "../config/database";
import {
  ITransaction,
  ITransactionWithItems,
  ITransactionInput,
} from "../models/transaction.model";

export const TransactionRepository = {
  // ── CREATE (transaction + items dalam SQL transaction) ──
  async create(data: ITransactionInput): Promise<ITransactionWithItems> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1) Insert transaction
      const txQuery = `
        INSERT INTO transactions 
          (payment_proof, total_payment, customer_name, customer_contact, customer_address)
        VALUES (\$1, \$2, \$3, \$4, \$5)
        RETURNING *;
      `;
      const txValues = [
        data.payment_proof || null,
        data.total_payment,
        data.customer_name,
        data.customer_contact,
        data.customer_address,
      ];
      const { rows: txRows } = await client.query<ITransaction>(
        txQuery,
        txValues,
      );
      const transaction = txRows[0];

      // 2) Insert transaction items + ambil price_at_purchase dari product
      const items = [];

      for (const item of data.items) {
        // Ambil harga product saat ini
        const priceQuery = `
          SELECT price FROM products WHERE id = \$1;
        `;
        const { rows: productRows } = await client.query(priceQuery, [
          item.product_id,
        ]);

        if (productRows.length === 0) {
          throw new Error(`Product with id ${item.product_id} not found`);
        }

        const priceAtPurchase = productRows[0].price;

        // Insert item
        const itemQuery = `
          INSERT INTO transaction_items 
            (transaction_id, product_id, qty, price_at_purchase)
          VALUES (\$1, \$2, \$3, \$4)
          RETURNING *;
        `;
        const itemValues = [
          transaction.id,
          item.product_id,
          item.qty,
          priceAtPurchase,
        ];
        const { rows: itemRows } = await client.query(itemQuery, itemValues);
        items.push(itemRows[0]);
      }

      await client.query("COMMIT");

      // 3) Return full transaction with items
      return this.findById(transaction.id) as Promise<ITransactionWithItems>;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // ── FIND ALL (with items + product details) ───────────
  async findAll(): Promise<ITransactionWithItems[]> {
    // 1) Ambil semua transactions
    const txQuery = `
      SELECT * FROM transactions
      ORDER BY created_at DESC;
    `;
    const { rows: transactions } = await pool.query<ITransaction>(txQuery);

    if (transactions.length === 0) return [];

    // 2) Ambil semua items sekaligus (batch) + join product
    const txIds = transactions.map((t) => t.id);

    const itemsQuery = `
      SELECT
        ti.id,
        ti.transaction_id,
        ti.product_id,
        ti.qty,
        ti.price_at_purchase,
        json_build_object(
          'id',          p.id,
          'name',        p.name,
          'description', p.description,
          'image_url',   p.image_url,
          'stock',       p.stock,
          'price',       p.price,
          'category_id', p.category_id
        ) AS product
      FROM transaction_items ti
      INNER JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = ANY(\$1);
    `;
    const { rows: allItems } = await pool.query(itemsQuery, [txIds]);

    // 3) Group items by transaction_id
    const itemsMap = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const existing = itemsMap.get(item.transaction_id) || [];
      existing.push(item);
      itemsMap.set(item.transaction_id, existing);
    }

    // 4) Merge
    return transactions.map((tx) => ({
      ...tx,
      items: itemsMap.get(tx.id) || [],
    })) as ITransactionWithItems[];
  },

  // ── FIND BY ID (with items + product details) ─────────
  async findById(id: string): Promise<ITransactionWithItems | null> {
    // 1) Ambil transaction
    const txQuery = `
      SELECT * FROM transactions WHERE id = \$1;
    `;
    const { rows: txRows } = await pool.query<ITransaction>(txQuery, [id]);

    if (txRows.length === 0) return null;

    const transaction = txRows[0];

    // 2) Ambil items + product
    const itemsQuery = `
      SELECT
        ti.id,
        ti.transaction_id,
        ti.product_id,
        ti.qty,
        ti.price_at_purchase,
        json_build_object(
          'id',          p.id,
          'name',        p.name,
          'description', p.description,
          'image_url',   p.image_url,
          'stock',       p.stock,
          'price',       p.price,
          'category_id', p.category_id
        ) AS product
      FROM transaction_items ti
      INNER JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = \$1;
    `;
    const { rows: items } = await pool.query(itemsQuery, [id]);

    return {
      ...transaction,
      items,
    } as ITransactionWithItems;
  },

  // ── UPDATE STATUS (with stock decrement on "paid") ────
  async updateStatus(
    id: string,
    status: "pending" | "paid" | "rejected",
  ): Promise<ITransactionWithItems | null> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1) Cek existing transaction
      const existingQuery = `
        SELECT * FROM transactions WHERE id = \$1 FOR UPDATE;
      `;
      const { rows: existingRows } = await client.query<ITransaction>(
        existingQuery,
        [id],
      );

      if (existingRows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      const existing = existingRows[0];

      // 2) Kalau status baru "paid" dan sebelumnya bukan "paid" → kurangi stock
      if (status === "paid" && existing.status !== "paid") {
        const itemsQuery = `
          SELECT product_id, qty FROM transaction_items
          WHERE transaction_id = \$1;
        `;
        const { rows: items } = await client.query(itemsQuery, [id]);

        for (const item of items) {
          const updateStockQuery = `
            UPDATE products
            SET stock = stock - \$1, updated_at = now()
            WHERE id = \$2 AND stock >= \$1;
          `;
          const { rowCount } = await client.query(updateStockQuery, [
            item.qty,
            item.product_id,
          ]);

          if (rowCount === 0) {
            throw new Error(
              `Insufficient stock for product ${item.product_id}`,
            );
          }
        }
      }

      // 3) Update status
      const updateQuery = `
        UPDATE transactions
        SET status = \$1, updated_at = now()
        WHERE id = \$2
        RETURNING *;
      `;
      await client.query(updateQuery, [status, id]);

      await client.query("COMMIT");

      // 4) Return full transaction
      return this.findById(id);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
