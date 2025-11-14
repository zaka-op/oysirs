"use client";

import { useState } from "react";
import Link from "next/link";

interface RecordDetailProps {
  recordId?: string;
}

// Mock data for record details
const getMockRecordData = (id: string) => {
  return {
    id,
    title: `Data Record ${id.split('-')[1]}`,
    description: "This is a detailed description of the data record and its contents.",
    type: ["CSV", "Excel", "PDF", "ZIP"][Math.floor(Math.random() * 4)],
    status: ["processed", "pending", "error"][Math.floor(Math.random() * 3)],
    uploadedBy: "John Doe",
    dateUploaded: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateProcessed: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    size: Math.floor(Math.random() * 5000) + 100,
    fields: [
      { name: "ID", type: "String", sample: "001-ABC-123" },
      { name: "Name", type: "String", sample: "John Smith" },
      { name: "Age", type: "Number", sample: "42" },
      { name: "Email", type: "String", sample: "john.smith@example.com" },
      { name: "Registration Date", type: "Date", sample: "2023-05-12" },
      { name: "Status", type: "String", sample: "Active" }
    ],
    statistics: {
      totalRows: Math.floor(Math.random() * 10000) + 500,
      validRows: Math.floor(Math.random() * 9000) + 500,
      errorRows: Math.floor(Math.random() * 100),
      processingTime: `${Math.floor(Math.random() * 60) + 5} seconds`
    },
    validationResults: {
      errors: Math.floor(Math.random() * 10),
      warnings: Math.floor(Math.random() * 20),
      issues: [
        { type: "error", field: "Email", description: "Invalid email format", count: 3 },
        { type: "warning", field: "Age", description: "Age outside expected range", count: 7 },
        { type: "warning", field: "Name", description: "Name contains special characters", count: 2 }
      ]
    }
  };
};

export default function RecordDetail({ recordId = "rec-1" }: RecordDetailProps) {
  const record = getMockRecordData(recordId);
  const [activeTab, setActiveTab] = useState<"overview" | "data" | "validation">("overview");
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  
  const getIssueColor = (type: string) => {
    switch (type) {
      case "error": return "text-red-600";
      case "warning": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center mb-1">
              <Link href="/records" className="text-blue-600 hover:text-blue-800 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">{record.title}</h1>
            </div>
            <p className="text-gray-600">{record.description}</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Download Original
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Download Report
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex px-6">
          {["overview", "data", "validation"].map((tab) => (
            <button
              key={tab}
              className={`py-4 px-4 font-medium text-sm border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">File Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">ID</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.id}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.type}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm col-span-2">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Size</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{formatFileSize(record.size)}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.uploadedBy}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Date Uploaded</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.dateUploaded}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Date Processed</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.dateProcessed}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Processing Statistics</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Total Rows</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.statistics.totalRows.toLocaleString()}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Valid Rows</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.statistics.validRows.toLocaleString()}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Error Rows</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.statistics.errorRows.toLocaleString()}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Processing Time</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{record.statistics.processingTime}</dd>
                  </div>
                </dl>
              </div>
              
              <h3 className="text-lg font-medium mb-4 mt-6">Validation Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex mb-4">
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-red-600">{record.validationResults.errors}</div>
                    <div className="text-sm text-gray-500">Errors</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{record.validationResults.warnings}</div>
                    <div className="text-sm text-gray-500">Warnings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "data" && (
          <div>
            <h3 className="text-lg font-medium mb-4">Data Fields</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {record.fields.map((field, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.sample}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <h3 className="text-lg font-medium mb-4 mt-8">Data Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <p className="text-sm text-gray-500 mb-4">
                Here you would typically see a preview of the data. For this UI mockup, imagine a table with rows of sample data.
              </p>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {record.fields.map((field, index) => (
                      <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {field.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {record.fields.map((field, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {colIndex === 0 ? `00${rowIndex + 1}-ABC-123` : field.sample}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === "validation" && (
          <div>
            <h3 className="text-lg font-medium mb-4">Validation Issues</h3>
            
            {record.validationResults.issues.length === 0 ? (
              <p className="text-sm text-gray-500">No validation issues found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {record.validationResults.issues.map((issue, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex ${getIssueColor(issue.type)}`}>
                            {issue.type === "error" ? (
                              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            )}
                            <span className="text-sm font-medium capitalize">{issue.type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.field}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <h3 className="text-lg font-medium mb-4 mt-8">Error Rows</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-4">
                Here you would see a list of rows with validation errors. For this UI mockup, imagine a table with problematic rows highlighted.
              </p>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                    {record.fields.map((field, index) => (
                      <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {field.name}
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 3 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="bg-red-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rowIndex + 42}</td>
                      {record.fields.map((field, colIndex) => (
                        <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm ${
                          (colIndex === 2 && rowIndex === 0) || 
                          (colIndex === 0 && rowIndex === 1) || 
                          (colIndex === 3 && rowIndex === 2) 
                            ? 'text-red-500 font-medium' 
                            : 'text-gray-500'
                        }`}>
                          {colIndex === 0 ? `00${rowIndex + 42}-ABC-123` : 
                           (colIndex === 2 && rowIndex === 0) ? "Invalid" : 
                           (colIndex === 0 && rowIndex === 1) ? "Missing-ID" : 
                           (colIndex === 3 && rowIndex === 2) ? "not.an.email" : 
                           field.sample}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                        {rowIndex === 0 ? "Age outside valid range" : 
                         rowIndex === 1 ? "Missing required ID" : 
                         "Invalid email format"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}