import { Request, Response } from "express";
import {ProductRepository} from "../repositories/product.repository";

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productData = req.body;
    if (req.file) {
      productData.image_url = req.file.path;
    }
    const product = await ProductRepository.create(productData);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", err });
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const products = await ProductRepository.findAll()
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error getting products", err });
  }
};

export const getProductById = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const product = await ProductRepository.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error getting product", err });
  }
};

export const updateProduct = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const productData = req.body;
    if (req.file) {
      productData.imageUrl = req.file.path;
    }
    const product = await ProductRepository.update(
      req.params.id,
      productData,
    );
    if (!product) {
      res.status(400).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error updating product", err });
  }
};

export const deleteProduct = async (
  req: Request<{id: string}>,
  res: Response,
): Promise<void> => {
  try {
    const product = await ProductRepository.delete(req.params.id);
    if (!product) {
      res.status(400).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", err });
  }
};
