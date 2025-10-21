"use client";

import React, { useEffect, useState, useCallback } from "react";
import { productAPI } from "../../../apis/product";
import { FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import toast from "react-hot-toast";

const LIMIT = 9;

const AdminMostSalesProducts = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (nextPage = page) => {
    try {
      setLoading(true);
      setError("");

      // Expecting backend: GET /api/products?page=X&limit=9
      const payload = await productAPI.list({ page: nextPage, limit: LIMIT });
      // payload shape: { success, data: [...], pagination: {...} }
      const data = Array.isArray(payload?.data) ? payload.data : payload?.data?.data || [];
      const meta = payload?.pagination || payload?.data?.pagination || {};

      setItems(data);
      setPage(meta.page ?? nextPage);
      setTotalPages(meta.totalPages ?? 1);
      setTotal(meta.total ?? data.length);
    } catch (err) {
      setError(err?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load(1);
  }, [load]);

  const confirmDelete = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await productAPI.remove(selectedItem.slug);
      toast.success(`Deleted "${selectedItem.title}"`);

      // If we just deleted the last item on a non-first page, step back a page
      if (items.length === 1 && page > 1) {
        await load(page - 1);
      } else {
        await load(page);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to delete item");
    } finally {
      setShowModal(false);
      setDeleting(false);
      setSelectedItem(null);
    }
  };

  const goPrev = () => page > 1 && load(page - 1);
  const goNext = () => page < totalPages && load(page + 1);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">
            Showing page {page} of {totalPages} — total {total} item{total === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/dashboard/product-add">
          <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded transition">
            Add Product
          </button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => load(page)}
            className="ml-4 text-sm px-3 py-1 rounded border border-red-300 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="p-6 flex justify-center items-center h-[300px]">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="h-5 w-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
            <span>Loading products…</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500 bg-white">
          <p className="text-lg mb-2">No products found.</p>
          <p className="mb-4">Click “Add Product” to create your first item.</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.slug || item._id}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
              >
                <div className="h-60 w-full overflow-hidden bg-gray-100 relative">
                  <img
                    src={item?.imageUrl}
                    alt={item?.title}
                    className="object-contain w-full h-full"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Link href={`/dashboard/product-edit/${item.slug}`}>
                      <button
                        title="Edit"
                        className="p-2 bg-white/80 hover:bg-blue-100 rounded-full border border-gray-200 transition"
                      >
                        <FaEdit className="h-5 w-5 text-blue-600" />
                      </button>
                    </Link>
                    <button
                      title="Delete"
                      onClick={() => confirmDelete(item)}
                      className="p-2 bg-white/80 hover:bg-red-100 rounded-full border border-gray-200 transition"
                    >
                      <FaTrash className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800">{item?.title}</h2>

                  <div className="flex items-center gap-2 mt-1 mb-3">
                    <span className="text-sm text-gray-700 font-medium">
                      Rs {Number(item?.price).toLocaleString()}
                    </span>
                    {/* {item?.sub && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {item.sub}
                      </span>
                    )} */}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Slug: {item?.slug || "—"}</span>
                    <span>
                      {new Date(item?.createdAt).toLocaleDateString()}{" "}
                      {new Date(item?.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={goPrev}
              disabled={page <= 1}
              className="px-3 py-2 rounded border disabled:opacity-50 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={goNext}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded border disabled:opacity-50 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-600">“{selectedItem?.title}”</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                disabled={deleting}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMostSalesProducts;
