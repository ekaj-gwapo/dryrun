'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { DatePicker } from '@/components/DatePicker'
import { AlertCircle } from 'lucide-react'
import { toast } from "sonner"

type TransactionFormProps = {
  userId: string;
  existingBankNames?: string[];
  onSuccess?: () => void
}

export default function TransactionForm({ userId, existingBankNames = [], onSuccess }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCustomBank, setIsCustomBank] = useState(false)
  const [formData, setFormData] = useState({
    bank_name: '',
    payee: '',
    address: '',
    dv_number: '',
    particulars: '',
    amount: '',
    date: '',
    check_number: '',
    control_number: '',
    account_code: '',
    debit: '',
    credit: '',
    remarks: '',
    fund: '',
    moph_location: '',
    responsibility_center: '',
  })

  const standardBanks = [
    'Development Bank of the Philippines',
    'Banco de Oro',
    'Bank of the Philippine Islands',
    'Metrobank',
  ]

  const combinedBanks = Array.from(new Set([
    ...standardBanks,
    ...(existingBankNames || [])
  ])).filter(b => b !== 'Landbank - 43' && b !== 'Landbank - 45').sort()

  const fundOptions = [
    'General Fund',
    'Development Fund',
    'Trust Fund',
    'Hospital Fund',
  ]

  const mophOptions = [
    'Initao',
    'Balingasag',
    'Gingoog',
    'Manticao',
    'Talisayan',
    'Claveria',
    'Magsaysay',
    'Alubijid',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!userId) throw new Error('User not authenticated')

      if (!formData.fund && !formData.moph_location) throw new Error('Please select either a Fund or MOPH location')
      if (!formData.check_number.trim()) throw new Error('Check number is required')

      const payload = JSON.stringify({
        bankName: formData.bank_name,
        payee: formData.payee,
        address: formData.address,
        dvNumber: formData.dv_number,
        particulars: formData.particulars,
        amount: parseFloat(formData.amount),
        date: formData.date,
        checkNumber: formData.check_number,
        controlNumber: formData.control_number,
        accountCode: formData.account_code,
        debit: parseFloat(formData.debit || '0'),
        credit: parseFloat(formData.credit || '0'),
        remarks: formData.remarks,
        fund: formData.fund,
        moph: formData.moph_location,
        responsibilityCenter: formData.responsibility_center,
      })

      const response = await fetch(`/api/transactions?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create transaction')
      }

      setFormData({
        bank_name: '',
        payee: '',
        address: '',
        dv_number: '',
        particulars: '',
        amount: '',
        date: '',
        check_number: '',
        control_number: '',
        account_code: '',
        debit: '',
        credit: '',
        remarks: '',
        fund: '',
        moph_location: '',
        responsibility_center: '',
      })
      
      toast.success("Transaction created successfully!")
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 transition-all [&_input]:bg-slate-50 [&_input]:border-slate-300 [&_input]:shadow-sm hover:[&_input]:border-slate-400 focus-within:[&_input]:bg-white focus-within:[&_input]:border-emerald-500 [&_input]:transition-all [&_button[role='combobox']]:bg-slate-50 [&_button[role='combobox']]:border-slate-300 [&_button[role='combobox']]:shadow-sm hover:[&_button[role='combobox']]:bg-emerald-600 hover:[&_button[role='combobox']]:text-white hover:[&_button[role='combobox']]:border-emerald-600 [&_textarea]:bg-slate-50 [&_textarea]:border-slate-300 [&_textarea]:shadow-sm hover:[&_textarea]:border-slate-400 focus-within:[&_textarea]:bg-white focus-within:[&_textarea]:border-emerald-500">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="bank_name">Bank Name *</Label>
          {!isCustomBank ? (
            <Select
              value={(formData.bank_name === 'Landbank - 43' || formData.bank_name === 'Landbank - 45' || combinedBanks.includes(formData.bank_name)) ? formData.bank_name : (formData.bank_name ? 'custom_prefill' : '')}
              onValueChange={(val) => {
                if (val === 'add_new') {
                  setIsCustomBank(true)
                  setFormData(prev => ({ ...prev, bank_name: '' }))
                } else if (val === 'custom_prefill') {
                  // Do nothing, just a display placeholder if preexisting data doesn't match
                } else {
                  setFormData(prev => {
                    const updates = { ...prev, bank_name: val }
                    if (val === 'Landbank - 43' && !prev.check_number) updates.check_number = '43'
                    if (val === 'Landbank - 45' && !prev.check_number) updates.check_number = '45'
                    return updates
                  })
                }
              }}
            >
              <SelectTrigger id="bank_name" className="w-full bg-background" aria-required="true">
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" className="max-h-[140px] overflow-y-auto relative z-[100]">
                <SelectGroup>
                  <SelectLabel className="font-bold text-emerald-800">Landbank of the Philippines</SelectLabel>
                  <SelectItem value="Landbank - 43" className="pl-6">Landbank - 43</SelectItem>
                  <SelectItem value="Landbank - 45" className="pl-6">Landbank - 45</SelectItem>
                </SelectGroup>
                <div className="h-px bg-emerald-100 my-1 mx-2"></div>
                <SelectGroup>
                  {combinedBanks.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectGroup>
                {formData.bank_name && formData.bank_name !== 'Landbank - 43' && formData.bank_name !== 'Landbank - 45' && !combinedBanks.includes(formData.bank_name) && (
                  <SelectItem value="custom_prefill" className="hidden">{formData.bank_name}</SelectItem>
                )}
                <div className="h-px bg-emerald-100 my-1 mx-2"></div>
                <SelectItem value="add_new" className="text-emerald-600 font-medium cursor-pointer">+ Add New Bank...</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                required
                placeholder="Enter custom bank name"
                className="w-full"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsCustomBank(false)
                  setFormData(prev => ({ ...prev, bank_name: '' }))
                }}
                className="text-xs text-gray-500 hover:text-emerald-600 self-end px-1"
              >
                Return to dropdown
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="payee">Payee *</Label>
          <Input
            id="payee"
            name="payee"
            value={formData.payee}
            onChange={handleChange}
            required
            placeholder="Enter payee name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="particulars">Particulars</Label>
          <Input
            id="particulars"
            name="particulars"
            value={formData.particulars}
            onChange={handleChange}
            required
            placeholder="Enter nature of payment"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="dv_number">DV Number</Label>
          <Input
            id="dv_number"
            name="dv_number"
            value={formData.dv_number}
            onChange={handleChange}
            placeholder="Enter DV number"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="check_number">Check No.*</Label>
          <Input
            id="check_number"
            name="check_number"
            value={formData.check_number}
            onChange={handleChange}
            required
            placeholder="Enter check number"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="control_number">Control Number</Label>
          <Input
            id="control_number"
            name="control_number"
            value={formData.control_number}
            onChange={handleChange}
            placeholder="Enter control number"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            placeholder="0.00"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="debit">Debit</Label>
          <Input
            id="debit"
            name="debit"
            type="number"
            step="0.01"
            value={formData.debit}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="credit">Credit</Label>
          <Input
            id="credit"
            name="credit"
            type="number"
            step="0.01"
            value={formData.credit}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date *</Label>
          <DatePicker
            value={formData.date}
            onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="account_code">Account Code *</Label>
          <Input
            id="account_code"
            name="account_code"
            value={formData.account_code}
            onChange={handleChange}
            required
            placeholder="Enter account code"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="fund">Fund</Label>
          <Select
            disabled={formData.moph_location !== ''}
            value={formData.fund}
            onValueChange={(val) => setFormData(prev => ({ ...prev, fund: val === 'none' ? '' : val }))}
          >
            <SelectTrigger id="fund" className="w-full bg-background">
              <SelectValue placeholder="-- Select a Fund --" />
            </SelectTrigger>
            <SelectContent position="popper" side="top" className="max-h-[140px] overflow-y-auto">
              <SelectItem value="none" className="text-gray-500 italic">-- Select a Fund --</SelectItem>
              {fundOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="moph_location">MOPH Location</Label>
          <Select
            disabled={formData.fund !== ''}
            value={formData.moph_location}
            onValueChange={(val) => setFormData(prev => ({ ...prev, moph_location: val === 'none' ? '' : val }))}
          >
            <SelectTrigger id="moph_location" className="w-full bg-background">
              <SelectValue placeholder="-- Select MOPH Location --" />
            </SelectTrigger>
            <SelectContent position="popper" side="top" className="max-h-[140px] overflow-y-auto">
              <SelectItem value="none" className="text-gray-500 italic">-- Select MOPH Location --</SelectItem>
              {mophOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Input
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter any additional remarks"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="responsibility_center">Responsibility Center</Label>
          <Input
            id="responsibility_center"
            name="responsibility_center"
            value={formData.responsibility_center}
            onChange={handleChange}
            placeholder="Enter responsibility center"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isLoading ? 'Submitting...' : 'Submit Transaction'}
        </Button>
      </div>
    </form>
  )
}
