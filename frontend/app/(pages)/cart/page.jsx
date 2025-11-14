// app/cart/page.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cartAPI } from "../../apis/cart";
import Image from "next/image";

export default function CartPage() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  // 🆕 confirm dialog state
  const [confirmState, setConfirmState] = useState({
    open: false,
    message: "",
    onConfirm: null,
  });

  const normalize = (raw) => {
    const root = raw?.data ?? raw ?? {};
    const cart = root.cart ?? root?.data?.cart ?? { items: [] };
    const subtotal = root.subtotal ?? root?.data?.subtotal ?? 0;
    const totalItems = root.totalItems ?? root?.data?.totalItems ?? 0;
    return { cart, subtotal, totalItems };
  };

  const load = async () => {
    try {
      setErr("");
      const res = await cartAPI.getCart();
      setData(normalize(res));
    } catch (e) {
      setErr("Could not load cart. Please try again.");
      setData({ cart: { items: [] }, subtotal: 0, totalItems: 0 });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashInfo = (msg) => {
    setInfo(msg);
    setTimeout(() => setInfo(""), 2200);
  };

  // 🆕 open confirm dialog with a message + action
  const openConfirm = (message, onConfirm) => {
    setConfirmState({
      open: true,
      message,
      onConfirm,
    });
  };

  const handleConfirmOk = async () => {
    const fn = confirmState.onConfirm;
    setConfirmState((prev) => ({ ...prev, open: false, onConfirm: null }));
    if (typeof fn === "function") {
      await fn();
    }
  };

  const handleConfirmCancel = () => {
    setConfirmState((prev) => ({ ...prev, open: false, onConfirm: null }));
  };

  const { cart, subtotal, totalItems } = data || {
    cart: { items: [] },
    subtotal: 0,
    totalItems: 0,
  };
  const items = cart?.items ?? [];

  // 🆕 clear cart using custom confirm modal
  const clear = () => {
    if (!items.length) return;

    openConfirm("Are you sure you want to clear all items from the cart?", async () => {
      setBusy(true);
      try {
        await cartAPI.clearCart();
        await load();
        flashInfo("Cart cleared.");
      } finally {
        setBusy(false);
      }
    });
  };

  if (!data) return <Skeleton />;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your Cart</h1>
        <Link
          href="/orders"
          className="inline-block bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          My Orders
        </Link>
      </div>

      {/* Alerts */}
      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {info && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {info}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div className="rounded-2xl border bg-white/70 backdrop-blur-sm shadow-sm">
            <div className="divide-y">
              {items.map((it) => (
                <Row
                  key={it._id || it.product}
                  it={it}
                  onChanged={async (payload) => {
                    setBusy(true);
                    try {
                      await cartAPI.updateItem(it._id || it.product, payload);
                      await load();
                      flashInfo("Cart updated.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                  // 🆕 use custom confirm for remove
                  onRemove={() => {
                    openConfirm(
                      "Are you sure you want to remove this item from the cart?",
                      async () => {
                        setBusy(true);
                        try {
                          await cartAPI.removeItem(it._id || it.product);
                          await load();
                          flashInfo("Item removed.");
                        } finally {
                          setBusy(false);
                        }
                      }
                    );
                  }}
                  disabled={busy}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-6 h-max">
            <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-5">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPKR(subtotal)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-white bg-gray-900 hover:bg-black transition disabled:opacity-60"
                aria-disabled={busy}
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={clear}
                disabled={busy}
                className="mt-3 w-full rounded-xl border px-4 py-3 text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {busy ? "…" : "Clear Cart"}
              </button>
              <Link
                href="/products"
                className="mt-3 block text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Continue shopping →
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* 🆕 Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        message={confirmState.message}
        onCancel={handleConfirmCancel}
        onConfirm={handleConfirmOk}
      />
    </div>
  );
}

function Row({ it, onChanged, onRemove, disabled }) {
  const [qty, setQty] = useState(it.qty ?? 1);
  const [size, setSize] = useState(it.size ?? "");
  const [saving, setSaving] = useState(false);

  const lineTotal = useMemo(
    () => (Number(it.price) || 0) * (Number(qty) || 1),
    [it.price, qty]
  );

  const commit = async () => {
    setSaving(true);
    try {
      await onChanged({ qty, size });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center p-3 sm:p-4">
      <div className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={it.imageUrl}
          alt={it.title}
          className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover ring-1 ring-gray-200"
          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
        />
      </div>

      <div className="flex-1 w-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium leading-6">{it.title}</div>
            {it.slug && <div className="text-xs text-gray-500">{it.slug}</div>}
          </div>
          <button
            onClick={onRemove}
            disabled={disabled || saving}
            className="text-xs rounded-lg px-2 py-1 border hover:bg-red-50 text-red-600 border-red-200 disabled:opacity-50"
            title="Remove"
          >
            Remove
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {/* Quantity stepper */}
          <div className="flex items-center rounded-xl border bg-white overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, Number(q) - 1))}
              className="px-3 py-2 hover:bg-gray-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 border-x px-2 py-2 text-center outline-none"
              aria-label="Quantity"
            />
            <button
              onClick={() => setQty((q) => Number(q) + 1)}
              className="px-3 py-2 hover:bg-gray-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Size selector */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Size</span>
            {Array.isArray(it.sizes) && it.sizes.length > 0 ? (
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="rounded-xl border px-3 py-2 bg-white"
              >
                <option value="">Select</option>
                {it.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="(optional)"
                className="rounded-xl border px-3 py-2"
              />
            )}
          </div>

          <button
            onClick={commit}
            disabled={disabled || saving}
            className="ml-auto rounded-xl border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Update"}
          </button>
        </div>
      </div>

      <div className="text-right w-full sm:w-32">
        <div className="text-sm text-gray-500">Price</div>
        <div className="font-semibold">{formatPKR(it.price)}</div>
        <div className="mt-1 text-sm text-gray-500">Line total</div>
        <div className="font-bold">{formatPKR(lineTotal)}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-2xl border bg-white/70 backdrop-blur-sm p-10 text-center">
      <div className="text-5xl">🛒</div>
      <h2 className="mt-3 text-xl font-semibold">Your cart is empty</h2>
      <p className="mt-1 text-gray-600">Let’s find something you’ll love.</p>
      <Link
        href="/products"
        className="mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-white bg-gray-900 hover:bg-black transition"
      >
        Browse products
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 animate-pulse">
      <div className="h-7 w-40 rounded bg-gray-200" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border bg-white/70 p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-24 w-24 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded" />
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border bg-white/80 p-5 space-y-3">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
      </div>
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

// 🆕 Simple reusable confirm dialog
function ConfirmDialog({ open, message, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
