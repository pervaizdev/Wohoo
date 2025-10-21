"use client";
import React, { useCallback, useEffect, useState } from "react";
import { mostSalesAPI} from "../apis/mostsale"; // adjust path if needed

const TrandingSection = () => {
  const [items, setItems] = useState([]); // will hold up to 2 items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await mostSalesAPI.list(); // { success, data: [...] }
      const arr = Array.isArray(res?.data) ? res.data : [];
      // assuming backend already sorts by newest first; take top 2
      setItems(arr.slice(0, 2));
    } catch (err) {
      console.error("Most Sales API error:", err);
      setError(err?.message || "Failed to load trending data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="md:px-8 px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="min-h-[230px] md:min-h-[300px] bg-[#ebebeb] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="md:px-8 px-6 mt-10">
        <div className="min-h-[230px] md:min-h-[300px] bg-[#ebebeb] rounded-2xl grid place-items-center">
          <p className="text-gray-600 text-sm">{error || "No trending data found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-8 px-6 mt-10">
      {/* 2-up on desktop, 1-up on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16">
        {items.map((item) => (
          <div
            key={item._id}
            className="
              relative md:rounded-xl rounded-2xl bg-[#ebebeb]
              min-h-[230px] md:min-h-[250px]
              bg-no-repeat bg-top md:bg-right bg-contain
            "
            style={{
              backgroundImage: `url(${item.imageUrl})`,
            }}
          >
            <div className="relative z-10 flex h-full items-center">
              <div className="px-6 md:px-12 py-8">
                <h3 className="text-2xl md:text-4xl font-medium text-black max-w-[2ch]">
                  {item.heading}
                </h3>
                {item.subheading ? (
                  <p className="mt-2 text-gray-700 text-sm md:text-base max-w-md">
                    {item.subheading}
                  </p>
                ) : null}
                <button className="mt-6 inline-flex items-center justify-center rounded-lg border border-black px-6 py-2 text-black hover:bg-black hover:text-white transition">
                  {item.btnText || "Shop Now"}
                </button>
              </div>
            </div>
         </div>
        ))}
      </div>
    </div>
  );
};

export default TrandingSection;
