// components/StudentDetails.tsx
"use client";

import { useEffect, useState } from "react";

export default function StudentDetails() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/students?query=${searchQuery}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Welcome, BITS Pilani - Pilani Campus
        </h1>
        <p className="text-gray-500 mb-6">
          Welcome to BITS Admission Portal Dashboard
        </p>
      </div>
      <div className="flex flex-col w-full justify-center">
        <h1 className="text-3xl font-bold mb-4">Student Details</h1>
        <div className="flex items-center mb-4 ml-4">
          <input
            type="text"
            placeholder="Enter Student ID or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded w-96"
          />
          <button
            className="ml-2 w-32 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={fetchStudents}
          >
            Search
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-600">Loading student details...</p>
      )}
      {searched && students.length === 0 && !loading && (
        <p className="text-center text-red-600">No students found</p>
      )}
      {!loading && students.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Student ID</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Course</th>
                <th className="border border-gray-300 p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="border border-gray-300 p-2">{student.id}</td>
                  <td className="border border-gray-300 p-2">{student.name}</td>
                  <td className="border border-gray-300 p-2">
                    {student.course}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {student.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
