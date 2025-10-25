"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";

export default function NavbarFooterWrapper({ children }) {
  const pathname = usePathname();

  // Routes where navbar/footer should be hidden
  const hiddenExactRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/dashboard/overview",
    "/dashboard/trending-add-product",
    "/dashboard/product",
    "/dashboard/trending-product",
    "/dashboard/most-sales",
    "/dashboard/most-sales-add",
    "/dashboard/product-add",
    "/dashboard/orders"
  ];

  // Check if current route matches exact or dynamic patterns
  const hideLayout =
    hiddenExactRoutes.includes(pathname) ||
    pathname.startsWith("/dashboard/trending-edit/") ||
    pathname.startsWith("/dashboard/most-sales-edit/")||
    pathname.startsWith("/dashboard/product-edit/");
    

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
  