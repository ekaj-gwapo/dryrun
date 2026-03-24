import { getDb, initDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// GET all batches for a viewer
export async function GET(request: NextRequest) {
  try {
    await initDb()
    const db = await getDb()
    const viewerId = request.nextUrl.searchParams.get('viewerId')

    if (!viewerId) {
      return NextResponse.json(
        { error: 'Viewer ID required' },
        { status: 400 }
      )
    }

    const batches = await db.all(
      `SELECT * FROM transaction_batches 
       WHERE viewerId = ? 
       ORDER BY createdAt DESC`,
      [viewerId]
    )

    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}

// POST create a new batch
export async function POST(request: NextRequest) {
  try {
    await initDb()
    const db = await getDb()
    const body = await request.json()

    const {
      viewerId,
      entryUserId,
      transactions,
      appliedFilters,
    } = body

    if (!viewerId || !entryUserId || !transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const batchId = randomUUID()
    const totalAmount = transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0)
    const now = new Date().toISOString()
    const filterStr = JSON.stringify(appliedFilters || {})

    // Get the count of batches for this viewer to generate sequential number
    const batchCount = await db.get(
      `SELECT COUNT(*) as count FROM transaction_batches WHERE viewerId = ?`,
      [viewerId]
    )
    const sequentialNumber = String(batchCount.count + 1).padStart(2, '0')
    const batchName = `Batch ${sequentialNumber}`

    // Create batch record
    await db.run(
      `INSERT INTO transaction_batches (id, viewerId, entryUserId, batchName, transactionCount, totalAmount, appliedFilters, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batchId,
        viewerId,
        entryUserId,
        batchName,
        transactions.length,
        totalAmount,
        filterStr,
        now,
      ]
    )

    // Create batch transaction records and delete from main transactions table
    for (const tx of transactions) {
      const txId = randomUUID()
      await db.run(
        `INSERT INTO batch_transactions (id, batchId, transactionId, transactionData, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [
          txId,
          batchId,
          tx.id,
          JSON.stringify(tx),
          now,
        ]
      )

      // Delete the transaction from main transactions table
      await db.run(
        `DELETE FROM transactions WHERE id = ?`,
        [tx.id]
      )
    }

    const batch = await db.get(
      'SELECT * FROM transaction_batches WHERE id = ?',
      [batchId]
    )

    return NextResponse.json(batch, { status: 201 })
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    )
  }
}
