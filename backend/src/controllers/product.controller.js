import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../models/product.js";
import { publicUrl } from "../utils/publicUrl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");

function removeFileSafe(filename) {
  if (!filename) return;
  const full = path.join(uploadsRoot, filename);
  fs.access(full, fs.constants.F_OK, (err) => {
    if (err) return;
    fs.unlink(full, () => {});
  });
}

/** CREATE */
export const createProduct = async (req, res) => {
  try {
    const { sub = "", title = "", price, description = "", sizes, isBestSelling } = req.body ?? {};

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    if (!title.trim() || typeof price === "undefined" || !description.trim()) {
      return res.status(400).json({ success: false, message: "title, price and description are required" });
    }

    // sizes may arrive as CSV string or JSON; normalize to array
    let sizesArr = [];
    if (Array.isArray(sizes)) {
      sizesArr = sizes;
    } else if (typeof sizes === "string" && sizes.trim()) {
      // try JSON first, else fallback to CSV split
      try {
        const parsed = JSON.parse(sizes);
        sizesArr = Array.isArray(parsed) ? parsed : sizes.split(",").map((s) => s.trim()).filter(Boolean);
      } catch {
        sizesArr = sizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const fileUrl = publicUrl(req, req.file.filename);

    const doc = await Product.create({
      sub: sub.trim(),
      title: title.trim(),
      price: Number(price),
      sizes: sizesArr,
      imageUrl: fileUrl,
      imageName: req.file.filename,
      description: description.trim(),
      isBestSelling: typeof isBestSelling === "string"
        ? isBestSelling === "true"
        : Boolean(isBestSelling),
    });

    return res.status(201).json({ success: true, message: "Product created", data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** READ ALL (supports optional ?bestSelling=true) */
export const getAllProducts = async (req, res) => {
  try {
    const filter = {};
    if (typeof req.query.bestSelling !== "undefined") {
      filter.isBestSelling = req.query.bestSelling === "true";
    }
    const items = await Product.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** READ ONE */
export const getProductById = async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
};

/** UPDATE (partial, optional new image) */
export const updateProduct = async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });

    const { sub, title, price, description, sizes, isBestSelling } = req.body ?? {};

    if (typeof sub === "string") doc.sub = sub.trim();
    if (typeof title === "string" && title.trim()) doc.title = title.trim();
    if (typeof price !== "undefined" && !Number.isNaN(Number(price))) doc.price = Number(price);
    if (typeof description === "string" && description.trim()) doc.description = description.trim();

    // sizes normalization again
    if (typeof sizes !== "undefined") {
      if (Array.isArray(sizes)) {
        doc.sizes = sizes;
      } else if (typeof sizes === "string") {
        try {
          const parsed = JSON.parse(sizes);
          doc.sizes = Array.isArray(parsed) ? parsed : sizes.split(",").map((s) => s.trim()).filter(Boolean);
        } catch {
          doc.sizes = sizes.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    if (typeof isBestSelling !== "undefined") {
      doc.isBestSelling = typeof isBestSelling === "string"
        ? isBestSelling === "true"
        : Boolean(isBestSelling);
    }

    // If a new image uploaded, replace old
    if (req.file) {
      removeFileSafe(doc.imageName);
      doc.imageName = req.file.filename;
      doc.imageUrl = publicUrl(req, req.file.filename);
    }

    await doc.save();
    return res.json({ success: true, message: "Product updated", data: doc });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Failed to update product" });
  }
};

/** DELETE */
export const deleteProduct = async (req, res) => {
  try {
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });

    removeFileSafe(doc.imageName);
    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Failed to delete product" });
  }
};
