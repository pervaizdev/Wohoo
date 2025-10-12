import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Trending from "../models/trending.js";
import { publicUrl } from "../utils/publicUrl.js";

// resolve /src/uploads (adjust if your uploads live elsewhere)
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

export const createTrending = async (req, res) => {
  try {
    const { heading = "", subheading = "", btnText = "" } = req.body ?? {};
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    if (!heading.trim() || !subheading.trim() || !btnText.trim()) {
      return res.status(400).json({ success: false, message: "All text fields are required" });
    }

    const fileUrl = publicUrl(req, req.file.filename);

    const doc = await Trending.create({
      imageUrl: fileUrl,
      imageName: req.file.filename,
      heading: heading.trim(),
      subheading: subheading.trim(),
      btnText: btnText.trim(),
    });

    return res.status(201).json({ success: true, message: "Trending item added", data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllTrending = async (_req, res) => {
  try {
    const items = await Trending.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTrendingById = async (req, res) => {
  try {
    const doc = await Trending.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
};

export const updateTrending = async (req, res) => {
  try {
    const doc = await Trending.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    const { heading, subheading, btnText } = req.body ?? {};

    // Update only provided fields
    if (typeof heading === "string" && heading.trim()) doc.heading = heading.trim();
    if (typeof subheading === "string" && subheading.trim()) doc.subheading = subheading.trim();
    if (typeof btnText === "string" && btnText.trim()) doc.btnText = btnText.trim();

    // Optional new image
    if (req.file) {
      removeFileSafe(doc.imageName);
      doc.imageName = req.file.filename;
      doc.imageUrl = publicUrl(req, req.file.filename);
    }

    await doc.save();
    return res.json({ success: true, message: "Trending item updated", data: doc });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Failed to update item" });
  }
};

export const deleteTrending = async (req, res) => {
  try {
    const doc = await Trending.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    removeFileSafe(doc.imageName);
    return res.json({ success: true, message: "Trending item deleted" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Failed to delete item" });
  }
};
