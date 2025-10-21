"use client";
import React, { useState } from "react";
import { authAPI } from "../../Apis/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    toast.error("Please enter email and password");
    return;
  }

  setLoading(true);
  try {
    const res = await authAPI.login({ email, password });
    const payload = res?.data ?? res;
    if (!payload?.success) throw new Error(payload?.message || "Login failed");

    toast.success(payload?.message || "Login successful");

    const role = payload?.user?.role;

    // ⏳ small artificial delay (1.5s)
    setTimeout(() => {
      if (role === "admin") {
        router.replace("/dashboard");
      } else if (role === "user") {
        router.replace("/");
      } else {
        toast.error("Access denied: unknown role");
      }
    }, 1500);
  } catch (err) {
    toast.error(err?.message || "Login failed");
  } finally {
    // let the spinner show a bit longer
    setTimeout(() => setLoading(false), 1500);
  }
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#ebebeb] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              placeholder="user@gmail.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-800"
                aria-label={showPw ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-white font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Bottom link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-medium text-sky-600 hover:text-sky-700">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
