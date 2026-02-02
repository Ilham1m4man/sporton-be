import { Request, Response } from "express";
import Bank from "../models/bank.model";

export const createBank = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bank = new Bank(req.body);
    await bank.save();
    res.status(201).json(bank);
  } catch (err) {
    res.status(500).json({ message: "Error creating Bank!", err });
  }
};

export const getBanks = async (req: Request, res: Response): Promise<void> => {
    try {
        const banks = await Bank.find().sort({createdAt: -1})
        res.status(200).json(banks)
    } catch (err) {
        res.status(500).json({message: "Error getting Banks", err})
    }
}

export const updateBank = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bank = await Bank.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!bank) {
        res.status(404).json({message: "Bank not found"})
    }
    res.status(200).json(bank);
  } catch (err) {
    res.status(500).json({ message: "Error updating Bank!", err });
  }
};

export const deleteBank = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bank = await Bank.findByIdAndDelete(req.params.id);
    if (!bank) {
        res.status(404).json({message: "Bank not found"})
    }
    res.status(200).json({message: "Bank deleted successfully"});
  } catch (err) {
    res.status(500).json({ message: "Error deleting Bank!", err });
  }
};