// routes/product.routes.js
import express from "express";
import { upload } from "../middleware/upload.js";
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  updateProductBySlug,
  deleteProductBySlug,

} from "../controllers/product.controller.js";
import { protect,requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", upload.single("image"), requireAdmin, createProduct);
router.get("/", getAllProducts);

// NEW slug-based endpoints
router.get("/:slug", getProductBySlug);
router.put("/:slug", upload.single("image"), protect, requireAdmin, updateProductBySlug);
router.delete("/:slug", protect, requireAdmin, deleteProductBySlug);

// (Optional) Legacy ID routes to avoid breaking old clients:


export default router;
