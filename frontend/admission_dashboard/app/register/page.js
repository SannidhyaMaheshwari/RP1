"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [campus, setCampus] = useState("Pilani");
  const [role, setRole] = useState("view"); // default role is "view"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Regex to check that email ends with one of the allowed domains.
    // Allowed domains: pilani.bits-pilani.ac.in, goa.bits-pilani.ac.in, hyderabad.bits-pilani.ac.in
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@(?:pilani|goa|hyderabad)\.bits-pilani\.ac\.in$/;
    if (!emailRegex.test(email)) {
      setError(
        "Email must be a valid institutional email ending with @pilani.bits-pilani.ac.in, @goa.bits-pilani.ac.in, or @hyderabad.bits-pilani.ac.in"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          contact,
          campus,
          role, // added role to the payload
          password,
          confirmPassword,
        }),
      });

      setLoading(false);
      const data = await res.json();
      if (res.ok) {
        router.push("/login");
      } else {
        setError(data.detail || "Registration failed");
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to the server");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bitsimage.jpg')" }}
      ></div>

      <div className="relative z-10 bg-white/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl max-w-lg w-full text-center border border-white/50">
        <div className="font-extrabold text-4xl mb-4 text-gray-900 drop-shadow-lg">
          Admin Registration
        </div>
        <div className="font-semibold text-lg text-gray-800 mb-6">
          Register for BITS Admission Portal
        </div>

        <form onSubmit={handleRegister} className="w-full space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-md bg-white text-gray-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-md bg-white text-gray-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            pattern="[1-9]{1}[0-9]{9}"
            placeholder="Contact Number"
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-md bg-white text-gray-900"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <select
            className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-md text-gray-900"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            required
          >
            <option value="Pilani">Pilani</option>
            <option value="Goa">Goa</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
          {/* Role selection */}
          <select
            className="p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-md text-gray-900"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="admin">Admin</option>
            <option value="view">View</option>
            <option value="view_and_withdraw">View and Withdraw</option>
          </select>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-md bg-white text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
          <input
            type="password"
            placeholder="Confirm Password"
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none shadow-md bg-white text-gray-900"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 font-semibold">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg font-semibold disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
