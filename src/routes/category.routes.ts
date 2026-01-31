import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controllers/category.controller";

const router = Router()

router.post("/", authenticate, upload.single("image"), createCategory)
router.get("/", getCategories)
router.get("/:id", getCategoryById)
router.put("/:id", authenticate, upload.single("image"), updateCategory)
router.delete("/:id", authenticate, deleteCategory)

export default router