'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Check, X } from 'lucide-react'

type Transaction = {
  id: string
  batchTransactionId: string
  bankName: string
  payee: string
  address: string
  dvNumber: string
  particulars: string
  amount: number
  date: string
  controlNumber: string
  accountCode: string
  debit: number
  credit: number
  remarks: string
  fund: string
}

type Batch = {
  id: string
  viewerId: string
  entryUserId: string
  batchName: string
  transactionCount: number
  totalAmount: number
  appliedFilters: string
  createdAt: string
}

interface BatchDetailsProps {
  batch: Batch
  onBack: () => void
  onRestoreSuccess: () => void
}

export default function BatchDetails({
  batch,
  onBack,
  onRestoreSuccess,
}: BatchDetailsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set()
  )
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreConfirm, setRestoreConfirm] = useState(false)

  const fetchBatchDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/batches/${batch.id}`)
      if (!response.ok) throw new Error('Failed to fetch batch details')
      const data = await response.json()
      setTransactions(data.transactions)
    } catch (error) {
      console.error('Error fetching batch details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBatchDetails()
  }, [batch.id])

  const handleSelectTransaction = (txId: string) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(txId)) {
      newSelected.delete(txId)
    } else {
      newSelected.add(txId)
    }
    setSelectedTransactions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(transactions.map((tx) => tx.batchTransactionId)))
    }
  }

  const handleRestore = async () => {
    if (selectedTransactions.size === 0) {
      alert('Please select at least one transaction to restore')
      return
    }

    try {
      setIsRestoring(true)
      const response = await fetch(`/api/batches/${batch.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: Array.from(selectedTransactions),
        }),
      })

      if (!response.ok) throw new Error('Failed to restore transactions')

      const result = await response.json()
      alert(
        `Successfully restored ${result.restoredCount} transaction(s) to the main list`
      )
      setSelectedTransactions(new Set())
      setRestoreConfirm(false)
      
      onRestoreSuccess()
      
      if (result.batchDeleted) {
        onBack() // Redirect back to batches list
      } else {
        fetchBatchDetails() // Refresh remaining transactions
      }
    } catch (error) {
      console.error('Error restoring transactions:', error)
      alert('Failed to restore transactions. Please try again.')
    } finally {
      setIsRestoring(false)
    }
  }

  const formatCurrency = (amount: number, showSymbol: boolean = true) => {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return showSymbol ? `₱ ${formatted}` : formatted
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading batch details...</p>
        </div>
      </div>
    )
  }

  const totalSelected = selectedTransactions.size
  const selectedAmount = transactions
    .filter((tx) => selectedTransactions.has(tx.batchTransactionId))
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-emerald-600 hover:bg-emerald-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Batches
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{batch.batchName}</h2>
            <p className="text-sm text-gray-600 font-mono">{batch.id}</p>
          </div>
        </div>
      </div>

      {/* Batch Info */}
      <Card className="border-emerald-100">
        <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Total Transactions</p>
            <p className="text-2xl font-bold text-emerald-900">
              {batch.transactionCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Total Amount</p>
            <p className="text-2xl font-bold text-emerald-900">
              {formatCurrency(batch.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Created</p>
            <p className="text-sm text-emerald-900">
              {formatDate(batch.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Selected</p>
            <p className="text-sm text-emerald-900">
              {totalSelected} / {batch.transactionCount}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSelectAll}
          variant="outline"
          className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
          size="sm"
        >
          <Check className="w-4 h-4 mr-2" />
          {selectedTransactions.size === transactions.length ? 'Deselect All' : 'Select All'}
        </Button>
        {totalSelected > 0 && (
          <>
            {!restoreConfirm ? (
              <Button
                onClick={() => setRestoreConfirm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore {totalSelected} Transaction{totalSelected !== 1 ? 's' : ''}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {isRestoring ? 'Restoring...' : 'Confirm Restore'}
                </Button>
                <Button
                  onClick={() => setRestoreConfirm(false)}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Transactions Table */}
      <Card className="border-emerald-100">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-100 bg-emerald-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-emerald-300 text-emerald-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-900">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-900">
                    Bank
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-900">
                    Payee
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-900">
                    DV #
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-900">
                    Control #
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-900">
                    Fund
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-emerald-900">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr
                    key={tx.id}
                    className={`border-b border-emerald-100 hover:bg-emerald-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(tx.batchTransactionId)}
                        onChange={() => handleSelectTransaction(tx.batchTransactionId)}
                        className="rounded border-emerald-300 text-emerald-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{tx.bankName}</td>
                    <td className="px-4 py-3 text-gray-900 max-w-xs truncate">
                      {tx.payee}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{tx.dvNumber}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {tx.controlNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{tx.fund}</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                      {formatCurrency(tx.amount, idx === 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
