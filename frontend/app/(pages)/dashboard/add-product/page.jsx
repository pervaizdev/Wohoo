"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { productAPI } from "../../../apis/product"; // ensure this path is correct

export default function NewProductPage() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sub, setSub] = useState("");
  const [sizes, setSizes] = useState(""); // CSV like: S,M,L  (backend accepts CSV or JSON)
  const [isBestSelling, setIsBestSelling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Preview
  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  function validateAndSetFile(file) {
    setErrorMsg("");
    if (!file) return;
    if (!file.type?.startsWith("image/")) return setErrorMsg("Only image files are allowed.");
    if (file.size > 5 * 1024 * 1024) return setErrorMsg("Image must be 5MB or less.");
    setImage(file);
  }
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };
  const onSelectFile = (e) => validateAndSetFile(e.target.files?.[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!image || !title.trim() || !price || !description.trim()) {
      setErrorMsg("Please add an image and fill title, price, and description.");
      return;
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setErrorMsg("Price must be a valid non-negative number.");
      return;
    }

    const fd = new FormData();
    fd.append("image", image);
    fd.append("title", title.trim());
    fd.append("price", String(priceNum));
    fd.append("description", description.trim());
    if (sub.trim()) fd.append("sub", sub.trim());
    if (sizes.trim()) fd.append("sizes", sizes.trim()); // CSV or JSON string; backend normalizes
    fd.append("isBestSelling", isBestSelling ? "true" : "false");

    setLoading(true);
    try {
      const payload = await productAPI.create(fd); // expects { success, message, data }
      if (!payload?.success) throw new Error(payload?.message || "Failed to create product");

      toast.success(payload?.message || "Product created");

      // reset
      setImage(null);
      setTitle("");
      setPrice("");
      setDescription("");
      setSub("");
      setSizes("");
      setIsBestSelling(false);
    } catch (err) {
      toast.error(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Create Product</h1>
            <p className="text-sm text-gray-500">Add a new product to your store.</p>
          </div>
          <Link href="/products" className="text-sm rounded-md border px-3 py-2 hover:bg-gray-50">
            View All
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Form */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Image</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`relative flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition
                  ${isDragging ? "border-sky-500 bg-sky-50" : "border-gray-300 hover:border-gray-400"}`}
              >
                {!image ? (
                  <>
                    <p className="text-sm text-gray-700">
                      Drag & drop an image here, or <span className="text-sky-600 underline">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">PNG/JPG · up to 5MB</p>
                  </>
                ) : (
                  <div className="flex w-full items-center gap-4">
                    <div className="h-24 w-24 overflow-hidden rounded-lg border bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {previewUrl && <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-800 truncate">{image.name}</p>
                      <p className="text-xs text-gray-500">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="mt-2 text-xs text-red-600 hover:underline"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Title & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  placeholder="Shoes"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Price (Rs) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                  placeholder="3255"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Sub (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Sub (optional)</label>
              <input
                type="text"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                disabled={loading}
                placeholder="Trending all above"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
              />
            </div>

            {/* Sizes (CSV) */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Available Sizes (CSV)</label>
              <input
                type="text"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                disabled={loading}
                placeholder="S,M,L"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
              />
              <p className="mt-1 text-xs text-gray-500">Tip: Enter as CSV or JSON array; backend handles both.</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Description *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                placeholder="These stylish blue shoes are crafted from 100% genuine leather..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                required
              />
            </div>

            {/* isBestSelling */}
            <div className="flex items-center gap-2">
              <input
                id="best-selling"
                type="checkbox"
                checked={isBestSelling}
                onChange={(e) => setIsBestSelling(e.target.checked)}
                disabled={loading}
                className="h-4 w-4"
              />
              <label htmlFor="best-selling" className="text-sm text-gray-800">
                Mark as Best Selling (optional)
              </label>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/products" className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {loading ? "Creating…" : "Create Product"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <aside className="rounded-2xl border bg-white shadow-sm p-4 self-start">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Live Preview</h3>
          <div className="overflow-hidden rounded-xl border">
            <div className="relative h-48 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  Image preview
                </div>
              )}
              <div className="absolute inset-0 bg-black/15" />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 text-white">
                <div className="text-lg font-semibold leading-tight">
                  {title || "Product Title"}
                </div>
                <div className="mt-1 text-xs text-gray-100 line-clamp-2">
                  {description || "Product description will appear here."}
                </div>
                <button className="mt-3 inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white">
                  {isBestSelling ? "Best Seller" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
