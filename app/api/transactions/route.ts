import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Helper to map database columns (lowercase) to frontend keys (camelCase)
const mapTransaction = (tx: any) => ({
  id: tx.id,
  userId: tx.userid,
  bankName: tx.bankname,
  payee: tx.payee,
  address: tx.address,
  dvNumber: tx.dvnumber,
  particulars: tx.particulars,
  amount: tx.amount,
  date: tx.date,
  checkNumber: tx.checknumber,
  controlNumber: tx.controlnumber,
  accountCode: tx.accountcode,
  debit: tx.debit,
  credit: tx.credit,
  remarks: tx.remarks,
  fund: tx.fund,
  responsibilityCenter: tx.responsibilitycenter,
  moph: tx.moph,
  createdAt: tx.createdat
})

// GET transactions for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('userid', userId)
      .order('createdat', { ascending: false })

    if (error) throw error

    return NextResponse.json(transactions?.map(mapTransaction) || [])
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST new transaction
export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.bankName || body.bankName.trim() === '') {
      return NextResponse.json(
        { error: 'Bank Name is required' },
        { status: 400 }
      )
    }
    if (!body.payee || body.payee.trim() === '') {
      return NextResponse.json(
        { error: 'Payee is required' },
        { status: 400 }
      )
    }
    if (!body.particulars || body.particulars.trim() === '') {
      return NextResponse.json(
        { error: 'Particulars is required' },
        { status: 400 }
      )
    }
    if (!body.checkNumber || body.checkNumber.trim() === '') {
      return NextResponse.json(
        { error: 'Check Number is required' },
        { status: 400 }
      )
    }
    if (!body.amount || isNaN(parseFloat(body.amount))) {
      return NextResponse.json(
        { error: 'Amount is required and must be a valid number' },
        { status: 400 }
      )
    }
    if (!body.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }
    if (!body.accountCode || body.accountCode.trim() === '') {
      return NextResponse.json(
        { error: 'Account Code is required' },
        { status: 400 }
      )
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([
        {
          userid: userId,
          bankname: body.bankName.trim(),
          payee: body.payee.trim(),
          address: body.address ? body.address.trim() : '',
          dvnumber: body.dvNumber ? body.dvNumber.trim() : '',
          particulars: body.particulars.trim(),
          amount: parseFloat(body.amount),
          date: body.date,
          checknumber: body.checkNumber ? body.checkNumber.trim() : '',
          controlnumber: body.controlNumber ? body.controlNumber.trim() : '',
          accountcode: body.accountCode.trim(),
          debit: parseFloat(body.debit || 0),
          credit: parseFloat(body.credit || 0),
          remarks: body.remarks ? body.remarks.trim() : '',
          fund: body.fund ? body.fund.trim() : (body.moph ? '' : 'General Fund'),
          responsibilitycenter: body.responsibilityCenter ? body.responsibilityCenter.trim() : '',
          moph: body.moph ? body.moph.trim() : '',
        }
      ])
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(mapTransaction(transaction), { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

// PUT update transaction
export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.bankName || body.bankName.trim() === '') {
      return NextResponse.json(
        { error: 'Bank Name is required' },
        { status: 400 }
      )
    }
    if (!body.payee || body.payee.trim() === '') {
      return NextResponse.json(
        { error: 'Payee is required' },
        { status: 400 }
      )
    }
    if (!body.particulars || body.particulars.trim() === '') {
      return NextResponse.json(
        { error: 'Particulars is required' },
        { status: 400 }
      )
    }
    if (!body.checkNumber || body.checkNumber.trim() === '') {
      return NextResponse.json(
        { error: 'Check Number is required' },
        { status: 400 }
      )
    }
    if (!body.amount || isNaN(parseFloat(body.amount))) {
      return NextResponse.json(
        { error: 'Amount is required and must be a valid number' },
        { status: 400 }
      )
    }
    if (!body.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }
    if (!body.accountCode || body.accountCode.trim() === '') {
      return NextResponse.json(
        { error: 'Account Code is required' },
        { status: 400 }
      )
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({
        bankname: body.bankName.trim(),
        payee: body.payee.trim(),
        address: body.address ? body.address.trim() : '',
        dvnumber: body.dvNumber ? body.dvNumber.trim() : '',
        particulars: body.particulars.trim(),
        amount: parseFloat(body.amount),
        date: body.date,
        checknumber: body.checkNumber ? body.checkNumber.trim() : '',
        controlnumber: body.controlNumber ? body.controlNumber.trim() : '',
        accountcode: body.accountCode.trim(),
        debit: parseFloat(body.debit || 0),
        credit: parseFloat(body.credit || 0),
        remarks: body.remarks ? body.remarks.trim() : '',
        fund: body.fund ? body.fund.trim() : (body.moph ? '' : 'General Fund'),
        responsibilitycenter: body.responsibilityCenter ? body.responsibilityCenter.trim() : '',
        moph: body.moph ? body.moph.trim() : '',
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(mapTransaction(transaction))
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// DELETE transaction
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
