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

const router = express.Router();

// CRUD (slug-based)
router.post("/", upload.single("image"), createMostSales);
router.get("/", getAllMostSales);
router.get("/:slug", getMostSalesBySlug);
router.put("/:slug", upload.single("image"), updateMostSalesBySlug);
router.delete("/:slug", deleteMostSalesBySlug);

export default router;
