import { Request, Response } from "express";
import { CategoryRepository } from "../repositories/category.repository";
import { deleteFromS3 } from "../middlewares/upload.middleware";
import { generatePresignedUrl } from "../utils/s3.utils";

const attachPresignedUrl = async (item: any) => {
  if (item?.image_url) {
    item.image_url = await generatePresignedUrl(item.image_url);
  }
  return item;
};

// ── CREATE ────────────────────────────────────────────────
export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryData = req.body;

    if (req.file) {
      categoryData.image_url = (req.file as any).location;
    }

    const category = await CategoryRepository.create(categoryData);
    res.status(201).json(await attachPresignedUrl(category));
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
    // Generate presigned URL untuk semua categories
    const categoriesWithUrls = await Promise.all(
      categories.map(attachPresignedUrl)
    );

    res.status(200).json(categoriesWithUrls);
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

    res.status(200).json(await attachPresignedUrl(category));
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", err });
  }
};

// ── UPDATE (dengan cleanup S3) ────────────────────────────
export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const categoryData = req.body;

    if (req.file) {
      // Hapus image lama dari S3
      const oldCategory = await CategoryRepository.findById(req.params.id);
      if (oldCategory?.image_url) {
        await deleteFromS3(oldCategory.image_url);
      }

      categoryData.image_url = (req.file as any).location;
    }

    const category = await CategoryRepository.update(req.params.id, categoryData);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json(await attachPresignedUrl(category));
  } catch (err) {
    res.status(500).json({ message: "Error updating category", err });
  }
};

// ── DELETE (dengan cleanup S3) ────────────────────────────
export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    // Ambil data dulu sebelum delete
    const oldCategory = await CategoryRepository.findById(req.params.id);

    const category = await CategoryRepository.delete(req.params.id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // Hapus image dari S3
    if (oldCategory?.image_url) {
      await deleteFromS3(oldCategory.image_url);
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", err });
  }
};