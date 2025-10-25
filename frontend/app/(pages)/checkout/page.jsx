// app/checkout/page.jsx
"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cartAPI } from "../../apis/cart";
import { orderAPI } from "../../apis/order";

const uuidv4 = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export default function CheckoutPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [addr, setAddr] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "PK",
  });

  // Normalize API shape: works with {cart,...} or {data:{cart,...}}
  const normalize = (raw) => {
    const root = raw?.data ?? raw ?? {};
    const cart = root.cart ?? root?.data?.cart ?? { items: [] };
    const subtotal = root.subtotal ?? root?.data?.subtotal ?? 0;
    const totalItems = root.totalItems ?? root?.data?.totalItems ?? 0;
    return { cart, subtotal, totalItems };
  };

  const load = async () => {
    try {
      const res = await cartAPI.getCart();
      setData(normalize(res));
    } catch (e) {
      toast.error("Could not load checkout. Please try again.");
      setData({ cart: { items: [] }, subtotal: 0, totalItems: 0 });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = data?.cart?.items ?? [];
  const subtotal = data?.subtotal ?? 0;
  const totalItems = data?.totalItems ?? 0;

  const isAddressValid = useMemo(() => {
    return (
      addr.fullName.trim() &&
      addr.phone.trim() &&
      addr.line1.trim() &&
      addr.city.trim() &&
      addr.province.trim()
    );
  }, [addr]);

  const place = async () => {
    if (!items.length) {
      toast.error("Cart is empty.");
      return;
    }
    if (!isAddressValid) {
      toast.error("Please complete required fields.");
      return;
    }

    setPlacing(true);
    try {
      await toast.promise(
        orderAPI.placeOrder({
          shippingAddress: addr,
          paymentMethod: "COD",
          checkoutToken: uuidv4(),
        }),
        {
          loading: "Placing your order…",
          success: "Order placed! Redirecting…",
          error: (e) => e?.response?.data?.message || "Failed to place order",
        }
      );
      router.push("/orders");
    } finally {
      setPlacing(false);
    }
  };

  if (!data) return <div className="p-6">Loading checkout…</div>;

  if (!items.length) {
    return (
      <div className="p-6">
        Cart is empty.{" "}
        <Link className="underline" href="/products">
          Go to products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto grid md:grid-cols-[1fr_380px] gap-8">
      {/* Address */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Shipping Address</h2>
        <div className="rounded-2xl border bg-white/70 backdrop-blur-sm p-4 sm:p-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Full Name*"
              value={addr.fullName}
              onChange={(v) => setAddr((a) => ({ ...a, fullName: v }))}
              required
            />
            <Field
              label="Phone*"
              value={addr.phone}
              onChange={(v) => setAddr((a) => ({ ...a, phone: v }))}
              placeholder="03xx-xxxxxxx"
              required
            />
            <Field
              label="Address Line 1*"
              value={addr.line1}
              onChange={(v) => setAddr((a) => ({ ...a, line1: v }))}
              required
              className="sm:col-span-2"
            />
            <Field
              label="Address Line 2 (optional)"
              value={addr.line2}
              onChange={(v) => setAddr((a) => ({ ...a, line2: v }))}
              className="sm:col-span-2"
            />
            <Field
              label="City*"
              value={addr.city}
              onChange={(v) => setAddr((a) => ({ ...a, city: v }))}
              required
            />
            <Field
              label="Province*"
              value={addr.province}
              onChange={(v) => setAddr((a) => ({ ...a, province: v }))}
              required
            />
            <Field
              label="Postal Code (optional)"
              value={addr.postalCode}
              onChange={(v) => setAddr((a) => ({ ...a, postalCode: v }))}
            />
            <Field
              label="Country (default PK)"
              value={addr.country}
              onChange={(v) => setAddr((a) => ({ ...a, country: v }))}
            />
          </div>

          <button
            onClick={place}
            disabled={placing}
            className="mt-4 w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 text-white hover:bg-black transition disabled:opacity-60"
          >
            {placing ? "Placing..." : "Place Order (COD)"}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Snapshot cart prices are used.
          </p>
        </div>
      </div>

      {/* Summary */}
      <aside className="md:sticky md:top-6 h-max">
        <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
        <div className="rounded-2xl border bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="divide-y">
            {items.map((it) => (
              <div key={it._id || it.product} className="p-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.imageUrl}
                  className="w-16 h-16 rounded object-cover ring-1 ring-gray-200"
                  alt={it.title}
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.title}</div>
                  <div className="text-sm text-gray-500">
                    Qty {it.qty}
                    {it.size ? ` · ${it.size}` : ""}
                  </div>
                </div>
                <div className="font-semibold">{formatPKR((+it.price || 0) * (+it.qty || 0))}</div>
              </div>
            ))}
          </div>

          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPKR(subtotal)}</span>
            </div>
            {/* Add shipping/taxes here if needed */}
          </div>
        </div>

        <Link
          href="/cart"
          className="mt-3 inline-block text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Cart
        </Link>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder, className = "" }) {
  return (
    <div className={className}>
      <label className="text-sm text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="mt-1 w-full border rounded-xl px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function formatPKR(value) {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `PKR ${Number(value) || 0}`;
  }
}
