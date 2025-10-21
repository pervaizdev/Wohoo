"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from '../public/images/logo.png';
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const links = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Contact", href: "/contact" },
  ];

  // ✅ Check token in localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  // ✅ Sign out function
  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    alert("Signed out successfully!"); 
  };

  return (
    <header className="bg-white px-10">
      <nav
        className="
          grid items-center justify-between gap-4 px-4 py-3
          grid-cols-[80%_10%_10%]
          md:px-8 md:py-4 md:grid-cols-[30%_25%_40%]
        "
      >
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link href="/" className="flex items-center">
              <Image
        src={logo}
        alt="Minimalin Logo"
        width={70}            // ← adjust size
        height={70}
        className="object-cover"
      />
          </Link>
        </div>

        {/* Center links (hidden on mobile) */}
        <ul className="hidden md:flex justify-center gap-6 font-bold text-black font-poppins text-base">
          {links.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="hover:text-sky-500 cursor-pointer transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side icons or login/signout button */}
        <div className="flex items-center justify-end gap-5 text-xl text-gray-700">
          {isLoggedIn ? (
            <>
              <button
                className="hidden md:inline-flex hover:text-sky-500"
                aria-label="Search"
              >
                <FaSearch />
              </button>
              <button
                className="hidden md:inline-flex hover:text-sky-500"
                aria-label="Account"
              >
                <FaUser />
              </button>
              <button className="relative hover:text-sky-500" aria-label="Cart">
                <FaShoppingCart />
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] leading-none font-bold px-1.5 py-0.5 rounded-full">
                  0
                </span>
              </button>

              {/* ✅ Sign Out button */}
          <button
  onClick={handleSignOut}
  className="hidden md:inline-flex bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-md hover:bg-red-600 transition"
>
  Sign Out
</button>

            </>
          ) : (
            <Link
              href="/login"
              className="bg-black text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-900 transition"
            >
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center text-2xl hover:text-sky-500"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-t ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-2 px-4 py-3 font-medium text-black">
          {links.map((link) => (
            <li
              key={link.name}
              className="py-2 px-2 rounded hover:text-sky-500 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Link href={link.href}>{link.name}</Link>
            </li>
          ))}

          {isLoggedIn ? (
            <>
              <div className="mt-2 flex items-center gap-5 text-lg text-gray-700 px-2">
                <button className="hover:text-sky-500" aria-label="Search">
                  <FaSearch />
                </button>
                <button className="hover:text-sky-500" aria-label="Account">
                  <FaUser />
                </button>
              </div>
              {/* ✅ Sign Out in mobile menu */}
              <button
                onClick={() => {
                  handleSignOut();
                  setOpen(false);
                }}
                className="mt-3 inline-block text-center bg-red-500 text-white px-4 py-2 rounded-md font-medium hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="mt-3 inline-block text-center bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-900 transition"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
