"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CustomerProps, CustomerListProps } from "@/lib/types/customers";
import { useHulkFetch } from "hulk-react-utils";

// Mock data for demonstration
// const mockCustomers: Customer[] = Array.from({ length: 50 }, (_, i) => ({
//   id: `CUST-${10000 + i}`,
//   fullNames: [
//     `Customer ${i + 1}`,
//     `Alt Name ${i + 1}`,
//   ],
//   emails: [
//     `customer${i + 1}@example.com`,
//     `alt${i + 1}@example.com`,
//   ],
//   mobileNos: [
//     `+234 ${800 + Math.floor(Math.random() * 100)} ${1000000 + Math.floor(Math.random() * 9000000)}`,
//     `+234 ${900 + Math.floor(Math.random() * 100)} ${2000000 + Math.floor(Math.random() * 8000000)}`,
//   ],
//   addresses: [
//     `${Math.floor(Math.random() * 100) + 1} Main Street, Lagos, Nigeria`,
//     `${Math.floor(Math.random() * 100) + 1} Second Ave, Abuja, Nigeria`,
//   ],
// }));

// Export the mock data function for static generation
// export const getMockCustomers = () => mockCustomers;

type SearchField = "email" | "mobile_no" | "name";

export default function CustomersList() {
  const [searchField, setSearchField] = useState<SearchField>("email");
  const [searchValue, setSearchValue] = useState("");

  const {
    dispatch: dispatchCustomerList,
    data: customerListData,
  } = useHulkFetch<CustomerListProps>("prod/customers");

  // const [currentPage, setCurrentPage] = useState(1);
  // const customersPerPage = 10;

  // Filter customers based on search
  // const filteredCustomers = mockCustomers.slice(0,20);
  useEffect(() => {
    dispatchCustomerList({
      method: "GET",
    })
  }, []);
  

  // Pagination
  const limit = customerListData?.limit || 10;
  const offset = customerListData?.offset || 0;
  const totalCount = customerListData?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    const newOffset = (pageNumber - 1) * limit;
    const query: any = {
      offset: newOffset,
    };
    if (searchValue) {
      query[searchField] = searchValue;
    }

    dispatchCustomerList({
      method: "GET",
      query: query
    })
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchCustomerList({
      method: "GET",
      query: {
        [searchField]: searchValue
      }
    })
  }

  const handleReset = () => {
    setSearchValue("");
    dispatchCustomerList({
      method: "GET",
    })
  }

  if (!customerListData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with Search Filters */}
      <form className="p-4 sm:p-6 border-b" onSubmit={handleSearch}>
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Customers</h1>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="searchField" className="block text-sm font-medium text-gray-700 mb-1">
                Search By
              </label>
              <select
                id="searchField"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as SearchField)}
              >
                <option value="email">Email</option>
                <option value="mobile_no">Mobile Number</option>
                <option value="name">Name</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="searchValue" className="block text-sm font-medium text-gray-700 mb-1">
                Search Value
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="searchValue"
                  placeholder={`Search by ${searchField}...`}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    // setCurrentPage(1); // Reset to first page on new search
                  }}
                />
                {searchValue && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchValue("")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="w-full sm:flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              // onClick={() => setCurrentPage(1)} // Reset to first page on search
            >
              Search
            </button>
            <button
              type="button"
              className="w-full sm:flex-1 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
      
      {/* Customers Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Customer ID
              </th>
              <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Full Name
              </th>
              <th scope="col" className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th scope="col" className="hidden md:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Mobile No
              </th>
              <th scope="col" className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Address
              </th>
              {/* Actions column removed */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(customerListData?.customers.length ?? 0) > 0 ? (
              customerListData!.customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link
                      href={`/customers/detail?id=${customer.id}`}
                      className="text-blue-600 hover:text-blue-900 underline uppercase"
                    >
                      Customer {customer.id}
                    </Link>
                  </td>
                  <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select className="w-full min-w-[120px] bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded">
                      {customer.names.map((item, idx) => (
                        <option key={idx} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select className="w-full min-w-[150px] bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded">
                      {customer.emails.map((item, idx) => (
                        <option key={idx} value={item.email}>{item.email}</option>
                      ))}
                    </select>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select className="w-full min-w-[120px] bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded">
                      {customer.mobiles.map((item, idx) => (
                        <option key={idx} value={item.mobile_no}>{item.mobile_no}</option>
                      ))}
                    </select>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <select className="w-full min-w-[150px] bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded truncate">
                      {customer.addresses.map((item, idx) => (
                        <option key={idx} value={item.address} className="truncate">{item.address}</option>
                      ))}
                    </select>
                  </td>
                  {/* Actions column removed */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    No customers found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing <span className="font-medium">{ offset+1 }</span> to{" "}
            <span className="font-medium">{Math.min(offset + limit, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> customers
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">&lt;</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">&gt;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}