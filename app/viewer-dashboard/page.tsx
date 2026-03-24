'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ViewerTransactionTable from '@/components/ViewerTransactionTable'
import PrintReport from '@/components/PrintReport'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MonthYearPicker } from '@/components/MonthYearPicker'
import { LogOut, ChevronDown, Settings, Printer, Archive, Search, Upload } from 'lucide-react'
import Link from 'next/link'
import * as xlsx from 'xlsx'

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

export default function ViewerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [assignedEntryUsers, setAssignedEntryUsers] = useState<any[]>([])
  const [selectedEntryUser, setSelectedEntryUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEntryUserEmail, setSelectedEntryUserEmail] = useState<string>('')
  const [bankNames, setBankNames] = useState<string[]>([])
  const [selectedBankName, setSelectedBankName] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedFund, setSelectedFund] = useState<string>('')
  const [selectedPlace, setSelectedPlace] = useState<string>('')
  const [places, setPlaces] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [batchId, setBatchId] = useState<string | null>(null)
  const [isCreatingBatch, setIsCreatingBatch] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const fundOptions = [
    'General Fund',
    'Development Fund',
    'Trust Fund',
    'Hospital Fund',

  ]

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push('/auth/login')
        return
      }

      const user = JSON.parse(userStr)
      if (user.role !== 'viewer_user') {
        router.push('/entry-dashboard')
        return
      }

      setUser(user)
      fetchAssignedEntryUsers(user.id)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchAssignedEntryUsers = async (viewerId: string) => {
    try {
      const response = await fetch(`/api/viewer-assignments?viewerId=${viewerId}`)
      if (response.ok) {
        const data = await response.json()
        setAssignedEntryUsers(data)
        if (data.length > 0) {
          setSelectedEntryUser(data[0].entryUserId)
          setSelectedEntryUserEmail(data[0].email || '')
          await fetchTransactions(data[0].entryUserId)
        }
      }
    } catch (error) {
      console.error('Error fetching assigned users:', error)
    }
  }

  const fetchTransactions = async (entryUserId: string) => {
    try {
      const response = await fetch(`/api/transactions?userId=${entryUserId}`)
      if (response.ok) {
        const data = await response.json()
        setAllTransactions(data)
        extractBankNames(data)
        extractPlaces(data)
        applyFilters(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const extractBankNames = (txs: Transaction[]) => {
    const names = Array.from(new Set(txs.map(tx => tx.bankName).filter(Boolean)))
    setBankNames(names.sort())
  }

  const extractPlaces = (txs: Transaction[]) => {
    const placeList = Array.from(new Set(
      txs
        .map(tx => tx.moph)
        .filter((moph): moph is string => !!moph)
    ))
    setPlaces(placeList.sort())
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = xlsx.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = xlsx.utils.sheet_to_json<any>(worksheet, { raw: false, dateNF: 'mm/dd/yyyy' })
      
      const mappedTransactions = jsonData.map((rawRow, index) => {
        // Normalize keys to lowercase, trimming and replacing ANY whitespace (like newlines) with single space
        const row: Record<string, any> = {}
        for (const [key, value] of Object.entries(rawRow)) {
           const cleanKey = key.toString().toLowerCase().replace(/[\s\r\n]+/g, ' ').trim()
           row[cleanKey] = value
        }

        // Handle different date formats (Excel serial dates vs strings)
        let formattedDate = ''
        const rawDate = row['date']
        
        if (rawDate) {
           formattedDate = rawDate.toString().trim()
        }

        const parseAmount = (val: any) => {
           if (typeof val === 'number') return val;
           if (!val) return 0;
           return parseFloat(val.toString().replace(/,/g, '')) || 0;
        }

        const getString = (val: any) => {
           if (val === null || val === undefined) return '';
           return val.toString().trim();
        }

        return {
          _rawIndex: index + 2, // Excel row number (approx, accounting for header)
          _rawRow: row, // Keep for debugging
          bankName: getString(row['bank name'] || row['bank nam'] || row['bank'] || row['bank names']),
          payee: getString(row['payee']),
          address: getString(row['address']),
          dvNumber: getString(row['dv number'] || row['dv no.'] || row['dv no']),
          particulars: getString(row['particulars']),
          amount: parseAmount(row['amount']),
          date: formattedDate,
          checkNumber: getString(row['check number'] || row['check no.'] || row['check no']),
          controlNumber: getString(row['control number'] || row['control no.'] || row['control no']),
          accountCode: getString(row['account code']),
          debit: parseAmount(row['debit']),
          credit: parseAmount(row['credit']),
          remarks: getString(row['remarks']),
          fund: getString(row['fund'] || 'General Fund'),
          responsibilityCenter: getString(row['responsibility center'] || row['resp. center'] || row['resp center']),
          moph: getString(row['moph'] || row['location'] || row['place'])
        }
      })
      
      const validTransactions = mappedTransactions.filter(tx => {
         return !!tx.bankName && !!tx.payee && !!tx.particulars && tx.amount > 0 && !!tx.accountCode;
      });

      if (validTransactions.length === 0 && mappedTransactions.length > 0) {
        // Log the exact problem of the first mapped row to make it obvious
        console.log("Raw sheet data:", jsonData);
        console.log("Mapped transactions (failed validation):", mappedTransactions);
        const firstFail = mappedTransactions[0];
        let missing = [];
        if (!firstFail.bankName) missing.push("Bank Name");
        if (!firstFail.payee) missing.push("Payee");
        if (!firstFail.particulars) missing.push("Particulars");
        if (firstFail.amount <= 0) missing.push("Amount (>0)");
        if (!firstFail.accountCode) missing.push("Account Code");
        
        alert(`No valid transactions. Checked row ${firstFail._rawIndex}. Missing/invalid fields: ${missing.join(', ')}. Please check the console for more details.`);
        setIsImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      if (validTransactions.length === 0) {
        alert("No data found in the Excel file.")
        setIsImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // Remove debug fields
      const finalTransactions = validTransactions.map(({ _rawIndex, _rawRow, ...tx }) => tx);

      if (!selectedEntryUser) {
         alert("No entry user selected to assign imports to.")
         setIsImporting(false)
         if (fileInputRef.current) fileInputRef.current.value = ''
         return
      }

      const response = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedEntryUser,
          transactions: finalTransactions
        })
      })

      if (!response.ok) {
         throw new Error('Failed to import transactions')
      }
      
      const result = await response.json()
      alert(result.message || `Successfully imported ${finalTransactions.length} transactions!`)
      
      // Refresh transactions
      await fetchTransactions(selectedEntryUser)
      
    } catch (error) {
      console.error('Error importing Excel:', error)
      alert('Failed to import file. Make sure it is a valid Excel file with the correct headers.')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const applyFilters = (data: Transaction[]) => {
    let filtered = [...data]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(tx =>
        tx.checkNumber?.toLowerCase().includes(q) ||
        tx.dvNumber?.toLowerCase().includes(q) ||
        tx.accountCode?.toLowerCase().includes(q) ||
        tx.responsibilityCenter?.toLowerCase().includes(q) ||
        tx.payee?.toLowerCase().includes(q) ||
        tx.amount?.toString().includes(q)
      )
    }

    if (selectedBankName && selectedBankName !== 'none') {
      filtered = filtered.filter(tx => tx.bankName === selectedBankName)
    }

    if (selectedDate) {
      const filterDate = new Date(selectedDate)
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date)
        return txDate.getMonth() === filterDate.getMonth() && 
               txDate.getFullYear() === filterDate.getFullYear()
      })
    }

    if (selectedFund && selectedFund !== 'none') {
      filtered = filtered.filter(tx => tx.fund === selectedFund)
    }

    if (selectedPlace && selectedPlace !== 'none') {
      filtered = filtered.filter(tx => tx.moph === selectedPlace)
    }

    // Sort by date (newest first) as default
    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setTransactions(sorted)
  }

  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFilters(allTransactions)
    }
  }, [selectedBankName, selectedDate, selectedFund, selectedPlace, searchQuery, allTransactions])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const createBatchAndPrint = async () => {
    if (!user || !selectedEntryUser || transactions.length === 0) {
      alert('No transactions to print')
      return
    }

    try {
      setIsCreatingBatch(true)

      // Extract unique banks and funds from transactions
      const uniqueBanks = [...new Set(transactions.map((tx: any) => tx.bankName))].filter(Boolean)
      const uniqueFunds = [...new Set(transactions.map((tx: any) => tx.fund))].filter(Boolean)

      // Create batch
      const batchResponse = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewerId: user.id,
          entryUserId: selectedEntryUser,
          transactions: transactions,
          appliedFilters: {
            bankNames: uniqueBanks,
            funds: uniqueFunds,
            date: selectedDate,
          },
        }),
      })

      if (!batchResponse.ok) {
        throw new Error('Failed to create batch')
      }

      const batch = await batchResponse.json()
      setBatchId(batch.id)

      // Show success message
      const msg = `Batch created successfully! ID: ${batch.id.slice(0, 8)}`
      alert(msg)

      // Open print dialog and ONLY refresh state after a delay or dialog close
      setTimeout(async () => {
        window.print()
        
        // Ask the user if the print was successful
        const confirmed = confirm("Did the document print successfully?\n\nClick OK to confirm batch creation.\nClick Cancel to undo this batch and restore the transactions.")
        
        if (confirmed) {
          // Refresh transactions to remove printed ones AFTER printing
          await fetchTransactions(selectedEntryUser)
        } else {
          // Undo batch creation
          try {
            setIsCreatingBatch(true)
            await fetch(`/api/batches/${batch.id}`, { method: 'DELETE' })
            setBatchId(null)
            alert("Batch creation has been undone. Transactions are restored to the list.")
          } catch (error) {
            console.error('Error undoing batch:', error)
            alert('Failed to undo batch creation.')
          } finally {
            setIsCreatingBatch(false)
            await fetchTransactions(selectedEntryUser)
          }
        }
      }, 500)
    } catch (error) {
      console.error('Error creating batch:', error)
      alert('Failed to create batch. Please try again.')
    } finally {
      setIsCreatingBatch(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f6f0] print:bg-white">
      {/* Header - Hidden on Print */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-40 print:hidden">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Viewer Dashboard</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Hidden on Print */}
      <div className="w-full px-6 py-8 print:hidden">


        {/* Filters and Actions */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-emerald-100 shadow-md">
          <div className="flex justify-between items-center mb-4">
             <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".xlsx, .xls, .csv" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                />
                <Button 
                   onClick={() => fileInputRef.current?.click()}
                   variant="outline"
                   className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                   disabled={isImporting || !selectedEntryUser}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import Excel'}
                </Button>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <Select value={selectedBankName} onValueChange={setSelectedBankName}>
                <SelectTrigger className="w-full bg-white border-emerald-200 focus:ring-emerald-600">
                  <SelectValue placeholder="All Bank Names" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-gray-500 italic">All Bank Names</SelectItem>
                  
                  {(bankNames.includes('Landbank - 43') || bankNames.includes('Landbank - 45')) && (
                    <SelectGroup>
                      <SelectLabel className="font-bold text-emerald-800">Landbank of the Philippines</SelectLabel>
                      {bankNames.includes('Landbank - 43') && <SelectItem value="Landbank - 43" className="pl-6">Landbank - 43</SelectItem>}
                      {bankNames.includes('Landbank - 45') && <SelectItem value="Landbank - 45" className="pl-6">Landbank - 45</SelectItem>}
                    </SelectGroup>
                  )}
                  
                  {bankNames.some(b => b === 'Landbank - 43' || b === 'Landbank - 45') && bankNames.some(b => b !== 'Landbank - 43' && b !== 'Landbank - 45') && (
                    <div className="h-px bg-emerald-100 my-1 mx-2"></div>
                  )}
                  
                  {bankNames.some(b => b !== 'Landbank - 43' && b !== 'Landbank - 45') && (
                    <SelectGroup>
                      {bankNames.filter(name => name !== 'Landbank - 43' && name !== 'Landbank - 45').map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  {selectedBankName && selectedBankName !== 'none' && !bankNames.includes(selectedBankName) && (
                    <SelectItem value={selectedBankName}>{selectedBankName}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <MonthYearPicker
                value={selectedDate}
                onChange={setSelectedDate}
                className="w-full rounded-lg border-emerald-200 bg-white px-4 py-2 text-gray-900 focus-visible:ring-2 focus-visible:ring-emerald-600 font-normal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fund
              </label>
              <Select 
                disabled={selectedPlace !== '' && selectedPlace !== 'none'}
                value={selectedFund} 
                onValueChange={setSelectedFund}
              >
                <SelectTrigger className="w-full bg-white border-emerald-200 focus:ring-emerald-600">
                  <SelectValue placeholder="All Funds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-gray-500 italic">All Funds</SelectItem>
                  {fundOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MOPH
              </label>
              <Select 
                disabled={selectedFund !== '' && selectedFund !== 'none'}
                value={selectedPlace} 
                onValueChange={setSelectedPlace}
              >
                <SelectTrigger className="w-full bg-white border-emerald-200 focus:ring-emerald-600">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-gray-500 italic">All Locations</SelectItem>
                  {selectedPlace && selectedPlace !== 'none' && !places.includes(selectedPlace) && (
                    <SelectItem value={selectedPlace}>{selectedPlace}</SelectItem>
                  )}
                  {places.map((place) => (
                    <SelectItem key={place} value={place}>
                      {place}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(selectedBankName || selectedDate || selectedFund || selectedPlace) && (
            <button
              onClick={() => {
                setSelectedBankName('')
                setSelectedDate('')
                setSelectedFund('')
                setSelectedPlace('')
              }}
              className="mt-4 text-emerald-600 text-sm hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Transaction Table */}
        <div>
          <div className="flex justify-between items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
            
            <div className="flex items-center gap-3">
              {/* Search Bar (Repositioned) */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full border-emerald-200 focus-visible:ring-emerald-600 bg-white shadow-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/batch-management')}
                  variant="outline"
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 h-10"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  View Batches
                </Button>
                <Button
                  onClick={createBatchAndPrint}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-10"
                  disabled={transactions.length === 0 || isCreatingBatch}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {isCreatingBatch ? 'Creating Batch...' : 'Print Report'}
                </Button>
              </div>
            </div>
          </div>
          <ViewerTransactionTable transactions={transactions} />
        </div>
      </div>

      {/* Print Report - Visible only on Print */}
      <div className="hidden print:block w-full bg-white relative z-50">
        <PrintReport
          ref={printRef}
          transactions={transactions}
          logo={null}
          entryUserEmail={selectedEntryUserEmail}
          batchId={batchId || undefined}
          fund={selectedFund}
          moph={selectedPlace && selectedPlace !== 'none' ? selectedPlace : ''}
          bankName={selectedBankName}
        />
      </div>
    </div>
  )
}
