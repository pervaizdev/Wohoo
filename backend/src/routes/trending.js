import express from "express";
import { upload } from "../middleware/upload.js";
import {
  createTrending,
  getAllTrending,
  getTrendingBySlug,
  updateTrendingBySlug,
  deleteTrendingBySlug,
} from "../controllers/trending.controller.js";
import { protect,requireAdmin } from "../middleware/auth.js";

const router = express.Router();


router.post("/", upload.single("image"), protect, requireAdmin, createTrending);
router.get("/", getAllTrending);
router.get("/:slug", getTrendingBySlug);                      // <-- slug
router.put("/:slug", upload.single("image"), protect, requireAdmin, updateTrendingBySlug); // <-- slug
router.delete("/:slug", protect, requireAdmin, deleteTrendingBySlug);

export default router;
