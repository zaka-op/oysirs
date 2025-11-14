"use client";

import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import RecordDetail from "@/components/RecordDetail";
import ReportDownload from "@/components/ReportDownload";
import Link from "next/link";
import { Suspense } from "react";

function Record() {
  const searchParams = useSearchParams();
  const recordId = searchParams?.get('id') || '';

  if (!recordId) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Record Not Found</h1>
        <p className="text-gray-600 mb-4">No record ID was provided.</p>
        <Link href="/records" className="text-blue-600 hover:underline">
          &larr; Back to Records
        </Link>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex justify-between items-center">
        <Link href="/records" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Records
        </Link>
        <ReportDownload recordId={recordId} />
      </div>
      <RecordDetail recordId={recordId} />
    </DashboardLayout>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}><Record /></Suspense>
  );
}