"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Homepage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalApplications: 0,
    acceptedStudents: 0,
    iterationNumber: 0,
    iterationDate: "",
  });
  const fileUploadRef = useRef(null);
  const router = useRouter();

  const girls = 1263;
  const boys = 3726;
  const data = [
    { name: "Girls", value: girls },
    { name: "Boys", value: boys },
  ];
  const COLORS = ["#f47171", "#4a90e2"];

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
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

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
    });

    setLoading(false);

    if (res.ok) {
      alert("File uploaded successfully");
      window.location.reload();
    } else {
      alert("File upload failed");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <img
            src="/Pilani-Logo.svg.png"
            alt="Loading"
            className="w-20 h-20 animate-flip mb-10"
          />
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
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                fill="#8884d8"
                labelLine={false}
                stroke="none"
                label={({ name, value }) =>
                  `${name}:${((value / (girls + boys)) * 100).toFixed(1)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
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
