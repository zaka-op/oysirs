"use client";

import { useAuth } from "react-oidc-context";
import { useState } from "react";
import ReportDownload from "@/components/ReportDownload";
import { TrxnSummaryProps } from "@/lib/types/customers";
import { generateBankOptions } from "@/lib/utils/options";
import { formatCurrency } from "@/lib/utils/intl";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  bank: string;
}

interface TransactionSummary {
  bank: string;
  totalAmount: number;
  transactionCount: number;
}

interface TransactionTableProps {
  customerId: string;
  transactions: Transaction[];
  year: string;
  selectedBank: string;
}

// Generate mock transactions for a customer
export const generateMockTransactions = (customerId: string): Transaction[] => {
  const banks = ["First Bank", "GTBank", "Zenith Bank", "UBA", "Access Bank"];
  const years = ["2023", "2024", "2025"];
  
  return Array.from({ length: 50 }, (_, i) => {
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const year = years[Math.floor(Math.random() * years.length)];
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    
    return {
      id: `TXN-${customerId}-${i + 1}`,
      date,
      amount: Math.floor(Math.random() * 100000) / 100,
      bank,
    };
  });
};

// Get summarized transaction data grouped by bank
export const getTransactionSummary = (transactions: Transaction[]): TransactionSummary[] => {
  const summaryMap = new Map<string, { totalAmount: number; transactionCount: number }>();
  
  transactions.forEach(transaction => {
    const existing = summaryMap.get(transaction.bank);
    if (existing) {
      existing.totalAmount += transaction.amount;
      existing.transactionCount += 1;
    } else {
      summaryMap.set(transaction.bank, {
        totalAmount: transaction.amount,
        transactionCount: 1
      });
    }
  });
  
  return Array.from(summaryMap.entries()).map(([bank, data]) => ({
    bank,
    totalAmount: data.totalAmount,
    transactionCount: data.transactionCount
  }));
};

export function TransactionSummaryTables({ summaryData, customerId }: { summaryData?: TrxnSummaryProps[]; customerId: string }) {
  return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transaction Summary</h2>
          <ReportDownload recordId={customerId} />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Transactions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(summaryData?.length ?? 0) > 0 ? (
                summaryData!.map((summary) => (
                  <tr key={summary.bank} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {generateBankOptions().find(b => b.value === summary.bank)?.label || summary.bank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {summary.total_trxns}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(summary.total_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transaction data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}


export function TransactionTables({ customerId, transactions, year, selectedBank }: TransactionTableProps) {
  // Filter transactions based on selected year and bank
  const filteredTransactions = transactions.filter(txn => {
    const txnYear = txn.date.split('-')[0];
    const yearMatch = year === "all" || txnYear === year;
    const bankMatch = selectedBank === "all" || txn.bank === selectedBank;
    return yearMatch && bankMatch;
  });
  
  // Get transaction summary data
  const summaryData = getTransactionSummary(filteredTransactions);
  
  // Format currency amount
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Transaction Summary Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transaction Summary</h2>
          <ReportDownload recordId={customerId} />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Transactions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaryData.length > 0 ? (
                summaryData.map((summary) => (
                  <tr key={summary.bank} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {summary.bank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {summary.transactionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(summary.totalAmount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transaction data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detailed Transactions Section - Only visible to Admin users */}
      {true && (
        <div>
          {summaryData.map((bankSummary) => {
            // Filter transactions for this bank
            const bankTransactions = filteredTransactions.filter(txn => txn.bank === bankSummary.bank);
            
            if (bankTransactions.length === 0) return null;
            
            return (
              <div key={bankSummary.bank} className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">{bankSummary.bank} Transactions</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bankTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Show message for staff users about detailed transactions */}
      {!true && filteredTransactions.length > 0 && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Detailed transaction records are only available to admin users. You can still download the full report for this customer.</p>
          </div>
        </div>
      )}
    </div>
  );
}