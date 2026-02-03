"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ExcelUpload from "@/components/ExcelUpload";
import { useHulkFetch } from "hulk-react-utils";
import { UploadUrlProps } from "@/lib/types/uploads";
import { useCallback } from "react";


export default function UploadPage() {
  const {
    dispatch: dispatchFileUpload,
    data: _,
  } = useHulkFetch<UploadUrlProps>("/prod/uploads/ingest");

  const handleFileUploaded = async (file: File, year: string, bank: string):Promise<string | null> => {
    console.log('File uploaded:', file.name);
    console.log('Date:', year);
    console.log('Bank:', bank);
    // In a real app, you would process the file here or send it to an API
    const fileUploadData = await dispatchFileUpload({
      method: "POST",
      body: JSON.stringify({ year, bank }),
      headers: {
        // Cors allow headers
        "Content-Type": "application/json",
      },
    });
    if (fileUploadData?.url) {
      try {
        const res = await fetch(fileUploadData.url, {
          method: "PUT",
          body: file,
        });
        if (!res.ok) {
          throw new Error(`Upload failed with status ${res.status}`);
        }
        return null; // Indicate success
      } catch (error) {
        console.error("Error uploading file to presigned URL:", error);
        return error instanceof Error ? error.message : "Unknown error occurred during file upload.";
      }
    }
    return "Failed to get upload URL.";
  };

  return (
    <ExcelUpload onFileUploaded={handleFileUploaded} />
  );
}