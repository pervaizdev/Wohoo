// controllers/mostSales.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import MostSales from "../models/mostsales.js"; // your model file
import { publicUrl } from "../utils/publicUrl.js";
import { uniqueSlug, escapeRegex } from "../utils/slugs.js"; // keep using same helpers

// resolve /src/uploads (adjust if uploads live elsewhere)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");

function removeFileSafe(filename) {
  if (!filename) return;
  const full = path.join(uploadsRoot, filename);
  fs.access(full, fs.constants.F_OK, (err) => {
    if (err) return; // not found
    fs.unlink(full, () => {});
  });
}

/**
 * POST /api/most-sales
 * body: { heading, subheading, btnText }, file: image
 */
export const createMostSales = async (req, res) => {
  try {
    const { heading = "", subheading = "", btnText = "" } = req.body ?? {};

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    if (!heading.trim() || !subheading.trim() || !btnText.trim()) {
      // clean up uploaded file if text invalid
      removeFileSafe(req.file.filename);
      return res.status(400).json({ success: false, message: "All text fields are required" });
    }

    // Check duplicate heading (case-insensitive)
    const exists = await MostSales.exists({
      heading: { $regex: `^${escapeRegex(heading.trim())}$`, $options: "i" },
    });
    if (exists) {
      removeFileSafe(req.file.filename);
      return res.status(409).json({ success: false, message: "Heading already exists" });
    }

    const fileUrl = publicUrl(req, req.file.filename);
    const slug = await uniqueSlug(MostSales, heading.trim());

    const doc = await MostSales.create({
      imageUrl: fileUrl,
      imageName: req.file.filename,
      heading: heading.trim(),
      subheading: subheading.trim(),
      btnText: btnText.trim(),
      slug,
    });

    return res.status(201).json({ success: true, message: "Most Sales item added", data: doc });
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
 * GET /api/most-sales
 */
export const getAllMostSales = async (_req, res) => {
  try {
    const items = await MostSales.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/most-sales/:slug
 */
export const getMostSalesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const doc = await MostSales.findOne({
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
 * PUT /api/most-sales/:slug
 * body: { heading?, subheading?, btnText? }, file?: image
 */
export const updateMostSalesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const doc = await MostSales.findOne({
      slug: { $regex: `^${escapeRegex(slug)}$`, $options: "i" },
    });
    if (!doc) {
      if (req?.file?.filename) removeFileSafe(req.file.filename);
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const { heading, subheading, btnText } = req.body ?? {};

    if (typeof heading === "string" && heading.trim()) {
      const trimmed = heading.trim();
      // duplicate heading check (excluding self)
      const exists = await MostSales.exists({
        _id: { $ne: doc._id },
        heading: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
      });
      if (exists) {
        if (req?.file?.filename) removeFileSafe(req.file.filename);
        return res.status(409).json({ success: false, message: "Heading already exists" });
      }
      doc.heading = trimmed;
      // regenerate slug keeping same _id as salt for uniqueness helper if you support it
      doc.slug = await uniqueSlug(MostSales, trimmed, String(doc._id));
    }

    if (typeof subheading === "string" && subheading.trim()) {
      doc.subheading = subheading.trim();
    }

    if (typeof btnText === "string" && btnText.trim()) {
      doc.btnText = btnText.trim();
    }

    if (req.file) {
      // replace image
      removeFileSafe(doc.imageName);
      doc.imageName = req.file.filename;
      doc.imageUrl = publicUrl(req, req.file.filename);
    }

    await doc.save();
    return res.json({ success: true, message: "Most Sales item updated", data: doc });
  } catch (err) {
    console.error(err);
    if (req?.file?.filename) removeFileSafe(req.file.filename);

    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ success: false, message: `Duplicate ${field}` });
    }
    return res.status(500).json({ success: false, message: "Failed to update item" });
  }
};

/**
 * DELETE /api/most-sales/:slug
 */
export const deleteMostSalesBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const doc = await MostSales.findOneAndDelete({
      slug: { $regex: `^${escapeRegex(slug)}$`, $options: "i" },
    });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    removeFileSafe(doc.imageName);
    return res.json({ success: true, message: "Most Sales item deleted" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Failed to delete item" });
  }
};
