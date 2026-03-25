'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown } from 'lucide-react'

type Transaction = {
  id: string
  bankName: string
  payee: string
  address: string
  dvNumber: string
  particulars: string
  amount: number
  date: string
  checkNumber?: string
  controlNumber: string
  accountCode: string
  debit: number
  credit: number
  remarks: string
  createdAt: string
  userId: string
  fund: string
  responsibilityCenter?: string
  moph?: string
}

type ViewerTransactionTableProps = {
  transactions: Transaction[]
}

type SortField = 'date' | 'checkNumber' | 'dvNumber' | 'accountCode' | 'payee' | 'particulars' | 'amount' | 'remarks' | 'bankName' | 'controlNumber' | 'fund' | 'moph' | 'createdAt'

export default function ViewerTransactionTable({
  transactions,
}: ViewerTransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      // For date sorting, only consider Month and Year (ignore day)
      if (sortField === 'date') {
        const dateA = new Date(aVal as string)
        const dateB = new Date(bVal as string)
        
        // Zero out the day and time to only compare YYYY-MM
        const monthYearA = new Date(dateA.getFullYear(), dateA.getMonth(), 1).getTime()
        const monthYearB = new Date(dateB.getFullYear(), dateB.getMonth(), 1).getTime()
        
        return sortDirection === 'asc' ? monthYearA - monthYearB : monthYearB - monthYearA
      }

      if (sortField === 'createdAt') {
        const timeA = new Date(aVal as string).getTime()
        const timeB = new Date(bVal as string).getTime()
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA
      }

      if (typeof aVal === 'string' || typeof bVal === 'string') {
        const strA = (aVal as string) || ''
        const strB = (bVal as string) || ''
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA)
      }

      const numA = (aVal as number) || 0
      const numB = (bVal as number) || 0
      return sortDirection === 'asc' ? numA - numB : numB - numA
    })
    return sorted
  }, [transactions, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortableHeader = ({ label, field }: { label: string; field: SortField }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-2 py-2 text-left text-[11px] font-bold text-emerald-900 cursor-pointer hover:bg-emerald-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        {label}
        {sortField === field && <ArrowUpDown className="w-3 h-3" />}
      </div>
    </th>
  )
  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-emerald-100 rounded-xl p-8 text-center">
        <p className="text-gray-600">
          No transactions available. Select a data entry user to view their transactions.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-auto min-h-[450px] max-h-[600px] pb-[200px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-emerald-100 bg-emerald-100 sticky top-0">
              <SortableHeader label="Date" field="date" />
              <SortableHeader label="Check No." field="checkNumber" />
              <SortableHeader label="DV #" field="dvNumber" />
              <SortableHeader label="Control #" field="controlNumber" />
              <SortableHeader label="Account Code" field="accountCode" />
              <SortableHeader label="Fund" field="fund" />
              <SortableHeader label="MOPH" field="moph" />
              <th className="px-2 py-2 text-left text-[11px] font-bold text-emerald-900">Resp. Center</th>
              <SortableHeader label="Payee" field="payee" />
              <SortableHeader label="Particulars" field="particulars" />
              <th className="px-2 py-2 text-right text-[11px] font-bold text-emerald-900 cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => handleSort('amount')}>
                <div className="flex items-center gap-1 justify-end">
                  Amount
                  {sortField === 'amount' && <ArrowUpDown className="w-3 h-3" />}
                </div>
              </th>
              <SortableHeader label="Remarks" field="remarks" />
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((tx, idx) => (
              <tr
                key={tx.id}
                className={`border-b border-emerald-100 hover:bg-emerald-50 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f6f0]'
                }`}
              >
                <td className="px-2 py-2 text-[11px] text-gray-900 font-medium whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.checkNumber || '-'}</td>
                <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.dvNumber}</td>
                <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.controlNumber}</td>
                <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.accountCode}</td>
                <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.fund || '-'}</td>
                <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.moph || '-'}</td>
                <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap max-w-[100px] truncate">{tx.responsibilityCenter || '-'}</td>
                <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap max-w-[150px] truncate">{tx.payee}</td>
                <td className="px-2 py-2 text-[11px] text-gray-900 max-w-[180px] truncate">
                  {tx.particulars}
                </td>
                <td className="px-2 py-2 text-[11px] text-right text-gray-900 font-bold whitespace-nowrap">
                  {idx === 0 ? '₱ ' : ''}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-2 text-[11px] text-gray-600 max-w-[100px] truncate">{tx.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-emerald-50 border-t border-emerald-100 px-6 py-3">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-emerald-900">{transactions.length}</span> transactions
        </p>
      </div>
    </div>
  )
}
