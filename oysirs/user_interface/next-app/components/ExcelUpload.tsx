"use client";

import { generateBankOptions, generateRequiredTxnColumns, generateYearOptions } from "@/lib/utils/options";
import Link from "next/link";
import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import * as XLSX from "xlsx";


const REQUIRED_COLUMNS = generateRequiredTxnColumns();

interface ExcelUploadProps {
  onFileUploaded?: (file: File, year: string, bank: string) => Promise<string | null>;
}

export default function ExcelUpload({ onFileUploaded }: ExcelUploadProps) {
  // Available options for year and bank
  const years = generateYearOptions();
  const banks = generateBankOptions().slice(1); // Exclude "All Banks" option for upload context
  // State variables
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(years[0]);
  const [selectedBank, setSelectedBank] = useState<string>(banks[0].value);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSize = process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB
    ? parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB) * 1024 * 1024
    : 10 * 1024 * 1024; // Default to 10MB if not set
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = async (file: File): Promise<boolean> => {
    // Check file type
    const validExcelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];

    setIsValidating(true);
    setError(null);
    
    if (!validExcelTypes.includes(file.type)) {
      setError("Please upload a valid Excel file (.xls, .xlsx)");
      setIsValidating(false);
      return false;
    }
    
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`);
      setIsValidating(false);
      return false;
    }

    // Parse and validate required columns
    // Read file as ArrayBuffer
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    // Check header row for required columns
    const headerRow = json[0] || [];
    const missing = REQUIRED_COLUMNS.filter(col => !headerRow.includes(col));
    if (missing.length > 0) {
      setError(`Missing required columns: ${missing.join(", ")}`);
      setIsValidating(false);
      return false;
    }
    
    setIsValidating(false);
    return true;
  };

  const handleFile = async (file: File) => {
    if (!selectedYear || !selectedBank) {
      setError("Please select both year and bank before uploading");
      return;
    }

    // Show the file name immediately
    setSelectedFileName(file.name);

    if (await validateFile(file)) {
      setFile(file);
      setSelectedFileName(null);
    } else {
      setSelectedFileName(null);
    }
  };

  const handleConfirmUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    if (onFileUploaded) {
      const err = await onFileUploaded(file, selectedYear, selectedBank);
      setIsUploading(false);
      if (err) {
        setError(err);
        return;
      }
      setIsComplete(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setIsValidating(false);
    setIsUploading(false);
    setIsComplete(false);
    setSelectedFileName(null);
    // Don't reset year and bank selections to maintain user convenience
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Upload Customer Data</h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Upload your customer data spreadsheet in Excel format (.xlsx or .xls). 
        The system will analyze the data and structure it for easy access and reporting.
      </p>

      {/* Select Year and Bank you're uploading for */}
      <div className="mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
        <h3 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3">Select Year and Bank</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="yearSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="yearSelect"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={isUploading || isComplete}
            >
              <option value="" disabled>Select Year</option>
              {years.map(year => {
                // Add a special marker for current year
                const isCurrent = year === new Date().getFullYear().toString();
                return (
                  <option key={year} value={year}>
                    {year} {isCurrent ? "(Current)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div>
            <label htmlFor="bankSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Bank
            </label>
            <select
              id="bankSelect"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              disabled={isUploading || isComplete}
            >
              <option value="" disabled>Select Bank</option>
              {banks.map(bank => (
                <option key={bank.value} value={bank.value}>{bank.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          The data will be categorized under the selected year and bank. You can select any year from 2010 to the current year.
        </p>
      </div>
      
      {!file ? (
        <>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 mb-4 sm:mb-6 text-center cursor-pointer transition-colors ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept=".xls,.xlsx,.xlsm"
            />
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-base sm:text-lg font-medium text-gray-700">
                {isDragging ? "Drop Excel file here" : "Drag and drop Excel file here"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">or</p>
              <button className="mt-2 px-4 py-2 text-xs sm:text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                Browse Excel Files
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: .xlsx, .xls (Max size: {formatFileSize(maxSize)})
              </p>
              {error && (
                <p className="text-xs sm:text-sm text-red-600 mt-2">{error}</p>
              )}
            </div>
          </div>

          {/* Processing message */}
          {selectedFileName && (
            <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Processing file: <span className="font-semibold">{selectedFileName}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Please wait while we validate your file...
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mb-4 sm:mb-6">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-start sm:items-center mb-4">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold truncate">{file.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{formatFileSize(file.size)}</p>
                <div className="flex flex-wrap mt-1 text-xs gap-1 sm:gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Year: {selectedYear}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded truncate max-w-[200px]">
                    Bank: {banks.find(b => b.value === selectedBank)?.label || selectedBank}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                disabled={isUploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {isValidating && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <span className="text-xs sm:text-sm font-medium text-blue-600">Validating file...</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 animate-progress"></div>
                </div>
              </div>
            )}

            {!isValidating && !isUploading && !isComplete && (
              <div className="mt-4">
                <button
                  onClick={handleConfirmUpload}
                  className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Confirm and Upload File
                </button>
                {error && (
                  <p className="text-xs sm:text-sm text-red-600 mt-2 text-center">{error}</p>
                )}
              </div>
            )}
            
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <span className="text-xs sm:text-sm font-medium text-blue-600">Uploading to server...</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 animate-progress"></div>
                </div>
              </div>
            )}
            
            {isComplete && (
              <div className="mt-4 flex items-start text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">
                  Upload complete! The data will be processed, you can track its status in the dashboard.
                  <br className="hidden sm:block" />
                  {/* Go to dashboard */}
                  <Link href="/" className="text-blue-600 hover:underline ml-0 sm:ml-1 inline-block mt-1 sm:mt-0">
                    View Dashboard
                  </Link>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
        <h3 className="text-base sm:text-lg font-semibold mb-2">Template Guide</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">
          Please ensure your Excel file follows our template format. The spreadsheet should contain the following columns:
        </p>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Required Columns:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Full Name [NAME]</li>
                <li>Email Address [EMAIL]</li>
                <li>Mobile Number [MOBILE_NO]</li>
                <li>Address [ADDRESS]</li>
                <li>Tax ID [TAX_ID] (Optional)</li>
                <li>TIN [TIN] (Optional)</li>
                <li>RC [RC] (Optional)</li>
                <li>Transaction Date [TRXN_DATE]</li>
                <li>Transaction Amount [TRXN_AMOUNT]</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Important Notes:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Data will be categorized under the selected year and bank</li>
                <li>Transaction dates should be in YYYY-MM-DD format</li>
                <li>Phone number should include country code, e.g. 2348012345678</li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            {/* <button className="text-blue-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Download Template
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}