"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { trendingAPI } from "../../../Apis/trending";

export default function AddTrendingPage() {
  const [image, setImage] = useState(null);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [btnText, setBtnText] = useState("");
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

    if (!image || !heading.trim() || !subheading.trim() || !btnText.trim()) {
      setErrorMsg("Please add an image and fill all fields.");
      return;
    }

    const fd = new FormData();
    fd.append("image", image);
    fd.append("heading", heading.trim());
    fd.append("subheading", subheading.trim());
    fd.append("btnText", btnText.trim());

    setLoading(true);
    try {
      const payload = await trendingAPI.create(fd);
      if (!payload?.success) throw new Error(payload?.message || "Failed");

      const { message } = payload;
      toast.success(message || "Trending item added");

      // reset
      setImage(null);
      setHeading("");
      setSubheading("");
      setBtnText("");
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
            <h1 className="text-xl font-semibold text-gray-900">Add Trending Item</h1>
            <p className="text-sm text-gray-500">Upload an image and content for the homepage banner.</p>
          </div>
          <Link href="/dashboard/trending-product" className="text-sm rounded-md border px-3 py-2 hover:bg-gray-50">
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

                {/* The input covers the dropzone, so it alone handles the click.
                    We REMOVED wrapper onClick to avoid double dialogs. */}
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

            {/* Heading */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                disabled={loading}
                placeholder="New Arrivals!"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                maxLength={100}
                required
              />
              <p className="mt-1 text-xs text-gray-500">{heading.length}/100</p>
            </div>

            {/* Subheading */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Subheading</label>
              <textarea
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                disabled={loading}
                placeholder="Fresh styles for your wardrobe"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                rows={3}
                maxLength={180}
                required
              />
              <p className="mt-1 text-xs text-gray-500">{subheading.length}/180</p>
            </div>

            {/* Button text */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Button Text</label>
              <input
                type="text"
                value={btnText}
                onChange={(e) => setBtnText(e.target.value)}
                disabled={loading}
                placeholder="Shop Now"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                maxLength={24}
                required
              />
              <p className="mt-1 text-xs text-gray-500">{btnText.length}/24</p>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/trending" className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
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
                {loading ? "Uploading…" : "Add Trending"}
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
                  {heading || "Your heading goes here"}
                </div>
                <div className="mt-1 text-xs text-gray-100 line-clamp-2">
                  {subheading || "A short descriptive subheading appears here."}
                </div>
                <button className="mt-3 inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white">
                  {btnText || "Button"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
