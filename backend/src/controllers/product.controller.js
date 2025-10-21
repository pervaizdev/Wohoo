// controllers/product.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/product.js";
import { publicUrl } from "../utils/publicUrl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");

// --- helpers ---
function removeFileSafe(filename) {
  if (!filename) return;
  const full = path.join(uploadsRoot, filename);
  fs.access(full, fs.constants.F_OK, (err) => {
    if (err) return;
    fs.unlink(full, () => {});
  });
}

function toSlug(input = "") {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")                  // drop quotes
    .replace(/[^a-z0-9]+/g, "-")           // non-alnum -> dash
    .replace(/^-+|-+$/g, "");              // trim dashes
}

// ensure unique slug (title-based, with -2, -3… if needed)
async function uniqueSlugForTitle(title, currentId = null) {
  const base = toSlug(title) || "product";
  let slug = base;
  let i = 1;
  // check collisions; allow same doc to keep its slug on update
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Product.findOne({ slug });
    if (!existing || (currentId && existing._id.equals(currentId))) break;
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

// -------- CREATE ----------
export const createProduct = async (req, res) => {
  try {
    const { sub = "", title = "", price, description = "", sizes, isBestSelling } = req.body ?? {};

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    if (!title.trim() || typeof price === "undefined" || !description.trim()) {
      return res.status(400).json({ success: false, message: "title, price and description are required" });
    }

    // sizes -> array
    let sizesArr = [];
    if (Array.isArray(sizes)) {
      sizesArr = sizes;
    } else if (typeof sizes === "string" && sizes.trim()) {
      try {
        const parsed = JSON.parse(sizes);
        sizesArr = Array.isArray(parsed) ? parsed : sizes.split(",").map((s) => s.trim()).filter(Boolean);
      } catch {
        sizesArr = sizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const fileUrl = publicUrl(req, req.file.filename);

    // NEW: slug
    const slug = await uniqueSlugForTitle(title);

    const doc = await Product.create({
      sub: sub.trim(),
      title: title.trim(),
      price: Number(price),
      sizes: sizesArr,
      imageUrl: fileUrl,
      imageName: req.file.filename,
      description: description.trim(),
      isBestSelling: typeof isBestSelling === "string" ? isBestSelling === "true" : Boolean(isBestSelling),
      slug,
    });

    return res.status(201).json({ success: true, message: "Product created", data: doc });
  } catch (err) {
    console.error(err);
    // handle duplicate slug edge-case
    if (err?.code === 11000 && err?.keyPattern?.slug) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------- READ ALL ----------
export const getAllProducts = async (req, res) => {
  try {
    // Parse query params
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit ?? "9", 10), 9); // max 9 items per page

    const skip = (page - 1) * limit;

    // Optional filters
    const filter = {};
    if (typeof req.query.bestSelling !== "undefined") {
      filter.isBestSelling = req.query.bestSelling === "true";
    }

    // Fetch data with pagination
    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// -------- READ ONE (by slug) ----------
export const getProductBySlug = async (req, res) => {
  try {
    const doc = await Product.findOne({ slug: req.params.slug });
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Invalid slug" });
  }
};

// -------- UPDATE (by slug) ----------
export const updateProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const doc = await Product.findOne({ slug });
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });

    const { sub, title, price, description, sizes, isBestSelling } = req.body ?? {};

    if (typeof sub === "string") doc.sub = sub.trim();
    if (typeof title === "string" && title.trim()) {
      doc.title = title.trim();
      // regenerate slug if title changed → optional behavior
      const nextSlug = await uniqueSlugForTitle(doc.title, doc._id);
      doc.slug = nextSlug;
    }
    if (typeof price !== "undefined" && !Number.isNaN(Number(price))) doc.price = Number(price);
    if (typeof description === "string" && description.trim()) doc.description = description.trim();

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
      doc.isBestSelling = typeof isBestSelling === "string" ? isBestSelling === "true" : Boolean(isBestSelling);
    }

    // New image?
    if (req.file) {
      removeFileSafe(doc.imageName);
      doc.imageName = req.file.filename;
      doc.imageUrl = publicUrl(req, req.file.filename);
    }

    await doc.save();
    return res.json({ success: true, message: "Product updated", data: doc });
  } catch (err) {
    console.error(err);
    if (err?.code === 11000 && err?.keyPattern?.slug) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }
    return res.status(400).json({ success: false, message: "Failed to update product" });
  }
};

// -------- DELETE (by slug) ----------
export const deleteProductBySlug = async (req, res) => {
  try {
    const doc = await Product.findOneAndDelete({ slug: req.params.slug });
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });

    removeFileSafe(doc.imageName);
    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: "Failed to delete product" });
  }
};

// ---------- (Optional) Legacy ID handlers to avoid breaking old clients ----------
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

export const updateProductById = async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });

    const { sub, title, price, description, sizes, isBestSelling } = req.body ?? {};
    if (typeof sub === "string") doc.sub = sub.trim();
    if (typeof title === "string" && title.trim()) {
      doc.title = title.trim();
      doc.slug = await uniqueSlugForTitle(doc.title, doc._id); // keep slugs consistent even via legacy route
    }
    if (typeof price !== "undefined" && !Number.isNaN(Number(price))) doc.price = Number(price);
    if (typeof description === "string" && description.trim()) doc.description = description.trim();

    if (typeof sizes !== "undefined") {
      if (Array.isArray(sizes)) doc.sizes = sizes;
      else if (typeof sizes === "string") {
        try {
          const parsed = JSON.parse(sizes);
          doc.sizes = Array.isArray(parsed) ? parsed : sizes.split(",").map((s) => s.trim()).filter(Boolean);
        } catch {
          doc.sizes = sizes.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    if (typeof isBestSelling !== "undefined") {
      doc.isBestSelling = typeof isBestSelling === "string" ? isBestSelling === "true" : Boolean(isBestSelling);
    }

    if (req.file) {
      removeFileSafe(doc.imageName);
      doc.imageName = req.file.filename;
      doc.imageUrl = publicUrl(req, req.file.filename);
    }

    await doc.save();
    return res.json({ success: true, message: "Product updated", data: doc });
  } catch (err) {
    console.error(err);
    if (err?.code === 11000 && err?.keyPattern?.slug) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }
    return res.status(400).json({ success: false, message: "Failed to update product" });
  }
};

export const deleteProductById = async (req, res) => {
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
