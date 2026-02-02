import { Request, Response } from "express";
import Transaction from "../models/transaction.model";
import Product from "../models/product.model";

export const createTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactionData = req.body;
    if (req.file) {
      transactionData.paymentProof = req.file.path;
    } else {
      res.status(400).json({ message: "Payment proof is required!" });
      return;
    }

    if (typeof transactionData.purchasedItems === "string") {
      try {
        transactionData.purchasedItems = JSON.parse(
          transactionData.purchasedItems,
        );
      } catch (err) {
        res.status(400).json({ message: "Invalid format for purchasedItems" });
      }
    }

    transactionData.status = "pending";
    const transaction = new Transaction(transactionData);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error creating Transaction!", err });
  }
};

export const getTransactions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate("purchasedItems.productId");
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error getting Transactions!", err });
  }
};

export const getTransactionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "purchasedItems.productId",
    );
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found!" });
      return;
    }
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error getting Transactions!", err });
  }
};

export const updateTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {status} = req.body
    const existingTransaction = await Transaction.findById(req.params.id)
    if(!existingTransaction) {
        res.status(404).json({message: "Transaction not found!"})
        return
    }
    if (status === "paid" && existingTransaction.status !== "paid") {
        for (const item of existingTransaction.purchasedItems) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: {stock: -item.qty}
            })
        }
    }
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {status},
      { new: true },
    );
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error updating Transaction status!", err });
  }
};

/* export const deleteTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found!" });
    }
    res.status(200).json({ message: "Transaction deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting Transactions!", err });
  }
}; */
