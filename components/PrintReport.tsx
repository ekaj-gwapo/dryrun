'use client'

import { forwardRef } from 'react'

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

interface PrintReportProps {
  transactions: Transaction[]
  logo: string | null
  entryUserEmail: string
  batchId?: string
  fund?: string
  bankName?: string
  accountNumber?: string
  moph?: string
}

const PrintReport = forwardRef<HTMLDivElement, PrintReportProps>(
({ transactions, logo, entryUserEmail, batchId, fund, bankName, accountNumber, moph }, ref) => {

const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)

return (

<div ref={ref} className="w-full bg-white p-8 font-serif text-[12px]">

{/* HEADER */}

<div className="flex flex-col items-center mb-6 relative">
  <div className="flex items-center justify-center gap-4 w-full">
    <img src="/logos/logo3.jpg" alt="Logo" className="w-16 h-16 object-contain" />
    <div className="text-center leading-tight">
      <p>Republic of the Philippines</p>
      <p className="font-bold uppercase">PROVINCIAL GOVERNMENT OF MISAMIS ORIENTAL</p>
      <p className="font-bold uppercase">OFFICE OF THE PROVINCIAL TREASURER</p>
    </div>
  </div>

  <div className="text-center mt-6">
    <p className="font-bold text-base leading-tight">REPORT OF</p>
    <p className="font-bold text-base leading-tight">CHECKS ISSUED</p>
    <p className="font-bold text-sm mt-1">
      {transactions.length > 0 
        ? new Date(transactions[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase() 
        : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
    </p>
  </div>
</div>

{/* BANK INFO */}

<div className="flex justify-between items-end mb-2 text-xs">
  <div>
    <div className="grid grid-cols-[80px_1fr] gap-2 items-end mb-1">
      <p className="leading-tight text-gray-700">Bank<br/>Name:</p>
      <p className="font-bold border-b border-black uppercase whitespace-nowrap">
        {bankName === 'Landbank - 43' || bankName === 'Landbank - 45' 
          ? 'LAND BANK OF THE PHILIPPINES' 
          : (bankName || "DEVELOPMENT BANK OF THE PHILIPPINES")}
      </p>
    </div>
    <div className="grid grid-cols-[80px_1fr] gap-2 items-end">
      <p className="leading-tight text-gray-700">Account No.:</p>
      <p className="font-bold border-b border-black uppercase whitespace-nowrap">{accountNumber || "-"}</p>
    </div>
  </div>
  <div className="text-right mb-1">
    <p>Fund: <span className="font-bold uppercase border-b border-black inline-block min-w-[150px] text-center">
      {moph ? `MOPH - ${moph}` : (fund || "GENERAL FUND")}
    </span></p>
  </div>
</div>

{/* TABLE */}

<table className="w-full border border-black border-collapse">

<thead>
  <tr className="bg-blue-50 text-center">
    <th className="border border-black p-1 font-normal w-[130px]" colSpan={2}>Check</th>
    <th className="border border-black p-1 font-normal w-[50px]" rowSpan={2}>DV<br/>No.</th>
    <th className="border border-black p-1 font-normal w-[50px]" rowSpan={2}>Control<br/>No.</th>
    <th className="border border-black p-1 font-normal w-[60px]" rowSpan={2}>Account<br/>Code</th>
    <th className="border border-black p-1 font-normal w-[60px]" rowSpan={2}>Resp.<br/>Center</th>
    <th className="border border-black p-1 font-normal" rowSpan={2}>Name of<br/>Payee</th>
    <th className="border border-black p-1 font-normal min-w-[150px]" rowSpan={2}>Nature of Payment</th>
    <th className="border border-black p-1 font-normal w-[80px]" rowSpan={2}>Amount</th>
    <th className="border border-black p-1 font-normal w-[60px]" rowSpan={2}>Remarks</th>
  </tr>
  <tr className="bg-gray-50 text-center">
    <th className="border border-black p-1 font-normal w-[80px]">Date</th>
    <th className="border border-black p-1 font-normal w-[50px]">No.</th>
  </tr>
</thead>

<tbody>

{transactions.length > 0 ? (

transactions.map((t, idx) => (

<tr key={t.id} className="uppercase">

<td className="border border-black p-1 text-center">

{new Date(t.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}

</td>

<td className="border border-black p-1 text-center">

{t.checkNumber}

</td>

<td className="border border-black p-1 text-center">

{t.dvNumber}

</td>

<td className="border border-black p-1 text-center">

{t.controlNumber}

</td>

<td className="border border-black p-1 text-center">

{t.accountCode}

</td>

<td className="border border-black p-1 text-center">

{t.responsibilityCenter}

</td>

<td className="border border-black p-1 whitespace-nowrap">

{t.payee}

</td>

<td className="border border-black p-1">

{t.particulars}

</td>

<td className="border border-black p-1 text-right">

{idx === 0 ? '₱ ' : ''}{t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

</td>

<td className="border border-black p-1">

{t.remarks}

</td>

</tr>

))

) : (

<tr>

<td colSpan={9} className="text-center p-3 border">

No transactions to display

</td>

</tr>

)}

</tbody>

<tfoot>

<tr>

<td colSpan={8} className="border border-black p-1 text-right font-bold pr-10">

TOTAL

</td>

<td className="border border-black p-1 text-right font-bold">

₱ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

</td>

<td className="border border-black"></td>

</tr>

<tr>

<td colSpan={6} className="border border-black p-2 align-top">

<p className="font-bold mb-1">CERTIFICATION</p>

<p className="mb-4 text-justify">

I CERTIFY that this report issued in ______ sheet(s), is a full, true and correct statement of all checks released by me in payment for obligations of the ______________________ for the period stated and shown in the attached disbursement vouchers.

</p>

<div className="mt-8 flex justify-between pr-12 pl-6 mb-2 gap-8">

<div className="text-left">

<p className="font-bold">GENES T. VICENTE</p>

<p className="mb-6">Acting Cashier / Supervising Admin. Officer</p>

<div className="border-b border-black w-60"></div>

</div>

<div className="text-center flex flex-col justify-end">

<p className="mb-6">Date</p>

<div className="border-b border-black w-24"></div>

</div>

</div>

</td>

<td colSpan={3} className="border border-black p-2 align-top text-center relative overflow-hidden">

<div className="min-w-[200px] sm:min-w-[250px] w-full flex flex-col h-full">
<p className="font-bold mb-0">Received By:</p>

<p className="text-[10px] mb-0 whitespace-nowrap">(Signature over Printed Name)</p>

<p className="mb-8">Date</p>

<div className="flex flex-col items-center gap-6 mt-auto pb-2">

<div className="border-b border-black w-4/5 pt-4"></div>

<div className="border-b border-black w-4/5"></div>

</div>
</div>

</td>

</tr>

</tfoot>

</table>

{/* BATCH INFO */}

<div className="mt-10 text-xs text-gray-600">

<p>Batch ID: {batchId}</p>

</div>

</div>

)

})

PrintReport.displayName = 'PrintReport'

export default PrintReport