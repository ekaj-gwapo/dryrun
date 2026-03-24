import sys

with open('components/TransactionForm.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = """      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
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
              <SelectContent>
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
          <Label htmlFor="particulars">Particulars (Nature of Payment) *</Label>
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
            <SelectContent>
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
            <SelectContent>
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
      </div>\n"""

start_idx = 0
for i, l in enumerate(lines):
    if l.startswith('      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">') and lines[i+1].strip().startswith('<div className="flex flex-col gap-2">'):
        start_idx = i
        break

end_idx = 0
for i in range(len(lines)-1, -1, -1):
    if lines[i].startswith('    </form>'):
        end_idx = i
        break

if start_idx == 0 or end_idx == 0:
    print("Could not find start or end index.")
    sys.exit(1)

lines[start_idx:end_idx] = [new_content]

with open('components/TransactionForm.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Replacement successful")
