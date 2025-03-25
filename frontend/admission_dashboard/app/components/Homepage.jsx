"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Homepage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // State to track drag-over
  const [stats, setStats] = useState({
    totalApplications: 0,
    acceptedStudents: 0,
    iterationNumber: 0,
    iterationDate: "",
  });

  const [genderData, setGenderData] = useState([]);
  const COLORS = ["#1E88E5", "#D81B60", "#E0A96D"];

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/stats", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalApplications: data.totalApplications,
            acceptedStudents: data.acceptedStudents,
            iterationNumber: data.latestIterationNumber,
            iterationDate: new Date(
              data.latestIterationDate
            ).toLocaleDateString(),
          });
          const genderArray = Object.entries(data.genderStats).map(
            ([key, value]) => ({
              name: key,
              value: value,
            })
          );

          setGenderData(genderArray);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role); // Expecting { name: ..., role: "admin" | "view" | "view_and_withdraw" }
        } else {
          // If not logged in, you may handle redirection
          setUserRole("view");
        }
      } catch (error) {
        console.error("Failed to fetch user role", error);
        setUserRole("view");
      }
    };
    fetchUserRole();
  }, []);

  // If userRole is not loaded yet, you can show a loader (optional)
  if (!userRole) {
    return <p>Loading...</p>;
  }

  // Determine which upload types to display based on user role
  const availableUploadTypes =
    userRole === "admin"
      ? ["master", "iteration", "fees", "withdraw"]
      : userRole === "view_and_withdraw"
      ? ["withdraw"]
      : [];

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = (fileType) => {
    setUploadType(fileType);
    setSelectedFile(null);
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const submitFile = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    let endpoint = "";
    if (uploadType === "master") {
      endpoint = "/update/MASTER_TABLE";
    } else if (uploadType === "iteration") {
      endpoint = "/update/ITERATION_OFFER";
    } else if (uploadType === "fees") {
      endpoint = "/update/FEES_PAID";
    } else if (uploadType === "withdraw") {
      endpoint = "/api/withdraw/upload";
    }

    const res = await fetch(`http://localhost:8000${endpoint}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    setLoading(false);

    if (res.ok) {
      alert("File uploaded successfully");
      window.location.reload();
    } else {
      alert("File upload failed");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
    setIsDragging(false); // Reset drag state
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true); // Set drag state to true
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false); // Reset drag state when leaving the area
  };

  // return (
  //   <div className="p-8 bg-gray-100 min-h-screen relative">
  //     {loading && (
  //       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  //         <img
  //           // src=  "/bitsimage.jpg" // "/Pilani-Logo.svg.png"
  //           src=  "/Pilani-Logo.svg.png"
  //           alt="Loading"
  //           className="w-20 h-20 animate-flip mb-10"
  //         />
  //       </div>
  //     )}

  return (
    <div className="p-8 bg-gray-100 min-h-screen relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="max-w-full max-h-screen flex justify-center">
            <img
              src="/Pilani-Logo.svg.png"
              alt="Loading"
              className="w-1/3 h-1/3 md:w-1/3 md:h-1/7 lg:w-1/6 lg:h-1/4 xl:w-1/12 xl:h-1/12     animate-flip mb-10 object-contain"
            />
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-semibold text-gray-900">
          BITS Pilani - Pilani Campus
        </h1>
        <p className="text-gray-600 text-lg">BITS Admission Portal Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-6">
        <div className="bg-white shadow-md p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Total Applications
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalApplications}
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mt-4">
            Accepted Students
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.acceptedStudents}
          </p>
        </div>

        <div className="bg-white shadow-md p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Current Iteration Stats
          </h3>
          <p className="text-2xl font-bold text-gray-700">
            {stats.iterationNumber}
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mt-4">
            Iteration Date
          </h3>
          <p className="text-2xl font-bold text-gray-700">
            {stats.iterationDate}
          </p>
        </div>

        <div className="bg-white shadow-md p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
            Gender Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                fill="#8884d8"
                labelLine={false}
                stroke="none"
                label={({ name, value, cx, cy, midAngle }) => {
                  const RADIAN = Math.PI / 180;
                  const radiusOffset = 90;
                  const x = cx + Math.cos(-midAngle * RADIAN) * radiusOffset;
                  const y = cy + Math.sin(-midAngle * RADIAN) * radiusOffset;
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="black"
                      fontSize={14}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {`${(
                        (value /
                          genderData.reduce(
                            (sum, entry) => sum + entry.value,
                            0
                          )) *
                        100
                      ).toFixed(1)}%`}
                    </text>
                  );
                }}
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Legend />
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow-md p-6 rounded-xl border border-gray-200 mt-8 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Upload CSV Files
        </h3>
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {["master", "iteration", "fees", "withdraw"].map((type) => (
            <button
              key={type}
              className={`px-6 py-2.5 text-base rounded-lg transition-colors font-medium shadow-md ${
                uploadType === type
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={() => handleUpload(type)}
            >
              Upload {type.charAt(0).toUpperCase() + type.slice(1)} File
            </button>
          ))}
        </div>
        {uploadType && (
          <div className="mt-6 bg-gray-100 p-6 rounded-lg shadow-md w-2/3 mx-auto">
            <div
              className={`w-full p-3 border rounded-lg mb-4 text-gray-700 flex items-center justify-center transition-all duration-300 ${
                isDragging ? "bg-blue-100 border-blue-500" : "bg-white"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: "2px dashed #ccc",
                minHeight: "100px",
                cursor: "pointer",
              }}
            >
              {selectedFile ? (
                <p>{selectedFile.name}</p>
              ) : (
                <p>Drag and drop a file here, or click to select a file</p>
              )}
            </div>
            <input
              type="file"
              className="w-full p-3 border rounded-lg mb-4 text-gray-700"
              onChange={handleFileChange}
            />
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-base font-medium flex items-center justify-center"
              onClick={submitFile}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Submit File"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
