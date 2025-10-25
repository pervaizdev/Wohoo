"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "../apis/auth"; // make sure this path is correct

const AuthContext = createContext(null);

export function AuthProvider({ children, pollMs = 60_000 }) {
  const router = useRouter();
  const [user, setUser] = useState(null);   // { _id, name, email, phone, role, isVerified, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const getToken = () => {
    const cookieToken =
      typeof document !== "undefined"
        ? document.cookie.split("; ").find(c => c.startsWith("token="))?.split("=")[1]
        : null;
    const lsToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return cookieToken || lsToken || null;
  };

  const fetchMe = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // authAPI.me() SHOULD call GET /auth/me and return { success, user }
      // Make sure authAPI.me() already attaches Authorization header OR uses credentials
      const res = await authAPI.me(); // e.g. axios.get("/auth/me")
      const data = res?.data || res;  // handle axios or fetch-like wrappers

      if (data?.success && data?.user) {
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
        setError("Not authenticated");
      }
    } catch (err) {
      setUser(null);
      setError(err?.message || "Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();

    const onFocus = () => fetchMe();
    window.addEventListener("focus", onFocus);

    if (pollMs > 0) {
      pollRef.current = setInterval(fetchMe, pollMs);
    }
    return () => {
      window.removeEventListener("focus", onFocus);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    error,
    refresh: fetchMe,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Helpful error if someone uses the hook outside the provider
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
