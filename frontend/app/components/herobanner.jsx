"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { Pagination } from "swiper/modules";
import { trendingAPI } from "../apis/trending"; // make sure this path matches your project

const Herobanner = () => {
  const [slides, setSlides] = useState([]);     // API data array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await trendingAPI.list();
      // Expecting shape: { success: true, data: [...] }
      setSlides(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Trending API error:", err);
      setError(err?.message || "Failed to load banner");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="px-4">
        <div className="bg-[#ebebeb] rounded-3xl overflow-hidden grid place-items-center h-[320px] md:h-[520px]">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="h-5 w-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
            <span>Loading banner…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="px-4">
        <div className="bg-[#ebebeb] rounded-3xl overflow-hidden grid place-items-center h-[320px] md:h-[520px]">
          <p className="text-sm text-gray-600">
            {error || "No trending items found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="bg-[#ebebeb] rounded-3xl overflow-hidden">
        <Swiper pagination={{ clickable: true }} modules={[Pagination]} className="w-full">
          {slides.map((slide) => (
            <SwiperSlide key={slide._id} className="!bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-16">
                {/* Image */}
                <div className="relative h-[300px] md:h-[500px] order-1 md:order-2">
                  {/* slide.imageUrl is absolute (e.g., http://localhost:5000/uploads/xxx.png) */}
                  <Image
                    src={slide.imageUrl}
                    alt={slide.heading || "Banner"}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Text */}
                <div className="md:flex flex-col justify-center items-start text-black px-6 md:px-20 py-6 md:py-0 order-2 md:order-1">
                  <p className="text-3xl md:text-5xl text-start">{slide.heading}</p>
                  <p className="mt-4 md:mt-6">{slide.subheading}</p>
                  <button className="mt-4 md:mt-6 bg-blue-600 text-white font-medium px-6 py-2 rounded-md hover:bg-blue-700 transition">
                    {slide.btnText}
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Herobanner;
