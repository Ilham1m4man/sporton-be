import { Request, Response } from "express";
import { CategoryRepository } from "../repositories/category.repository";

// ── CREATE ────────────────────────────────────────────────
export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryData = req.body;

    if (req.file) {
      categoryData.image_url = req.file.path;
    }

    const category = await CategoryRepository.create(categoryData);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Error creating category", err });
  }
};

// ── GET ALL ───────────────────────────────────────────────
export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await CategoryRepository.findAll();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", err });
  }
};

// ── GET BY ID ─────────────────────────────────────────────
export const getCategoryById = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const category = await CategoryRepository.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", err });
  }
};

// ── UPDATE ────────────────────────────────────────────────
export const updateCategory = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const categoryData = req.body;

    if (req.file) {
      categoryData.image_url = req.file.path;
    }

    const category = await CategoryRepository.update(
      req.params.id,
      categoryData,
    );

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: "Error updating category", err });
  }
};

// ── DELETE ────────────────────────────────────────────────
export const deleteCategory = async (
  req: Request<{id:string}>,
  res: Response,
): Promise<void> => {
  try {
    const category = await CategoryRepository.delete(req.params.id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", err });
  }
};
