import express from "express";
import { upload } from "../middleware/upload.js";
import {
  createTrending,
  getAllTrending,
  getTrendingBySlug,
  updateTrendingBySlug,
  deleteTrendingBySlug,
} from "../controllers/trending.controller.js";

const router = express.Router();


router.post("/", upload.single("image"), createTrending);
router.get("/", getAllTrending);
router.get("/:slug", getTrendingBySlug);                      // <-- slug
router.put("/:slug", upload.single("image"), updateTrendingBySlug); // <-- slug
router.delete("/:slug", deleteTrendingBySlug);   

export default router;
