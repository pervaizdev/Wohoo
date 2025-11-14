"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FaShoppingCart } from "react-icons/fa";
import { productAPI } from "../../../apis/product"; // adjust if needed
import { cartAPI } from "../../../apis/cart";       // ✅ add this
import toast from "react-hot-toast";                // ✅ assumes you have <Toaster /> in root

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slugRaw = params?.slug;
  const slug = Array.isArray(slugRaw) ? slugRaw[0] : slugRaw;

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await productAPI.detail(encodeURIComponent(slug));
        const item = res?.data?.data || res?.data || res;
        setProduct(item);
        // If product has sizes, you can optionally preselect the first
        if (item?.sizes?.length) setSelectedSize(item.sizes[0]);
      } catch (e) {
        setError(e?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleAddToCart = async () => {
    // 1) Auth check (assumes JWT stored in localStorage.token)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    // 2) Validate size if product has sizes
    if (product?.sizes?.length && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // 3) Call API
    try {
      setAdding(true);
      await cartAPI.addItem({
        slug,
        qty: quantity,
        size: selectedSize || "",
      });
      toast.success("Added to cart");
      // Optional: navigate to /cart
      // router.push("/cart");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to add to cart";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  if (!slug) return <div className="max-w-6xl mx-auto px-6 py-10">Resolving product…</div>;
  if (loading) return <div className="max-w-6xl mx-auto px-6 py-10">Loading…</div>;
  if (error) return <div className="max-w-6xl mx-auto px-6 py-10 text-red-600">{error}</div>;
  if (!product) return <div className="max-w-6xl mx-auto px-6 py-10">Product not found</div>;

  const { title, price, description, sizes = [], imageUrl, sub } = product;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Product Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex justify-center items-center bg-gray-100 rounded-2xl p-6">
        {imageUrl ? (
  <Image
    src={
      imageUrl.startsWith("http")
        ? imageUrl
        : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${imageUrl}`
    }
    alt={title || "Product"}
    width={300}
    height={300}
    className="object-contain hover:scale-105 transition-transform duration-500 ease-in-out"
    priority
  />
) : (
  <div className="h-[350px] grid place-items-center text-gray-500">
    No image
  </div>
)}

        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>

          <p className="text-[#3199d9] text-3xl font-bold mb-4">
            {typeof price === "number" ? `Rs ${price.toLocaleString()}` : "—"}
          </p>

          <p className="text-gray-700 text-sm leading-relaxed mb-6">{sub}</p>

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold mb-2">Select Size:</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => {
                  const active = size === selectedSize;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-md px-4 py-1 text-sm transition border 
                        ${active ? "bg-[#3199d9] text-white border-[#3199d9]" : "border-gray-300 hover:bg-gray-100"}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Quantity:</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-200 text-lg rounded hover:bg-gray-300"
              >
                –
              </button>
              <span className="font-semibold min-w-[24px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 bg-gray-200 text-lg rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex items-center gap-2 bg-[#3199d9] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-[#2784bf] transition disabled:opacity-60"
          >
            <FaShoppingCart /> {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-3">Product Description</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {description || "No description available."}
        </p>
      </div>
    </div>
  );
}
