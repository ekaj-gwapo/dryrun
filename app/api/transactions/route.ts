import { getDb, initDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// GET transactions for a user
export async function GET(request: NextRequest) {
  try {
    await initDb()
    const db = await getDb()
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const transactions = await db.all(
      'SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    )

    return NextResponse.json(transactions)
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
    await initDb()
    const db = await getDb()
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const id = randomUUID()

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

    await db.run(
      `INSERT INTO transactions (id, userId, bankName, payee, address, dvNumber, particulars, amount, date, checkNumber, controlNumber, accountCode, debit, credit, remarks, fund, responsibilityCenter, moph)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        body.bankName.trim(),
        body.payee.trim(),
        body.address ? body.address.trim() : '',
        body.dvNumber ? body.dvNumber.trim() : '',
        body.particulars.trim(),
        parseFloat(body.amount),
        body.date,
        body.checkNumber ? body.checkNumber.trim() : '',
        body.controlNumber ? body.controlNumber.trim() : '',
        body.accountCode.trim(),
        parseFloat(body.debit || 0),
        parseFloat(body.credit || 0),
        body.remarks ? body.remarks.trim() : '',
        body.fund ? body.fund.trim() : (body.moph ? '' : 'General Fund'),
        body.responsibilityCenter ? body.responsibilityCenter.trim() : '',
        body.moph ? body.moph.trim() : '',
      ]
    )

    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id])
    return NextResponse.json(transaction, { status: 201 })
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
    await initDb()
    const db = await getDb()
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

    await db.run(
      `UPDATE transactions SET bankName = ?, payee = ?, address = ?, dvNumber = ?, particulars = ?, amount = ?, date = ?, checkNumber = ?, controlNumber = ?, accountCode = ?, debit = ?, credit = ?, remarks = ?, fund = ?, responsibilityCenter = ?, moph = ? WHERE id = ?`,
      [
        body.bankName.trim(),
        body.payee.trim(),
        body.address ? body.address.trim() : '',
        body.dvNumber ? body.dvNumber.trim() : '',
        body.particulars.trim(),
        parseFloat(body.amount),
        body.date,
        body.checkNumber ? body.checkNumber.trim() : '',
        body.controlNumber ? body.controlNumber.trim() : '',
        body.accountCode.trim(),
        parseFloat(body.debit || 0),
        parseFloat(body.credit || 0),
        body.remarks ? body.remarks.trim() : '',
        body.fund ? body.fund.trim() : (body.moph ? '' : 'General Fund'),
        body.responsibilityCenter ? body.responsibilityCenter.trim() : '',
        body.moph ? body.moph.trim() : '',
        id
      ]
    )

    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id])
    return NextResponse.json(transaction)
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
    await initDb()
    const db = await getDb()
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      )
    }

    await db.run('DELETE FROM transactions WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
