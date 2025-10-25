// app/orders/page.jsx
"use client";
import { useEffect, useState } from "react";
import { orderAPI } from "../../apis/order";
import Link from "next/link";

const PKR = (n) =>
  (typeof n === "number" ? n : Number(n || 0)).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const StatusBadge = ({ status }) => {
  const styles = {
    created: "bg-gray-100 text-gray-700",
    confirmed: "bg-blue-100 text-blue-700",
    packed: "bg-amber-100 text-amber-800",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    canceled: "bg-red-100 text-red-700",
  };
  const cls = styles[status] || styles.created;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
};

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const res = await orderAPI.getMyOrders();
        const payload = res?.data?.orders ?? res?.orders ?? [];
        // optional: sort newest first (if backend doesn't)
        payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(payload);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load orders");
        setOrders([]);
      }
    })();
  }, []);

  if (orders === null) return <div className="p-6">Loading orders…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}

      {orders.length === 0 ? (
        <div className="border rounded-xl p-6">
          No orders yet. <Link className="underline" href="/products">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="border rounded-xl p-4">
              {/* Top row: order meta + totals */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">#{o.orderNo}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <StatusBadge status={o.status} />
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-600">
                      Payment: {o.paymentMethod} ({o.paymentStatus})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    Subtotal: PKR {PKR(o.subtotal)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Shipping: PKR {PKR(o.shippingFee)}
                  </div>
                  {Number(o.discount) > 0 && (
                    <div className="text-xs text-gray-500">
                      Discount: - PKR {PKR(o.discount)}
                    </div>
                  )}
                  <div className="text-lg font-bold mt-1">
                    Total: PKR {PKR(o.total)}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mt-3 border rounded-lg divide-y">
                {o.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{it.title}</div>
                      <div className="text-xs text-gray-500">
                        {it.slug} · Qty {it.qty}
                        {it.size ? ` · ${it.size}` : ""}
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      PKR {PKR(it.price * it.qty)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping address */}
              <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-semibold mb-1">Ship To</div>
                  <div>{o.shippingAddress?.fullName}</div>
                  <div>{o.shippingAddress?.line1}{o.shippingAddress?.line2 ? `, ${o.shippingAddress.line2}` : ""}</div>
                  <div>
                    {o.shippingAddress?.city}{o.shippingAddress?.province ? `, ${o.shippingAddress.province}` : ""}
                  </div>
                  <div>
                    {o.shippingAddress?.country} {o.shippingAddress?.postalCode}
                  </div>
                  <div>Phone: {o.shippingAddress?.phone}</div>
                </div>
                <div className="self-end text-right">
                  {/* If you add a detail page later */}
                  {/* <Link href={`/orders/${o._id}`} className="underline text-sm">View details</Link> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
