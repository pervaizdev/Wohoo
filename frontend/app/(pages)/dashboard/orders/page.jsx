// app/admin/orders/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { orderAPI } from "../../../apis/order"; // adjust path if needed

const STATUSES = ["created", "confirmed", "packed", "shipped", "delivered", "canceled"];

const PKR = (n) =>
  (typeof n === "number" ? n : Number(n || 0)).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q.trim()) p.set("q", q.trim());
    p.set("page", String(page));
    p.set("limit", String(limit));
    return p.toString();
  }, [status, q, page, limit]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await orderAPI.listOrders(qs); // expects { success, orders, pagination }
      setOrders(res?.orders || []);
      setPagination(res?.pagination || null);
    } catch (e) {
      setErr(e?.message || "Failed to load orders");
      setOrders([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (async () => load())();
  }, []);

  // Page changes should fetch automatically
  useEffect(() => {
    if (orders !== null) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const applyFilters = async () => {
    setPage(1); // reset to first page on new filters
    await load();
  };

  const changeStatus = async (id, s) => {
    try {
      await orderAPI.updateStatus(id, s);
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin · Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          className="border rounded px-3 py-2 min-w-[220px]"
          placeholder="Search by orderNo or _id…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />

        <button
          onClick={applyFilters}
          className="px-3 py-2 rounded bg-black text-white"
        >
          Filter
        </button>

        {(status || q) && (
          <button
            onClick={() => {
              setStatus("");
              setQ("");
              setPage(1);
              load();
            }}
            className="px-3 py-2 rounded border"
          >
            Clear
          </button>
        )}
      </div>

      {/* Errors */}
      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

      {/* Content */}
      {loading ? (
        <div>Loading…</div>
      ) : Array.isArray(orders) && orders.length > 0 ? (
        <>
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o._id} className="border rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">#{o.orderNo}</div>
                    <div className="text-sm text-gray-500">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                    </div>
                    <div className="text-sm">{o.items?.length || 0} items</div>
                    <div className="text-xs text-gray-500 break-all">_id: {o._id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">PKR {PKR(o.total)}</div>
                    <div className="text-sm mt-1">
                      Status: <span className="font-medium">{o.status}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {/* Shipping */}
                  <div className="text-sm">
                    <div className="font-medium mb-1">Ship To</div>
                    <div>{o.shippingAddress?.fullName || "—"}</div>
                    <div>
                      {o.shippingAddress?.line1 || "—"}
                      {o.shippingAddress?.line2 ? `, ${o.shippingAddress.line2}` : ""}
                    </div>
                    <div>
                      {o.shippingAddress?.city || "—"}
                      {o.shippingAddress?.province ? `, ${o.shippingAddress.province}` : ""}
                    </div>
                    <div>
                      {o.shippingAddress?.country || "—"} {o.shippingAddress?.postalCode || ""}
                    </div>
                    <div>Phone: {o.shippingAddress?.phone || "—"}</div>
                  </div>

                  {/* Items */}
                  <div className="text-sm">
                    <div className="font-medium mb-1">Items</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(o.items || []).map((it, idx) => (
                        <li key={idx}>
                          {it.title} × {it.qty}
                          {it.size ? ` · ${it.size}` : ""} — PKR {PKR((it.price || 0) * (it.qty || 0))}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Status buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(o._id, s)}
                      className={`px-3 py-1 rounded border ${
                        o.status === s ? "bg-black text-white" : "hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between gap-3 mt-6">
              <div className="text-sm text-gray-600">
                Total: <span className="font-medium">{pagination.total}</span> · Page{" "}
                <span className="font-medium">{pagination.page}</span> of{" "}
                <span className="font-medium">{pagination.pages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 border rounded disabled:opacity-50"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-2 border rounded disabled:opacity-50"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="border rounded-xl p-6">No orders found.</div>
      )}
    </div>
  );
}
