import { Request, Response } from "express";
import { TransactionRepository } from "../repositories/transaction.repository";
import { generatePresignedUrl } from "../utils/s3.utils";

// ── Helper: attach presigned URL ────────────────────────────
const attachPresignedUrl = async (item: any) => {
  // Presign payment proof
  if (item?.payment_proof) {
    item.payment_proof = await generatePresignedUrl(item.payment_proof);
  }

  // Presign nested items → product.image_url
  if (item?.items?.length) {
    for (const txItem of item.items) {
      if (txItem?.product?.image_url) {
        txItem.product.image_url = await generatePresignedUrl(
          txItem.product.image_url
        );
      }
    }
  }

  return item;
};

// ── CREATE ──────────────────────────────────────────────────
export const createTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactionData = req.body;

    if (req.file) {
      transactionData.payment_proof = (req.file as any).location;
    }

    if (typeof transactionData.items === "string") {
      try {
        transactionData.items = JSON.parse(transactionData.items);
      } catch {
        res.status(400).json({ message: "Invalid format for items" });
        return;
      }
    }

    const transaction = await TransactionRepository.create(transactionData);
    res.status(201).json(await attachPresignedUrl(transaction));
  } catch (err: any) {
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
    const transactionsWithUrls = await Promise.all(
      transactions.map(attachPresignedUrl)
    );
    res.status(200).json(transactionsWithUrls);
  } catch (err) {
    res.status(500).json({ message: "Error getting transactions", err });
  }
};

// ── GET BY ID ───────────────────────────────────────────────
export const getTransactionById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const transaction = await TransactionRepository.findById(req.params.id);

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json(await attachPresignedUrl(transaction));
  } catch (err) {
    res.status(500).json({ message: "Error getting transaction", err });
  }
};

// ── UPDATE STATUS ───────────────────────────────────────────
export const updateTransaction = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;

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

    res.status(200).json(await attachPresignedUrl(transaction));
  } catch (err: any) {
    if (err.message?.includes("Insufficient stock")) {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: "Error updating transaction status", err });
  }
};