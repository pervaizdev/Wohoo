"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mostSalesAPI} from "../../../../apis/mostsale";
import toast from "react-hot-toast";

export default function EditTrendingPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [btnText, setBtnText] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await mostSalesAPI.detail(slug);
        const item = res?.data;
        setHeading(item?.heading || "");
        setSubheading(item?.subheading || "");
        setBtnText(item?.btnText || "");
        setPreviewUrl(item?.imageUrl || "");
      } catch (err) {
        const msg = err?.message || "Failed to load item";
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
      if (heading) fd.append("heading", heading);
      if (subheading) fd.append("subheading", subheading);
      if (btnText) fd.append("btnText", btnText);
      if (imageFile) fd.append("image", imageFile);

      toast.loading("Updating item...");
      await mostSalesAPI.update(slug, fd);

      toast.dismiss();
      toast.success("Trending item updated successfully!");
      router.push("/dashboard/most-sales");
    } catch (err) {
      toast.dismiss();
      toast.error(err?.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[400px] text-gray-600">
        Loading…
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit Trending Item</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image
          </label>
            {previewUrl && (
            <div className="relative w-full max-w-md h-56 mb-3 bg-gray-100 rounded overflow-hidden">
              <img
                src={
                  previewUrl.startsWith("http")
                    ? previewUrl
                    : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${previewUrl}`
                }
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

        {/* Heading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heading
          </label>
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Heading"
            required
          />
        </div>

        {/* Subheading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subheading
          </label>
          <input
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Subheading"
            required
          />
        </div>

        {/* Button Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button Text
          </label>
          <input
            value={btnText}
            onChange={(e) => setBtnText(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Shop Now"
            required
          />
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
