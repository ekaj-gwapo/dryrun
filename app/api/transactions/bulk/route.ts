import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Support either query param or json body for userId
    let userId = request.nextUrl.searchParams.get('userId')
    const body = await request.json()
    
    if (!userId && body.userId) {
      userId = body.userId
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    if (!body.transactions || !Array.isArray(body.transactions)) {
       return NextResponse.json(
        { error: 'Transactions array required' },
        { status: 400 }
      )
    }

    const transactionsToInsert = body.transactions
      .filter((tx: any) => tx.bankName && tx.payee && tx.particulars && tx.amount && tx.date && tx.accountCode)
      .map((tx: any) => ({
        userid: userId,
        bankname: tx.bankName?.toString().trim() || '',
        payee: tx.payee?.toString().trim() || '',
        address: tx.address ? tx.address.toString().trim() : '',
        dvnumber: tx.dvNumber ? tx.dvNumber.toString().trim() : '',
        particulars: tx.particulars?.toString().trim() || '',
        amount: parseFloat(tx.amount) || 0,
        date: tx.date,
        checknumber: tx.checkNumber ? tx.checkNumber.toString().trim() : '',
        controlnumber: tx.controlNumber ? tx.controlNumber.toString().trim() : '',
        accountcode: tx.accountCode?.toString().trim() || '',
        debit: parseFloat(tx.debit) || 0,
        credit: parseFloat(tx.credit) || 0,
        remarks: tx.remarks ? tx.remarks.toString().trim() : '',
        fund: tx.fund ? tx.fund.toString().trim() : (tx.moph ? '' : 'General Fund'),
        responsibilitycenter: tx.responsibilityCenter ? tx.responsibilityCenter.toString().trim() : '',
        moph: tx.moph ? tx.moph.toString().trim() : '',
      }))

    if (transactionsToInsert.length === 0) {
      return NextResponse.json(
        { message: 'No valid transactions to import' },
        { status: 200 }
      )
    }

    const { data: insertedData, error } = await supabase
      .from('transactions')
      .insert(transactionsToInsert)
      .select()

    if (error) throw error
      
    return NextResponse.json(
      { 
        success: true, 
        count: insertedData.length, 
        message: `Successfully imported ${insertedData.length} transactions` 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk import' },
      { status: 500 }
    )
  }
}
