"use client";

import React, { useEffect, useState } from "react";
import { mostSalesAPI } from "../../../apis/mostsale"; // ensure path/name is correct
import { FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import toast from "react-hot-toast";

const AdminMostSalesProducts = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await mostSalesAPI.list();
      setSlides(Array.isArray(res?.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to fetch most sales products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await mostSalesAPI.delete(selectedItem.slug);
      setSlides((prev) => prev.filter((x) => x.slug !== selectedItem.slug));
      toast.success(`Deleted "${selectedItem.heading}"`);
    } catch (err) {
      toast.error(err?.message || "Failed to delete item");
    } finally {
      setShowModal(false);
      setDeleting(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header is ALWAYS visible */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Most Sales Products</h1>
        <Link href="/dashboard/most-sales-add">
          <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded transition">
            Add Most Sales Product
          </button>
        </Link>
      </div>

      {/* Error banner (still show Add button above) */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={load}
            className="ml-4 text-sm px-3 py-1 rounded border border-red-300 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-6 flex justify-center items-center h-[300px]">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="h-5 w-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
            <span>Loading most sales products…</span>
          </div>
        </div>
      ) : (
        <>
          {/* Grid or Empty State */}
          {slides.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500 bg-white">
              <p className="text-lg mb-2">No products yet.</p>
              <p className="mb-4">Click the button above to add your first Most Sales product.</p>
            
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((item) => (
                <div
                  key={item.slug}
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
                >
                  <div className="h-60 w-full overflow-hidden bg-gray-100 relative">
                    <img
                      src={item?.imageUrl}
                      alt={item?.heading}
                      className="object-contain w-full h-full"
                    />

                    <div className="absolute top-2 right-2 flex gap-2">
                      {/* Edit -> most-sales-edit */}
                      <Link href={`/dashboard/most-sales-edit/${item.slug}`}>
                        <button
                          title="Edit"
                          className="p-2 bg-white/80 hover:bg-blue-100 rounded-full border border-gray-200 transition"
                        >
                          <FaEdit className="h-5 w-5 text-blue-600" />
                        </button>
                      </Link>

                      {/* Delete */}
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
                    <h2 className="text-lg font-semibold text-gray-800">
                      {item?.heading}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      {item?.subheading}
                    </p>

                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>Button: {item?.btnText || "—"}</span>
                      <span>
                        {new Date(item?.createdAt).toLocaleDateString()}{" "}
                        {new Date(item?.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-600">
                “{selectedItem?.heading}”
              </span>
              ? This action cannot be undone.
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
