"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Home, Users, IterationCw, CreditCard } from "lucide-react";

export default function Sidebar({ setActiveComponent, setIsSidebarCollapsed }) {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("http://localhost:8000/api/user", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    }
    fetchUser();
  }, []);

  const handleReset = async () => {
    router.push("/reset-password");
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full ${
        isCollapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-blue-900 to-blue-800 text-white p-5 flex flex-col z-50 shadow-lg transition-all duration-300`}
    >
      <button
        className="text-white mb-4"
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          setIsSidebarCollapsed(!isCollapsed);
        }}
      >
        {isCollapsed ? <Menu size={28} /> : <X size={28} />}
      </button>

      <div className="flex justify-center mb-6">
        <img
          src="/BITS_logo.png"
          alt="BITS Logo"
          className={`${
            isCollapsed ? "w-9 h-9" : "w-24 h-24"
          } rounded-full shadow-none border-none transform transition-all duration-300 hover:scale-105`}
        />
      </div>

      <nav className="flex-1">
        <ul className="text-lg">
          <li>
            {isCollapsed ? (
              <button
                onClick={() => setActiveComponent("home")}
                className="flex items-center justify-center py-3 px-2 hover:bg-blue-700 transition-all duration-300 w-full rounded-lg"
              >
                <Home size={24} />
              </button>
            ) : (
              <button
                onClick={() => setActiveComponent("home")}
                className="block py-3 px-5 hover:bg-blue-700 transition-all duration-300 w-full text-left rounded-lg"
              >
                Dashboard
              </button>
            )}
          </li>
          <li>
            {isCollapsed ? (
              <button
                onClick={() => setActiveComponent("students")}
                className="flex items-center justify-center py-3 px-2 hover:bg-blue-700 transition-all duration-300 w-full rounded-lg"
              >
                <Users size={24} />
              </button>
            ) : (
              <button
                onClick={() => setActiveComponent("students")}
                className="block py-3 px-5 hover:bg-blue-700 transition-all duration-300 w-full text-left rounded-lg"
              >
                Student Details
              </button>
            )}
          </li>
          <li>
            {isCollapsed ? (
              <button
                onClick={() => setActiveComponent("iterations")}
                className="flex items-center justify-center py-3 px-2 hover:bg-blue-700 transition-all duration-300 w-full rounded-lg"
              >
                <IterationCw size={24} />
              </button>
            ) : (
              <button
                onClick={() => setActiveComponent("iterations")}
                className="block py-3 px-5 hover:bg-blue-700 transition-all duration-300 w-full text-left rounded-lg"
              >
                Iteration Details
              </button>
            )}
          </li>
          <li>
            {isCollapsed ? (
              <button
                onClick={() => setActiveComponent("fees")}
                className="flex items-center justify-center py-3 px-2 hover:bg-blue-700 transition-all duration-300 w-full rounded-lg"
              >
                <CreditCard size={24} />
              </button>
            ) : (
              <button
                onClick={() => setActiveComponent("fees")}
                className="block py-3 px-5 hover:bg-blue-700 transition-all duration-300 w-full text-left rounded-lg"
              >
                Fee Details
              </button>
            )}
          </li>
        </ul>
      </nav>

      {user && !isCollapsed && (
        <div
          className="relative mt-auto p-4 cursor-pointer border-t border-blue-700"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="text-lg font-bold text-center hover:text-blue-400 transition duration-300">
            {user.name}
          </div>
          {showDropdown && (
            <div className="absolute left-4 bottom-12 w-48 bg-white text-black rounded-lg shadow-lg overflow-hidden">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition duration-300"
                onClick={handleLogout}
              >
                Logout
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={handleReset}
              >
                Reset Password
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
