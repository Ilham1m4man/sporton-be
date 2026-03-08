import { Request, Response } from "express";
import { ProductRepository } from "../repositories/product.repository";
import { deleteFromS3 } from "../middlewares/upload.middleware";
import { generatePresignedUrl } from "../utils/s3.utils";     

// ── Helper: attach presigned URL ──────────────────────────
const attachPresignedUrl = async (item: any) => {
  // Presign product image
  if (item?.image_url) {
    item.image_url = await generatePresignedUrl(item.image_url);
  }
  // Presign nested category image juga
  if (item?.category?.image_url) {
    item.category.image_url = await generatePresignedUrl(item.category.image_url);
  }
  return item;
};

// ── CREATE ────────────────────────────────────────────────
export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productData = req.body;
    if (req.file) {
      productData.image_url = (req.file as any).location;
    }
    const product = await ProductRepository.create(productData);
    res.status(201).json(await attachPresignedUrl(product));     
  } catch (err) {
    res.status(500).json({ message: "Error creating product", err });
  }
};

// ── GET ALL ───────────────────────────────────────────────
export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const products = await ProductRepository.findAll();
    // Presign semua products
    const productsWithUrls = await Promise.all(
      products.map(attachPresignedUrl)
    );
    res.status(200).json(productsWithUrls);                      
  } catch (err) {
    res.status(500).json({ message: "Error getting products", err });
  }
};

// ── GET BY ID ─────────────────────────────────────────────
export const getProductById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const product = await ProductRepository.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json(await attachPresignedUrl(product));     
  } catch (err) {
    res.status(500).json({ message: "Error getting product", err });
  }
};

// ── UPDATE ────────────────────────────────────────────────
export const updateProduct = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const productData = req.body;
    if (req.file) {
      const oldProduct = await ProductRepository.findById(req.params.id);
      if (oldProduct?.image_url) {
        await deleteFromS3(oldProduct.image_url);
      }
      productData.image_url = (req.file as any).location;
    }
    const product = await ProductRepository.update(
      req.params.id,
      productData,
    );
    if (!product) {
      res.status(400).json({ message: "Product not found" });
      return;                                                     
    }
    res.status(200).json(await attachPresignedUrl(product));     
  } catch (err) {
    res.status(500).json({ message: "Error updating product", err });
  }
};

// ── DELETE ────────────────────────────────────────────────
export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const oldProduct = await ProductRepository.findById(req.params.id);
    const product = await ProductRepository.delete(req.params.id);
    if (!product) {
      res.status(400).json({ message: "Product not found" });
      return;
    }
    if (oldProduct?.image_url) {
      await deleteFromS3(oldProduct.image_url);
    }
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", err });
  }
};