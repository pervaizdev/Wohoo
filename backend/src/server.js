
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
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
dotenv.config();
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set("trust proxy", 1); 
const allowedHosts = new Set(["shoestops.com", "localhost"]);

function isAllowedOrigin(origin) {
  try {
    const u = new URL(origin);
    if (!/^https?:$/.test(u.protocol)) return false;
    const { hostname } = u;
    if (hostname === "shoestops.com" || hostname.endsWith(".shoestops.com"))
      return true;
    if (hostname === "localhost") return true;
    if (/\.vercel\.app$/.test(hostname)) return true;

    return false;
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); 
    if (isAllowedOrigin(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: false, 
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/most-sales", mostSalesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/product", productRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Not found" })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API listening on ${PORT}`));
