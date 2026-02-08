"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ExcelUpload from "@/components/ExcelUpload";
import { useHulkFetch } from "hulk-react-utils";
import { UploadUrlProps } from "@/lib/types/uploads";
import { useCallback } from "react";
import { useRepo } from "@/lib/contexts/repo";


export default function UploadPage() {
  // const {
  //   dispatch: dispatchFileUpload,
  //   data: _,
  // } = useHulkFetch<UploadUrlProps>("/prod/uploads/ingest");

  const repo = useRepo();
  const handleFileUploaded = async (file: File, year: string, bank: string): Promise<string | null> => {
    console.log('File uploaded:', file.name);
    console.log('Date:', year);
    console.log('Bank:', bank);
    const fileUploadData = await repo.createUploadUrl(year, bank);
    if (fileUploadData?.url) {
      try {
        await repo.uploadFile(file, fileUploadData.url);
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