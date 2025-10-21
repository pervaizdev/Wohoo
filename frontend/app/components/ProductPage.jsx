"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaEye, FaShoppingCart, FaExchangeAlt } from "react-icons/fa";

const ProductPage = ({ product }) => {
  const { _id, title, price, imageUrl, slug } = product || {};
  const detailHref = `/product-detail/${encodeURIComponent(slug || "")}`;

  return (
    <div className="mt-4">
      <div className="group relative bg-[#ebebeb] h-[220px] sm:h-[260px] rounded-2xl overflow-hidden">
        <Link
          href={detailHref}
          className="relative block w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title || "Product image"}
              fill
              className="object-contain p-4"
              priority
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-500">
              No image
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />

        {/* Icon tray */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <div className="flex gap-3">
            {/* Quick view → also slug */}
            <Link
              href={detailHref}
              aria-label="Quick view"
              className="pointer-events-auto grid place-items-center w-12 h-12 rounded-xl bg-white text-gray-800 shadow-md border border-black/10 hover:shadow-lg hover:scale-105 transition"
            >
              <FaEye />
            </Link>

            <button
              aria-label="Add to cart"
              className="pointer-events-auto grid place-items-center w-12 h-12 rounded-xl bg-white text-gray-800 shadow-md border border-black/10 hover:shadow-lg hover:scale-105 transition"
            >
              <FaShoppingCart />
            </button>

            <button
              aria-label="Compare"
              className="pointer-events-auto grid place-items-center w-12 h-12 rounded-xl bg-white text-gray-800 shadow-md border border-black/10 hover:shadow-lg hover:scale-105 transition"
            >
              <FaExchangeAlt />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center font-bold mt-5 line-clamp-1">{title || "Untitled"}</p>
      <p className="text-center mt-1 font-bold text-[#3199d9] text-xl">
        {typeof price === "number" ? `Rs ${price}` : "—"}
      </p>
    </div>
  );
};

export default ProductPage;
