import { Request, Response } from "express";
import { TransactionRepository } from "../repositories/transaction.repository";

// ── CREATE ──────────────────────────────────────────────────
export const createTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactionData = req.body;

    // Handle file upload (payment proof)
    if (req.file) {
      transactionData.payment_proof = req.file.path;
    }

    // Parse items kalau dikirim sebagai string (multipart/form-data)
    if (typeof transactionData.items === "string") {
      try {
        transactionData.items = JSON.parse(transactionData.items);
      } catch {
        res.status(400).json({ message: "Invalid format for items" });
        return;
      }
    }

    const transaction = await TransactionRepository.create(transactionData);
    res.status(201).json(transaction);
  } catch (err: any) {
    // Handle product not found error
    if (err.message?.includes("not found")) {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: "Error creating transaction", err });
  }
};

// ── GET ALL ─────────────────────────────────────────────────
export const getTransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactions = await TransactionRepository.findAll();
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error getting transactions", err });
  }
};

// ── GET BY ID ───────────────────────────────────────────────
export const getTransactionById = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const transaction = await TransactionRepository.findById(req.params.id);

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error getting transaction", err });
  }
};

// ── UPDATE STATUS ───────────────────────────────────────────
export const updateTransaction = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;

    // Validate status
    if (!["pending", "paid", "rejected"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const transaction = await TransactionRepository.updateStatus(
      req.params.id,
      status,
    );

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json(transaction);
  } catch (err: any) {
    // Handle insufficient stock
    if (err.message?.includes("Insufficient stock")) {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: "Error updating transaction status", err });
  }
};