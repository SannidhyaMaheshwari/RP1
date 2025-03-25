"use client";

import { useState } from "react";

export default function FeeDetails() {
  const [fees, setFees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false); // State for CSV download loading

  const fetchFees = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/fees?query=${searchQuery}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setFees(Array.isArray(data) ? data : [data]); // Ensure data is always an array
      }
    } catch (error) {
      console.error("Failed to fetch fee details", error);
    }
    setLoading(false);
  };

  // Convert fees data to CSV format
  const convertToCSV = (fees) => {
    const headers = [
      "Application Number",
      "Admission Fees Amount",
      "Admission Fees Status",
      "Admission Fees Paid Date",
      "Admission Fees Uploaded By",
      "Admission Fees Upload Date",
      "Tuition Fees Amount",
      "Tuition Fees Status",
      "Tuition Fees Paid Date",
      "Tuition Fees Uploaded By",
      "Tuition Fees Upload Date",
    ];
    const rows = fees.map((fee) => [
      fee.app_no,
      fee.admission_fees_amount,
      fee.admission_fees_status ? "Paid" : "Unpaid",
      new Date(fee.admission_fees_paid_date).toLocaleDateString(),
      fee.admission_fees_uploaded_by,
      new Date(fee.admission_fees_upload_date_time).toLocaleDateString(),
      fee.tution_fees_amount,
      fee.tution_fees_status ? "Paid" : "Unpaid",
      new Date(fee.tution_fees_paid_date).toLocaleDateString(),
      fee.tution_fees_uploaded_by,
      new Date(fee.tution_fees_upload_date_time).toLocaleDateString(),
    ]);

    // Combine headers and rows into a CSV string
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return csvContent;
  };

  // Function to trigger CSV download
  const downloadCSV = () => {
    setCsvLoading(true); // Start loading

    const csvContent = convertToCSV(fees);

    // Generate a timestamp for the file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `fee_details_${timestamp}.csv`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvLoading(false); // Stop loading
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
      <h1 className="text-3xl font-bold mb-4">Fee Details</h1>
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Enter Application Number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded w-64"
        />
        <button
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={fetchFees}
        >
          Search
        </button>
        {/* Show Download CSV button only after search and if there is data */}
        {searched && fees.length > 0 && (
          <button
            className={`ml-2 bg-green-600 text-white px-4 py-2 rounded ${
              csvLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={downloadCSV}
            disabled={csvLoading}
          >
            {csvLoading ? "Downloading..." : "Download CSV"}
          </button>
        )}
      </div>
      {loading && (
        <p className="text-center text-gray-600">Loading fee details...</p>
      )}
      {searched && fees.length === 0 && !loading && (
        <p className="text-center text-red-600">
          No fee details found. There is no data to download.
        </p>
      )}
      {!loading && fees.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">
                  Application Number
                </th>
                <th className="border border-gray-300 p-2">
                  Admission Fees Amount
                </th>
                <th className="border border-gray-300 p-2">
                  Admission Fees Status
                </th>
                <th className="border border-gray-300 p-2">
                  Admission Fees Paid Date
                </th>
                <th className="border border-gray-300 p-2">
                  Admission Fees Uploaded By
                </th>
                <th className="border border-gray-300 p-2">
                  Admission Fees Upload Date
                </th>
                <th className="border border-gray-300 p-2">
                  Tuition Fees Amount
                </th>
                <th className="border border-gray-300 p-2">
                  Tuition Fees Status
                </th>
                <th className="border border-gray-300 p-2">
                  Tuition Fees Paid Date
                </th>
                <th className="border border-gray-300 p-2">
                  Tuition Fees Uploaded By
                </th>
                <th className="border border-gray-300 p-2">
                  Tuition Fees Upload Date
                </th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0
                      ? "bg-white hover:bg-blue-100"
                      : "bg-blue-50 hover:bg-blue-100"
                  }
                >
                  <td className="border border-gray-300 p-2">{fee.app_no}</td>
                  <td className="border border-gray-300 p-2">
                    {fee.admission_fees_amount}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {fee.admission_fees_status ? "Paid" : "Unpaid"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(fee.admission_fees_paid_date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {fee.admission_fees_uploaded_by}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(fee.admission_fees_upload_date_time).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {fee.tution_fees_amount}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {fee.tution_fees_status ? "Paid" : "Unpaid"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(fee.tution_fees_paid_date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {fee.tution_fees_uploaded_by}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(fee.tution_fees_upload_date_time).toLocaleDateString()}
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