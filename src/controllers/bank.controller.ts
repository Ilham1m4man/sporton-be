import { Request, Response } from "express";
import { BankRepository } from "../repositories/bank.repository";

export const createBank = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bankData = req.body;
    const bank = await BankRepository.create(bankData);
    res.status(201).json(bank);
  } catch (err) {
    res.status(500).json({ message: "Error creating Bank!", err });
  }
};

export const getBanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const banks = await BankRepository.findAll();
    res.status(200).json(banks);
  } catch (err) {
    res.status(500).json({ message: "Error getting Banks", err });
  }
};

export const updateBank = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const bankData = req.body;
    const bank = await BankRepository.update(req.params.id, bankData);
    if (!bank) {
      res.status(404).json({ message: "Bank not found" });
    }
    res.status(200).json(bank);
  } catch (err) {
    res.status(500).json({ message: "Error updating Bank!", err });
  }
};

export const deleteBank = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const bank = await BankRepository.delete(req.params.id);
    if (!bank) {
      res.status(404).json({ message: "Bank not found" });
    }
    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting Bank!", err });
  }
};
