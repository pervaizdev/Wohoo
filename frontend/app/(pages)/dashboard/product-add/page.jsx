"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
// ⚠️ Make sure this path casing matches your project: "apis" vs "Apis"
import { productAPI } from "../../../apis/product";

export default function AddProductPage() {
  const [image, setImage] = useState(null);
  const [sub, setSub] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sizesCsv, setSizesCsv] = useState(""); // e.g., "S, M, L"

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    if (!image || !title.trim() || price === "" || !description.trim()) {
      setErrorMsg("Please add an image and fill title, price, and description.");
      return;
    }

    const fd = new FormData();
    fd.append("image", image);                 // matches upload.single("image")
    if (sub.trim()) fd.append("sub", sub.trim());
    fd.append("title", title.trim());
    fd.append("price", String(price));
    fd.append("description", description.trim());
    if (sizesCsv.trim()) fd.append("sizes", sizesCsv.trim()); // backend will parse CSV/JSON

    setLoading(true);
    try {
      const payload = await productAPI.create(fd);
      if (!payload?.success) throw new Error(payload?.message || "Failed");

      toast.success(payload?.message || "Product created");

      // reset
      setImage(null);
      setSub("");
      setTitle("");
      setPrice("");
      setDescription("");
      setSizesCsv("");
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar / breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Add Product</h1>
            <p className="text-sm text-gray-500">Upload an image and fill product details.</p>
          </div>
          <Link href="/dashboard/most-sales" className="text-sm rounded-md border px-3 py-2 hover:bg-gray-50">
            View All
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Form card */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image uploader */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Image</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`relative flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition
                  ${isDragging ? "border-sky-500 bg-sky-50" : "border-gray-300 hover:border-gray-400"}`}
              >
                {!image ? (
                  <>
                    <p className="text-sm text-gray-700">
                      Drag & drop an image here, or{" "}
                      <span className="text-sky-600 underline">browse</span>
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
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-hidden="true"
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
                placeholder="e.g., 'Summer Collection'"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                maxLength={100}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="Product title"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                maxLength={120}
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                placeholder="Describe the product"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                rows={4}
                required
              />
            </div>

            {/* Sizes CSV */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Sizes (comma-separated)</label>
              <input
                type="text"
                value={sizesCsv}
                onChange={(e) => setSizesCsv(e.target.value)}
                disabled={loading}
                placeholder="S, M, L, XL"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/dashboard/most-sales" className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
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
                {loading ? "Uploading…" : "Add Product"}
              </button>
            </div>
          </form>
        </div>

        {/* Live preview card */}
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
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 text-white">
                <div className="text-lg font-semibold leading-tight">
                  {title || "Product title"}
                </div>
                <div className="mt-1 text-xs text-gray-100 line-clamp-2">
                  {description || "Short description preview…"}
                </div>
                <button className="mt-3 inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white">
                  {sub || "Category"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
