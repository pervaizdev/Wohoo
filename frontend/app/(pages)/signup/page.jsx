"use client";
import React, { useState } from "react";
import { authAPI } from "../../Apis/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.signUp({
        name,
        email,
        phone,
        password,
      });

      // handle axios or raw response
      const payload = res?.data ?? res;

      if (!payload?.success) {
        throw new Error(payload?.message || "Signup failed");
      }

      toast.success(payload?.message || "Account created successfully");

      // 👇 Small artificial delay for smoother UX
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch (err) {
      toast.error(err?.message || "Signup failed");
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#ebebeb] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mt-1">Join us in a minute.</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSignup}>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              placeholder="Jane Doe"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              placeholder="1234567891"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                disabled={loading}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-800"
              >
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-white font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Creating account…
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-sky-600 hover:text-sky-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
