"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Error sending reset email.");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bitsimage.jpg')" }}
      ></div>

      <div className="relative z-10 bg-white/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl max-w-md w-full text-center border border-white/50">
        <div className="font-extrabold text-4xl mb-4 text-gray-900 drop-shadow-lg">
          Forgot Password
        </div>
        <div className="font-semibold text-lg text-gray-800 mb-6">
          Enter your email to receive a reset link
        </div>

        <form onSubmit={handleForgotPassword} className="w-full space-y-4">
          {message && (
            <p className="mb-4 text-center text-red-500">{message}</p>
          )}

          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-md bg-white text-gray-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg font-semibold disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
