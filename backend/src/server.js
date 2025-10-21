import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import trendingRoutes from "./routes/trending.js";
import mostSalesRoutes from "./routes/mostsales.js";
import productRoutes from "./routes/product.js";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 


app.use(cors({
  origin: [process.env.SERVER_URL, "http://localhost:3000"],
  credentials: true
}));


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/most-sales", mostSalesRoutes);
app.use("/api/product", productRoutes); 
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// (optional) 404 fallback
app.use((req, res) => res.status(404).json({ success: false, message: "Not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API listening on ${PORT}`));
