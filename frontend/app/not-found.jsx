"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      {/* Animated 404 text */}
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-[8rem] font-bold text-sky-500 leading-none"
      >
        404
      </motion.h1>

      {/* Subheading */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-2xl font-semibold text-gray-800 mt-2"
      >
        Page Not Found
      </motion.h2>

      {/* Message */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-gray-600 mt-3 max-w-md"
      >
        Oops! The page you’re looking for doesn’t exist or may have been moved.
      </motion.p>

      {/* Back button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-900 transition"
        >
          <FaArrowLeft className="text-xs" /> Go Back Home
        </Link>
      </motion.div>

      {/* Optional footer text */}
      <p className="text-xs text-gray-400 mt-10">
        © {new Date().getFullYear()} Minimalin. All rights reserved.
      </p>
    </main>
  );
}
