'use client'

import { useState, useMemo } from 'react'
import { X, ArrowUpDown, Trash2, Edit2, CreditCard, User, FileText, Landmark, Wallet, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  fund: string
  responsibilityCenter?: string
  moph?: string
}

type TransactionTableProps = {
  transactions: Transaction[]
  onTransactionDeleted?: () => void
  onTransactionUpdated?: () => void
}

type SortField = 'date' | 'checkNumber' | 'dvNumber' | 'accountCode' | 'payee' | 'particulars' | 'amount' | 'remarks' | 'bankName' | 'controlNumber' | 'fund' | 'moph' | 'createdAt'

export default function TransactionTable({ transactions, onTransactionDeleted, onTransactionUpdated }: TransactionTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Transaction> | null>(null)
  const [isCustomBank, setIsCustomBank] = useState(false)

  const standardBanks = [
    'DBP',
    'BDO',
    'BPI',
    'Metrobank',
  ]

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

  const handleEditStart = () => {
    if (selectedTransaction) {
      setEditFormData({ ...selectedTransaction })
      setIsEditing(true)
      setIsCustomBank(false)
    }
  }

  const handleEditChange = (field: keyof Transaction, value: any) => {
    setEditFormData(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleEditSave = async () => {
    if (!editFormData || !selectedTransaction) return

    setIsEditing(false)
    try {
      const response = await fetch(`/api/transactions?id=${selectedTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update transaction')
      }

      const updatedTx = await response.json()
      setSelectedTransaction(updatedTx)
      setEditFormData(null)
      onTransactionUpdated?.()
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert(`Error updating transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async () => {
    if (!selectedTransaction) return

    if (!confirm('Are you sure you want to delete this transaction?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/transactions?id=${selectedTransaction.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete transaction')
      }

      setSelectedTransaction(null)
      setIsEditing(false)
      onTransactionDeleted?.()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert(`Error deleting transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const SortableHeader = ({ label, field }: { label: string; field: SortField }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-2 py-2 text-left text-[11px] font-bold text-emerald-900 cursor-pointer hover:bg-emerald-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        {label}
        {sortField === field && <ArrowUpDown className="w-4 h-4" />}
      </div>
    </th>
  )

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-emerald-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">No transactions yet. Add one to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Table */}
      <div className="flex-1 bg-white border border-emerald-100 rounded-lg overflow-hidden shadow-sm">
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
                  onClick={() => setSelectedTransaction(tx)}
                  className={`border-b border-emerald-100 cursor-pointer transition-colors ${
                    selectedTransaction?.id === tx.id
                      ? 'bg-emerald-100'
                      : idx % 2 === 0
                        ? 'bg-white hover:bg-emerald-50'
                        : 'bg-[#f9f6f0] hover:bg-emerald-50'
                  }`}
                >
                  <td className="px-2 py-2 text-[11px] text-gray-900 font-medium whitespace-nowrap">{new Date(tx.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.checkNumber || '-'}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.dvNumber}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.controlNumber}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.accountCode}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.fund || '-'}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap">{tx.moph || '-'}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap max-w-[100px] truncate">{tx.responsibilityCenter || '-'}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 whitespace-nowrap max-w-[150px] truncate">{tx.payee}</td>
                  <td className="px-2 py-2 text-[11px] text-gray-900 max-w-[180px] truncate">{tx.particulars}</td>
                  <td className="px-2 py-2 text-[11px] text-right text-gray-900 font-bold whitespace-nowrap">
                    {idx === 0 ? '₱ ' : ''}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-2 text-[11px] text-gray-600 max-w-[100px] truncate">{tx.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Panel */}
      {selectedTransaction && (
        <div className="w-[450px] bg-slate-50 border-l border-emerald-100 h-full overflow-hidden flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
          {/* Panel Header */}
          <div className="bg-white border-b border-emerald-100 p-6 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">
                {isEditing ? 'Edit Transaction' : 'Transaction Details'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ID: {selectedTransaction.id.slice(0, 8)}...
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedTransaction(null)
                setIsEditing(false)
                setEditFormData(null)
                setIsCustomBank(false)
              }}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isEditing && editFormData ? (
              <div className="space-y-6 pb-20">
                {/* Edit Form - Group 1: Source */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Information</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Date</label>
                        <input
                          type="date"
                          value={editFormData.date || ''}
                          onChange={(e) => handleEditChange('date', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Bank Name</label>
                        {!isCustomBank ? (
                          <Select 
                            value={(editFormData.bankName === 'Landbank - 43' || editFormData.bankName === 'Landbank - 45' || standardBanks.includes(editFormData.bankName as string)) ? editFormData.bankName as string : (editFormData.bankName ? 'custom_prefill' : '')} 
                            onValueChange={(val) => {
                              if (val === 'add_new') {
                                setIsCustomBank(true)
                                handleEditChange('bankName', '')
                              } else {
                                handleEditChange('bankName', val === 'custom_prefill' ? editFormData.bankName : val)
                                if (val === 'Landbank - 43' && !(editFormData as any).checkNumber) handleEditChange('checkNumber' as any, '43')
                                if (val === 'Landbank - 45' && !(editFormData as any).checkNumber) handleEditChange('checkNumber' as any, '45')
                              }
                            }}
                          >
                            <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200">
                              <SelectValue placeholder="Select Bank" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="top" className="max-h-[140px] overflow-y-auto">
                              <SelectGroup>
                                <SelectLabel className="font-bold text-emerald-800">Landbank</SelectLabel>
                                <SelectItem value="Landbank - 43">Landbank - 43</SelectItem>
                                <SelectItem value="Landbank - 45">Landbank - 45</SelectItem>
                              </SelectGroup>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <SelectGroup>
                                {standardBanks.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectGroup>
                              {editFormData.bankName && !['Landbank - 43', 'Landbank - 45', ...standardBanks].includes(editFormData.bankName) && (
                                <SelectItem value="custom_prefill" className="hidden">{editFormData.bankName}</SelectItem>
                              )}
                              <div className="h-px bg-slate-100 my-1"></div>
                              <SelectItem value="add_new" className="text-emerald-600 font-medium">+ Add New...</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editFormData.bankName || ''}
                              onChange={(e) => handleEditChange('bankName', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                              autoFocus
                            />
                            <button type="button" onClick={() => setIsCustomBank(false)} className="text-[10px] text-slate-400 hover:text-emerald-600 underline">Return to list</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Check Number</label>
                        <input
                          type="text"
                          value={(editFormData as any).checkNumber || ''}
                          onChange={(e) => handleEditChange('checkNumber' as any, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Control Number</label>
                        <input
                          type="text"
                          value={editFormData.controlNumber || ''}
                          onChange={(e) => handleEditChange('controlNumber', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form - Group 2: Entity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Beneficiary</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Payee Name</label>
                      <input
                        type="text"
                        value={editFormData.payee || ''}
                        onChange={(e) => handleEditChange('payee', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Address</label>
                      <input
                        type="text"
                        value={editFormData.address || ''}
                        onChange={(e) => handleEditChange('address', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Edit Form - Group 3: Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction Details</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">DV Number</label>
                        <input
                          type="text"
                          value={editFormData.dvNumber || ''}
                          onChange={(e) => handleEditChange('dvNumber', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Resp. Center</label>
                        <input
                          type="text"
                          value={(editFormData as any).responsibilityCenter || ''}
                          onChange={(e) => handleEditChange('responsibilityCenter' as any, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Particulars</label>
                      <textarea
                        value={editFormData.particulars || ''}
                        onChange={(e) => handleEditChange('particulars', e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Edit Form - Group 4: Financials */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Financials</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Total Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.amount || ''}
                        onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
                        className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Fund</label>
                        <Select
                          disabled={!!(editFormData as any).moph}
                          value={editFormData.fund || 'none'}
                          onValueChange={(val) => handleEditChange('fund', val === 'none' ? '' : val)}
                        >
                          <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Fund" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="top" className="max-h-[140px] overflow-y-auto">
                            <SelectItem value="none" className="italic text-slate-400">-- None --</SelectItem>
                            {['General Fund', 'Development Fund', 'Trust Fund', 'Hospital Fund'].map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">MOPH</label>
                        <Select
                          disabled={!!editFormData.fund && editFormData.fund !== 'none'}
                          value={(editFormData as any).moph || 'none'}
                          onValueChange={(val) => handleEditChange('moph' as any, val === 'none' ? '' : val)}
                        >
                          <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200">
                            <SelectValue placeholder="MOPH" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="top" className="max-h-[140px] overflow-y-auto">
                            <SelectItem value="none" className="italic text-slate-400">-- None --</SelectItem>
                            {['Initao', 'Balingasag', 'Gingoog', 'Manticao', 'Talisayan', 'Claveria', 'Magsaysay', 'Alubijid'].map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Debit</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.debit || ''}
                          onChange={(e) => handleEditChange('debit', parseFloat(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Credit</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.credit || ''}
                          onChange={(e) => handleEditChange('credit', parseFloat(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Account Code</label>
                      <input
                        type="text"
                        value={editFormData.accountCode || ''}
                        onChange={(e) => handleEditChange('accountCode', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Edit Form - Group 5: Remarks */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Remarks</span>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={editFormData.remarks || ''}
                      onChange={(e) => handleEditChange('remarks', e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none"
                      placeholder="Enter remarks..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                {/* View Details - Group 1: Source */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Information</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Date</p>
                      <p className="text-sm font-medium text-slate-900">{new Date(selectedTransaction.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Bank Name</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTransaction.bankName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Check No.</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTransaction.checkNumber || '-'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Control No.</p>
                      <p className="text-sm font-medium text-slate-900">{selectedTransaction.controlNumber}</p>
                    </div>
                  </div>
                </div>

                {/* View Details - Group 2: Entity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Beneficiary</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Payee Name</p>
                      <p className="text-sm font-bold text-slate-900 leading-snug">{selectedTransaction.payee}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Address</p>
                      <p className="text-sm font-medium text-slate-700 italic">{selectedTransaction.address || 'No address provided'}</p>
                    </div>
                  </div>
                </div>

                {/* View Details - Group 3: Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction Details</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">DV Number</p>
                        <p className="text-sm font-medium text-slate-900">{selectedTransaction.dvNumber || '-'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Resp. Center</p>
                        <p className="text-sm font-medium text-slate-900">{(selectedTransaction as any).responsibilityCenter || '-'}</p>
                      </div>
                    </div>
                    <div className="space-y-0.5 pt-2 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Particulars</p>
                      <p className="text-sm text-slate-700 leading-relaxed italic">{selectedTransaction.particulars}</p>
                    </div>
                  </div>
                </div>

                {/* View Details - Group 4: Financials */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Financials</span>
                  </div>
                  <div className="p-0">
                    <div className="p-4 bg-emerald-50 flex justify-between items-center border-b border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Total Amount</p>
                      <p className="text-xl font-black text-emerald-900">₱ {selectedTransaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-y-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Fund</p>
                        <p className="text-sm font-semibold text-slate-900">{selectedTransaction.fund || '-'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">MOPH Loc.</p>
                        <p className="text-sm font-semibold text-slate-900">{selectedTransaction.moph || '-'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Debit</p>
                        <p className="text-sm font-medium text-slate-900">{selectedTransaction.debit > 0 ? `₱ ${selectedTransaction.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Credit</p>
                        <p className="text-sm font-medium text-slate-900">{selectedTransaction.credit > 0 ? `₱ ${selectedTransaction.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</p>
                      </div>
                      <div className="space-y-0.5 col-span-2 pt-2 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Account Code</p>
                        <p className="text-sm font-mono font-bold text-slate-700">{selectedTransaction.accountCode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Details - Group 5: Remarks */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Remarks</span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                      {selectedTransaction.remarks || 'No additional remarks.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Floating at bottom */}
          <div className="bg-white border-t border-emerald-100 p-6 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
            {isEditing ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleEditSave}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setEditFormData(null)
                  }}
                  variant="outline"
                  className="flex-1 text-slate-600 border-slate-200 font-bold h-11"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleEditStart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Update
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold h-11 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
