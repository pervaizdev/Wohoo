import express from "express";
import { upload } from "../middleware/upload.js";
import {
  createTrending,
  getAllTrending,
  getTrendingById,
  updateTrending,
  deleteTrending,
} from "../controllers/trending.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), createTrending);
router.get("/", getAllTrending);
router.get("/:id", getTrendingById);
router.put("/:id", upload.single("image"), updateTrending);
router.delete("/:id", deleteTrending);

export default router;
