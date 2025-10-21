// controllers/feature.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Feature from "../models/feature.js";
import { publicUrl } from "../utils/publicUrl.js";
import { uniqueSlug, escapeRegex } from "../utils/slugs.js";

// resolve /uploads (adjust if needed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");

function removeFileSafe(filename) {
  if (!filename) return;
  const full = path.join(uploadsRoot, filename);
  fs.access(full, fs.constants.FOK ?? fs.constants.F_OK, (err) => {
    if (err) return; // not found
    fs.unlink(full, () => {});
  });
}

/**
 * POST /api/features
 * body: sub?, title, price, sizes? (array or "S,M,L"), description; file: image
 */
export const createFeature = async (req, res) => {
  try {
    const {
      sub = "",
      title = "",
      price,
      sizes = [],
      description = "",
    } = req.body ?? {};

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    if (!title.trim() || typeof price === "undefined" || !description.trim()) {
      removeFileSafe(req.file.filename);
      return res
        .status(400)
        .json({ success: false, message: "Title, price and description are required" });
    }
    if (Number(price) < 0) {
      removeFileSafe(req.file.filename);
      return res.status(400).json({ success: false, message: "Price must be ≥ 0" });
    }

    // duplicate title (case-insensitive)
    const exists = await Feature.exists({
      title: { $regex: `^${escapeRegex(title.trim())}$`, $options: "i" },
    });
    if (exists) {
      removeFileSafe(req.file.filename);
      return res.status(409).json({ success: false, message: "Title already exists" });
    }

    const slug = await uniqueSlug(Feature, title.trim());
    const fileUrl = publicUrl(req, req.file.filename);

    const normalizedSizes = Array.isArray(sizes)
      ? sizes
      : typeof sizes === "string"
      ? sizes.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const doc = await Feature.create({
      sub,
      title: title.trim(),
      price: Number(price),
      sizes: normalizedSizes,
      imageUrl: fileUrl,
      imageName: req.file.filename,
      description: description.trim(),
      slug,
    });

    return res.status(201).json({ success: true, message: "Feature created", data: doc });
  } catch (err) {
    console.error(err);
    if (req?.file?.filename) removeFileSafe(req.file.filename);
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ success: false, message: `Duplicate ${field}` });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/features
 */
export const getAllFeatures = async (_req, res) => {
  try {
    const items = await Feature.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/features/:slug
 */
export const getFeatureBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const doc = await Feature.findOne({
      slug: { $regex: `^${escapeRegex(slug)}$`, $options: "i" },
    });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Invalid slug" });
  }
};

/**
 * PUT /api/features/:slug
 * body: sub?, title?, price?, sizes?, description?; file?: image
 */
export const updateFeatureBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const doc = await Feature.findOne({
      slug: { $regex: `^${escapeRegex(slug)}$`, $options: "i" },
    });
    if (!doc) {
      if (req?.file?.filename) removeFileSafe(req.file.filename);
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const { sub, title, price, sizes, description } = req.body ?? {};

    if (typeof title === "string" && title.trim()) {
      const trimmed = title.trim();
      const exists = await Feature.exists({
        _id: { $ne: doc._id },
        title: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
      });
      if (exists) {
        if (req?.file?.filename) removeFileSafe(req.file.filename);
        return res.status(409).json({ success: false, message: "Title already exists" });
      }
      doc.title = trimmed;
      doc.slug = await uniqueSlug(Feature, trimmed, String(doc._id));
    }

    if (typeof sub === "string") doc.sub = sub;
    if (typeof description === "string") doc.description = description.trim();
    if (typeof price !== "undefined") {
      const p = Number(price);
      if (Number.isNaN(p) || p < 0) {
        if (req?.file?.filename) removeFileSafe(req.file.filename);
        return res.status(400).json({ success: false, message: "Price must be a number ≥ 0" });
      }
      doc.price = p;
    }
    if (typeof sizes !== "undefined") {
      doc.sizes = Array.isArray(sizes)
        ? sizes
        : typeof sizes === "string"
        ? sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }

    if (req.file) {
      // replace image
      removeFileSafe(doc.imageName);
      doc.imageName = req.file.filename;
      doc.imageUrl = publicUrl(req, req.file.filename);
    }

    await doc.save();
    return res.json({ success: true, message: "Feature updated", data: doc });
  } catch (err) {
    console.error(err);
    if (req?.file?.filename) removeFileSafe(req.file.filename);
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ success: false, message: `Duplicate ${field}` });
    }
    return res.status(500).json({ success: false, message: "Failed to update feature" });
  }
};

/**
 * DELETE /api/features/:slug
 */
export const deleteFeatureBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const doc = await Feature.findOneAndDelete({
      slug: { $regex: `^${escapeRegex(slug)}$`, $options: "i" },
    });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    removeFileSafe(doc.imageName);
    return res.json({ success: true, message: "Feature deleted" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Failed to delete feature" });
  }
};
    