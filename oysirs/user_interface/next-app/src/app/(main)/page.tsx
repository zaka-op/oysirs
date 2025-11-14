"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useHulkFetch } from "hulk-react-utils";
import { UploadListProps } from "@/lib/types/uploads";
import { formatDate } from "@/lib/utils/intl";

export default function Home() {
  const {
    dispatch: dispatchUploads,
    data: uploadsData,
  } = useHulkFetch<UploadListProps>("/prod/uploads")
  useEffect(() => {
    dispatchUploads({
      method: "GET",
    });
  }, []);
  
  // const [stats, setStats] = useState({
  //   totalRecords: 127,
  //   processedRecords: 98,
  //   pendingRecords: 22,
  //   errorRecords: 7,
  //   storageUsed: "2.3 GB",
  //   storageLimit: "10 GB"
  // });

  // const [recentUploads, setRecentUploads] = useState([
  //   { id: "rec-124", title: "Data Record 124", date: "2025-09-12", status: "processed" },
  //   { id: "rec-125", title: "Data Record 125", date: "2025-09-13", status: "pending" },
  //   { id: "rec-126", title: "Data Record 126", date: "2025-09-14", status: "processed" },
  //   { id: "rec-127", title: "Data Record 127", date: "2025-09-15", status: "error" },
  // ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    totalRecords: uploadsData?.uploads.length || 0,
    processedRecords: uploadsData?.uploads.filter(u => u.status === "completed").length || 0,
    pendingRecords: uploadsData?.uploads.filter(u => u.status === "pending").length || 0,
    errorRecords: uploadsData?.uploads.filter(u => u.status === "failed").length || 0,
  };



  return (
    <main>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Records</h2>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-700">Processed</h2>
              <p className="text-3xl font-bold text-gray-900">{stats.processedRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-700">Pending</h2>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingRecords}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Uploads</h2>
              {/* <Link href="/records" className="text-sm text-blue-600 hover:text-blue-800">View all</Link> */}
              {/* Reload button */}
              <button
                onClick={() => dispatchUploads({ method: "GET" })}
                className="text-gray-400 hover:text-gray-600"
                title="Reload"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(uploadsData?.uploads.length || 0) > 0 ? (
                    uploadsData!.uploads.map((upload) => (
                      <tr key={upload.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{upload.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{upload.year}/{upload.bank}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(upload.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(upload.status)}`}>
                            {upload.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{upload.progress}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{upload.message}</td>
                      </tr>
                    ))) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        No uploads found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/upload"
                className="block p-6 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Upload New File</h3>
                    <p className="text-sm text-gray-500">Upload a new data file for processing</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/records"
                className="block p-6 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">View All Records</h3>
                    <p className="text-sm text-gray-500">Browse and manage your data records</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Storage Usage</h2>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {stats.storageUsed} of {stats.storageLimit} used
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round((parseInt(stats.storageUsed) / parseInt(stats.storageLimit)) * 100)}%
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div style={{ width: `${(parseInt(stats.storageUsed) / parseInt(stats.storageLimit)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Data Processing</p>
                  <p className="text-xs text-gray-500">All systems operational</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">File Storage</p>
                  <p className="text-xs text-gray-500">All systems operational</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Report Generation</p>
                  <p className="text-xs text-gray-500">All systems operational</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Data Validation</p>
                  <p className="text-xs text-gray-500">Experiencing delays</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


function calcTimeDiffMins(start: string, end: string) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round(diffMs / 60000); // convert ms to minutes
}