"use client";
import React, { useState } from "react";

const ContactForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    trap: "", // honeypot (bots will fill this)
  });
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ loading: false, ok: false, msg: "Please fill required fields." });
      return false;
    }
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOK) {
      setStatus({ loading: false, ok: false, msg: "Please enter a valid email." });
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: null, msg: "" });
    if (!validate()) return;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to send");

      setStatus({ loading: false, ok: true, msg: "Message sent! We’ll get back to you soon." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "", trap: "" });
    } catch (err) {
      setStatus({ loading: false, ok: false, msg: err.message || "Something went wrong." });
    }
  };

  return (
    <div className="md:px-32 p-6">
    <section className="mx-auto mt-12 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-1">Contact Us</h2>
      <p className="text-gray-600 mb-6">We usually reply within 24 hours.</p>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Honeypot (hidden) */}
        <input
          type="text"
          name="trap"
          value={form.trap}
          onChange={handleChange}
          className="hidden"
          autoComplete="off"
          tabIndex={-1}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+92 3xx xxxxxxx"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How can we help?"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Message *</label>
          <textarea
            name="message"
            rows={6}
            value={form.message}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your message here..."
            required
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={status.loading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status.loading ? "Sending..." : "Send Message"}
          </button>

          {status.msg && (
            <span className={`${status.ok ? "text-green-600" : "text-red-600"} text-sm`}>
              {status.msg}
            </span>
          )}
        </div>
      </form>
    </section>
    </div>
  );
};

export default ContactForm;
