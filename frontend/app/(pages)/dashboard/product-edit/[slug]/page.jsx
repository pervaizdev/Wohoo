"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productAPI } from "../../../../apis/product";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sizesCsv, setSizesCsv] = useState("");
  const [isBestSelling, setIsBestSelling] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await productAPI.detail(slug);
        const item = res?.data?.data || res?.data;

        setTitle(item?.title || "");
        setPrice(item?.price != null ? String(item.price) : "");
        setDescription(item?.description || "");
        setIsBestSelling(Boolean(item?.isBestSelling));
        setPreviewUrl(item?.imageUrl || "");

        const arr = Array.isArray(item?.sizes) ? item.sizes : [];
        setSizesCsv(arr.join(", "));
      } catch (err) {
        const msg = err?.message || "Failed to load product";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const onImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      if (title) fd.append("title", title);
      if (price !== "") fd.append("price", price);
      if (description) fd.append("description", description);
      if (sizesCsv) fd.append("sizes", sizesCsv);
      fd.append("isBestSelling", String(isBestSelling));
      if (imageFile) fd.append("image", imageFile);

      toast.loading("Updating product…");
      await productAPI.update(slug, fd);
      toast.dismiss();
      toast.success("Product updated successfully!");
      router.push("/dashboard/most-sales");
    } catch (err) {
      toast.dismiss();
      toast.error(err?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 flex items-center justify-center h-[400px] text-gray-600">
        Loading…
      </div>
    );

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
          {previewUrl && (
            <div className="relative w-full max-w-md h-56 mb-3 bg-gray-100 rounded overflow-hidden">
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="block"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to keep current image.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Product title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 min-h-28"
            placeholder="Describe the product"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sizes (comma-separated)
          </label>
          <input
            value={sizesCsv}
            onChange={(e) => setSizesCsv(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="S, M, L, XL"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="bestSelling"
            type="checkbox"
            checked={isBestSelling}
            onChange={(e) => setIsBestSelling(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="bestSelling" className="text-sm text-gray-700">
            Mark as Best-Selling
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/most-sales")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
