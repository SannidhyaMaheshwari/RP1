// components/IterationDetails.tsx
"use client";

import { useEffect, useState } from "react";

export default function IterationDetails() {
  const [iterations, setIterations] = useState([]);
  const [iterationCount, setIterationCount] = useState(0);
  const [selectedIteration, setSelectedIteration] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchIterationCount = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/iteration-count", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setIterationCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch iteration count", error);
      }
    };
    fetchIterationCount();
  }, []);

  const fetchIterations = async (iterationNumber) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/iterations?iteration=${iterationNumber}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setIterations(data);
        setSelectedIteration(iterationNumber);
      }
    } catch (error) {
      console.error("Failed to fetch iteration details", error);
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
      <h1 className="text-3xl font-bold mb-4">Iteration Details</h1>
      {iterationCount > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {[...Array(iterationCount).keys()].map((i) => (
            <button
              key={i + 1}
              className={`px-4 py-2 rounded ${
                selectedIteration === i + 1
                  ? "bg-blue-700 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={() => fetchIterations(i + 1)}
            >
              Iteration {i + 1}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-red-600">
          No iterations have been conducted yet.
        </p>
      )}
      {loading && (
        <p className="text-center text-gray-600">
          Loading iteration details...
        </p>
      )}
      {!loading && iterations.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">
                  Application Number
                </th>
                <th className="border border-gray-300 p-2">Iteration Number</th>
                <th className="border border-gray-300 p-2">Offer</th>
                <th className="border border-gray-300 p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {iterations.map((iteration, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    {iteration.applicationNumber}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {iteration.iterationNumber}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {iteration.offer}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {iteration.status}
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
