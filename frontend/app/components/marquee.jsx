"use client";
import React from "react";

const Marquee = () => {
  const items = [
    "24/7 support",
    "Returns accepted for 30 days",
    "Free return shipping",
    "No restocking fee",
  ];

  return (
    <div className="group relative overflow-hidden bg-[#ebebeb] py-8 mt-10 mb-10">
      {/* edge fades */}
      <div className="pointer-events-none absolute left-0 top-0  bg-gradient-to-r from-[#ebebeb] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0  bg-gradient-to-l from-[#ebebeb] to-transparent" />

      {/* scrolling track */}
      <div className="marquee-track flex items-center gap-8 whitespace-nowrap">
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-3 text-[#2b2b2b]">
            <span className="inline-block h-2 w-2 rounded-full bg-black" />
            <span className="text-lg md:text-2xl leading-none">{text}</span>
          </div>
        ))}
      </div>

      {/* keyframes + pause on hover */}
      
    </div>
  );
};

export default Marquee;
