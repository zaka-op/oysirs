"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionSummaryTables } from "@/components/TransactionTables";
import Link from "next/link";
import { useHulkFetch } from "hulk-react-utils";
import { CustomerWithTrxnSummaryProps } from "@/lib/types/customers";
import { generateYearOptions, generateBankOptions } from "@/lib/utils/options";


function CustomerDetail() {
  const searchParams = useSearchParams();
  const customerId = searchParams?.get('id') || '';
  // Available options for year and bank
  const years = generateYearOptions();
  const banks = generateBankOptions();
  // State for filters
  const [selectedYear, setSelectedYear] = useState<string>(years[0]);
  const [selectedBank, setSelectedBank] = useState<string>(banks[0].value);

  const {
    dispatch: dispatchCustomerSummary,
    data: customerSummaryData,
  } = useHulkFetch<CustomerWithTrxnSummaryProps>(`/prod/customers/${customerId}`);

  useEffect(() => {
    if (customerId) {
      const query: any = {};
      if (selectedYear) {
        query.year = selectedYear;
      }
      if (selectedBank) {
        query.bank = selectedBank;
      }

      dispatchCustomerSummary({
        method: "GET",
        query: query,
      });
    }
  }, [customerId, selectedYear, selectedBank]);

  // Fetch customer data (mock)
  // useEffect(() => {
  //   // Return early if no customerId
  //   if (!customerId) {
  //     setLoading(false);
  //     return;
  //   }

  //   // Simulate API call delay
  //   const timer = setTimeout(() => {
  //     // Generate mock customer data
  //     const mockCustomer: Customer = {
  //       id: customerId,
  //       fullNames: [
  //         `Customer ${customerId.split('-')[1] || customerId}`,
  //         `Alt Name ${customerId.split('-')[1] || customerId}`,
  //       ],
  //       emails: [
  //         `customer${customerId.split('-')[1] || customerId}@example.com`,
  //         `alt${customerId.split('-')[1] || customerId}@example.com`,
  //       ],
  //       mobileNos: [
  //         `+234 ${800 + Math.floor(Math.random() * 100)} ${1000000 + Math.floor(Math.random() * 9000000)}`,
  //         `+234 ${900 + Math.floor(Math.random() * 100)} ${2000000 + Math.floor(Math.random() * 8000000)}`,
  //       ],
  //       addresses: [
  //         `${Math.floor(Math.random() * 100) + 1} Main Street, Lagos, Nigeria`,
  //         `${Math.floor(Math.random() * 100) + 1} Second Ave, Abuja, Nigeria`,
  //       ],
  //     };

  //     setCustomer(mockCustomer);
  //     setTransactions(generateMockTransactions(customerId));
  //     setLoading(false);
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [customerId]);

  if (!customerSummaryData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="mb-4">
        <Link href="/customers" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Customers
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Filter Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="yearFilter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bankFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Bank
            </label>
            <select
              id="bankFilter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              {banks.map(bank => (
                <option key={bank.value} value={bank.value}>{bank.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer ID</h3>
              <p className="mt-1 text-sm text-gray-900">{customerSummaryData.customer?.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Full Name(s)</h3>
              <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                {customerSummaryData.customer?.names.map((item, idx) => (
                  <li key={idx}>{item.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email Address(es)</h3>
              <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                {customerSummaryData.customer?.emails.map((item, idx) => (
                  <li key={idx}>{item.email}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Mobile Number(s)</h3>
              <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                {customerSummaryData.customer?.mobiles.map((item, idx) => (
                  <li key={idx}>{item.mobile_no}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address(es)</h3>
              <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                {customerSummaryData.customer?.addresses.map((item, idx) => (
                  <li key={idx}>{item.address}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Tables */}
      <TransactionSummaryTables
        customerId={customerId}
        summaryData={customerSummaryData.trxn_summary}
      />
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}><CustomerDetail /></Suspense>
  );
}