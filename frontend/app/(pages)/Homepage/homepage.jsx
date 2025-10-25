"use client";

import React, { useCallback, useEffect, useState,useRef } from "react";
import Herobanner from "@/app/components/herobanner";
import TrandingSection from "@/app/components/TrendingSection";
import Marquee from "@/app/components/marquee";
import ProductPage from "@/app/components/ProductPage";
import { productAPI } from "../../apis/product"; 
import Link from "next/link";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
   const productSectionRef = useRef(null); 

     const handleScrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await productAPI.list(); 
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Product API error:", err);
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mx-auto">
       <Herobanner onScrollToProducts={handleScrollToProducts} />
      <TrandingSection />

      <Marquee />
      <h1 className="mt-16 text-3xl font-bold mb-10 px-8">Best Selling</h1>

      {/* Loading / Error / Grid */}
      <div className="px-8" ref={productSectionRef}>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[260px] bg-[#ebebeb] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-gray-600">{error}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {products.slice(0, 8).map((p) => (
              <ProductPage key={p._id} product={p} />
            ))}
          </div>
        )}
        <div className="flex justify-center items-center mt-10">
          <Link
            href="/products"
            className="inline-block bg-[#0a85d1] text-base hover:bg-blue-700 text-white font-bold py-2 px-10 rounded text-center"
          >
            View All
          </Link>
        </div>
      </div>
      {/* <h1 className="mt-16 text-3xl font-bold mb-10 px-8">Feature Section</h1> */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-10 px-8">
        {products.slice(0,4).map((p) => (
          <ProductPage key={`feature-${p._id}`} product={p} />
        ))}
      </div> */}

      {/* <div className="flex justify-center items-center mt-4">
        <button className="bg-[#0a85d1] text-base hover:bg-blue-700 text-white font-bold py-2 px-10 rounded">
          View All
        </button>
      </div> */}
    </div>
  );
};

export default Home;
