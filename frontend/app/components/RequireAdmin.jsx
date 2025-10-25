"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function RequireAdmin({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || role !== "admin") {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, isAuthenticated, role, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        Checking your access…
      </div>
    );
  }

  if (!isAuthenticated || role !== "admin") return null;
  return children;
}
