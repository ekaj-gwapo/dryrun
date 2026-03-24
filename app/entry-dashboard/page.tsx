'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import TransactionForm from '@/components/TransactionForm'
import TransactionTable from '@/components/TransactionTable'
import { MonthYearPicker } from '@/components/MonthYearPicker'
import { LogOut, Plus, Search } from 'lucide-react'
import Link from 'next/link'

type Transaction = {
  id: string
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
  createdAt: string
  checkNumber?: string
  responsibilityCenter?: string
  moph?: string
}

export default function EntryDashboard() {
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [bankNames, setBankNames] = useState<string[]>([])
  const [selectedBankName, setSelectedBankName] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedFund, setSelectedFund] = useState<string>('')
  const [selectedPlace, setSelectedPlace] = useState<string>('')
  const [places, setPlaces] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
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
      if (user.role !== 'entry_user') {
        router.push('/viewer-dashboard')
        return
      }

      setUser(user)
      fetchTransactions(user.id)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchTransactions = async (userId: string) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setAllTransactions(data)
        setTransactions(data)
        extractBankNames(data)
        extractPlaces(data)
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

  const applyFilters = () => {
    let filtered = [...allTransactions]

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

    setTransactions(filtered)
  }

  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFilters()
    }
  }, [selectedBankName, selectedDate, selectedFund, selectedPlace, searchQuery, allTransactions])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/auth/login')
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
    <div className="min-h-screen bg-[#f9f6f0]">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-40">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {logo && (
              <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Data Entry</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
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

      {/* Main Content */}
      <div className="w-full px-6 py-8 flex flex-col gap-8">
        {/* Filters */}
        <Card className="border-emerald-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="bank-filter" className="mb-2 block">Bank Name</Label>
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
                <Label htmlFor="date-filter" className="mb-2 block">Date</Label>
                <MonthYearPicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  className="w-full rounded-lg border-emerald-200 bg-white px-4 py-2 text-gray-900 focus-visible:ring-2 focus-visible:ring-emerald-600 font-normal"
                />
              </div>
              <div>
                <Label htmlFor="fund-filter" className="mb-2 block">Fund</Label>
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
                    {fundOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="place-filter" className="mb-2 block">MOPH</Label>
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
                    {places.map(place => (
                      <SelectItem key={place} value={place}>{place}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(selectedBankName || selectedDate || selectedFund || selectedPlace) && (
              <Button
                onClick={() => {
                  setSelectedBankName('')
                  setSelectedDate('')
                  setSelectedFund('')
                  setSelectedPlace('')
                }}
                variant="outline"
                className="mt-4 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <div className="flex justify-between items-center mb-4">
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

            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 h-10 font-bold"
                >
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Transaction</DialogTitle>
                  <DialogDescription>Enter transaction details below. All fields marked with * are required.</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <TransactionForm
                    userId={user?.id}
                    existingBankNames={bankNames}
                    onSuccess={() => {
                      if (user?.id) fetchTransactions(user.id)
                      setShowForm(false)
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transaction Table */}
        <TransactionTable
          transactions={transactions}
          onTransactionDeleted={() => {
            if (user?.id) fetchTransactions(user.id)
          }}
          onTransactionUpdated={() => {
            if (user?.id) fetchTransactions(user.id)
          }}
        />
      </div>
    </div>
  )
}
