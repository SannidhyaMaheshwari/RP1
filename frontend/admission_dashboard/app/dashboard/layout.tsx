"use client";

import Sidebar from "../components/Sidebar.jsx";
import { useState } from "react";
import Homepage from "../components/Homepage";
import StudentDetails from "../components/StudentDetails";
import IterationDetails from "../components/IterationDetails";
import FeeDetails from "../components/FeeDetails";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeComponent, setActiveComponent] = useState("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        setActiveComponent={setActiveComponent}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
      <main
        className={`p-6 transition-all duration-300 w-full ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {activeComponent === "home" && <Homepage />}
        {activeComponent === "students" && <StudentDetails />}
        {activeComponent === "iterations" && <IterationDetails />}
        {activeComponent === "fees" && <FeeDetails />}
      </main>
    </div>
  );
}
