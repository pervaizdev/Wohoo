// routes/mostsales.routes.js
import express from "express";
import {upload} from "../middleware/upload.js"; // same multer setup you use for trending
import {
  createMostSales,
  getAllMostSales,
  getMostSalesBySlug,
  updateMostSalesBySlug,
  deleteMostSalesBySlug,
} from "../controllers/mostsales.controller.js";
import { protect,requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// CRUD (slug-based)
router.post("/", upload.single("image"), protect, requireAdmin, createMostSales);
router.get("/", getAllMostSales);
router.get("/:slug", getMostSalesBySlug);
router.put("/:slug", upload.single("image"), protect, requireAdmin, updateMostSalesBySlug);
router.delete("/:slug", protect, requireAdmin, deleteMostSalesBySlug);

export default router;
