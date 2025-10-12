import express from "express";
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);

// 🔐 New endpoints
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
