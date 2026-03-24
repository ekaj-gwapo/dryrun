import { getDb, initDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await initDb()
    const db = await getDb()
    
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

    const transactions = body.transactions

    if (transactions.length === 0) {
      return NextResponse.json(
        { message: 'No transactions to import' },
        { status: 200 }
      )
    }

    // Begin transaction for bulk insert
    await db.run('BEGIN TRANSACTION')
    
    let importedCount = 0

    try {
      for (const tx of transactions) {
        const id = randomUUID()
        
        // Basic validation for required fields
        if (!tx.bankName || !tx.payee || !tx.particulars || !tx.amount || !tx.date || !tx.accountCode) {
           console.warn('Skipping invalid transaction row:', tx)
           continue // Skip invalid rows or you can throw to fail the entire batch
        }

        await db.run(
          `INSERT INTO transactions (id, userId, bankName, payee, address, dvNumber, particulars, amount, date, checkNumber, controlNumber, accountCode, debit, credit, remarks, fund, responsibilityCenter, moph)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            userId,
            tx.bankName?.toString().trim() || '',
            tx.payee?.toString().trim() || '',
            tx.address ? tx.address.toString().trim() : '',
            tx.dvNumber ? tx.dvNumber.toString().trim() : '',
            tx.particulars?.toString().trim() || '',
            parseFloat(tx.amount) || 0,
            tx.date,
            tx.checkNumber ? tx.checkNumber.toString().trim() : '',
            tx.controlNumber ? tx.controlNumber.toString().trim() : '',
            tx.accountCode?.toString().trim() || '',
            parseFloat(tx.debit) || 0,
            parseFloat(tx.credit) || 0,
            tx.remarks ? tx.remarks.toString().trim() : '',
            tx.fund ? tx.fund.toString().trim() : (tx.moph ? '' : 'General Fund'),
            tx.responsibilityCenter ? tx.responsibilityCenter.toString().trim() : '',
            tx.moph ? tx.moph.toString().trim() : '',
          ]
        )
        importedCount++
      }
      
      await db.run('COMMIT')
      
      return NextResponse.json(
        { success: true, count: importedCount, message: `Successfully imported ${importedCount} transactions` },
        { status: 201 }
      )
      
    } catch (dbError) {
      await db.run('ROLLBACK')
      throw dbError
    }

  } catch (error) {
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk import' },
      { status: 500 }
    )
  }
}
