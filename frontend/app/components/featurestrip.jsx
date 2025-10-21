"use client";
import React from "react";
import {
  FaShippingFast,
  FaMoneyBillWave,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";

const FeaturesStrip = () => {
  const items = [
    {
      icon: <FaShippingFast className="text-black" size={44} />,
      title: "Free Shipping",
      subtitle: "On orders over $99.",
    },
    {
      icon: <FaMoneyBillWave className="text-black" size={44} />,
      title: "Money Back",
      subtitle: "Money back in 15 days.",
    },
    {
      icon: <FaShieldAlt className="text-black" size={44} />,
      title: "Secure Checkout",
      subtitle: "100% Payment Secure.",
    },
    {
      icon: <FaHeadset className="text-black" size={44} />,
      title: "Online Support",
      subtitle: "Ensure the product quality.",
    },
  ];

  return (
    <section className=" p-8">
      <div >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              {/* Icon */}
              <div className="shrink-0">{item.icon}</div>

              {/* Text */}
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 md:text-lg">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesStrip;
