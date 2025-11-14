"use client";

import { useState } from "react";

interface ReportDownloadProps {
  recordId: string;
}

export default function ReportDownload({ recordId }: ReportDownloadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");
  const [includeData, setIncludeData] = useState(true);
  const [includeValidation, setIncludeValidation] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleDownload = () => {
    setIsGenerating(true);
    
    // Simulate report generation and download
    setTimeout(() => {
      setIsGenerating(false);
      
      // In a real application, this would trigger a download from the server
      // For now, we'll just close the modal
      setIsModalOpen(false);
      
      // Show notification of successful download
      alert(`Report for ${recordId} has been downloaded in ${selectedFormat.toUpperCase()} format.`);
    }, 2000);
  };
  
  return (
    <>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Report
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Download Report</h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {["pdf", "excel", "csv"].map((format) => (
                    <button
                      key={format}
                      className={`py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                        selectedFormat === format
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Contents</label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="include-summary"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                    />
                    <label htmlFor="include-summary" className="ml-2 block text-sm text-gray-700">
                      Include Summary Statistics
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="include-data"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={includeData}
                      onChange={(e) => setIncludeData(e.target.checked)}
                    />
                    <label htmlFor="include-data" className="ml-2 block text-sm text-gray-700">
                      Include Data Preview
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="include-validation"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={includeValidation}
                      onChange={(e) => setIncludeValidation(e.target.checked)}
                    />
                    <label htmlFor="include-validation" className="ml-2 block text-sm text-gray-700">
                      Include Validation Results
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleDownload}
                  disabled={isGenerating || (!includeData && !includeValidation && !includeSummary)}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Report...
                    </>
                  ) : (
                    "Download Report"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}