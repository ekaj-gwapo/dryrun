import { getDb, initDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET batch details with transactions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb()
    const db = await getDb()
    const { id: batchId } = await params

    // Get batch metadata
    const batch = await db.get(
      'SELECT * FROM transaction_batches WHERE id = ?',
      [batchId]
    )

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      )
    }

    // Get batch transactions
    const batchTransactions = await db.all(
      `SELECT id, transactionId, transactionData, createdAt 
       FROM batch_transactions 
       WHERE batchId = ? 
       ORDER BY createdAt DESC`,
      [batchId]
    )

    // Parse transaction data
    const transactions = batchTransactions.map((bt: any) => ({
      ...JSON.parse(bt.transactionData),
      batchTransactionId: bt.id,
    }))

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching batch details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batch details' },
      { status: 500 }
    )
  }
}

// POST restore transactions from batch
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb()
    const db = await getDb()
    const { id: batchId } = await params
    const body = await request.json()

    const { transactionIds } = body

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json(
        { error: 'No transaction IDs provided' },
        { status: 400 }
      )
    }

    // Get the batch transactions data using batch_transactions IDs
    const placeholders = transactionIds.map(() => '?').join(',')
    const batchTxs = await db.all(
      `SELECT id, transactionData FROM batch_transactions 
       WHERE batchId = ? AND id IN (${placeholders})`,
      [batchId, ...transactionIds]
    )

    if (batchTxs.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in batch' },
        { status: 404 }
      )
    }

    // Restore transactions back to main transactions table
    const restoredTransactions = []
    const batchTxIds = []
    const failedTransactions = []

    for (const batchTx of batchTxs) {
      const txData = JSON.parse(batchTx.transactionData)

      try {
        console.log('[v0] Restoring transaction:', txData.id)
        
        // Delete first to ensure no duplicates
        await db.run(
          `DELETE FROM transactions WHERE id = ?`,
          [txData.id]
        )

        // Then re-insert the transaction
        await db.run(
          `INSERT INTO transactions (id, userId, bankName, payee, address, dvNumber, particulars, amount, date, checkNumber, controlNumber, accountCode, debit, credit, remarks, fund, responsibilityCenter, moph, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            txData.id,
            txData.userId,
            txData.bankName,
            txData.payee,
            txData.address,
            txData.dvNumber,
            txData.particulars,
            txData.amount,
            txData.date,
            txData.checkNumber,
            txData.controlNumber,
            txData.accountCode,
            txData.debit,
            txData.credit,
            txData.remarks,
            txData.fund,
            txData.responsibilityCenter,
            txData.moph || '',
            txData.createdAt,
          ]
        )

        console.log('[v0] Successfully restored transaction:', txData.id)
        restoredTransactions.push(txData)
        batchTxIds.push(batchTx.id)
      } catch (txError: any) {
        console.error(`[v0] Error restoring transaction ${txData.id}:`, txError.message)
        failedTransactions.push({
          id: txData.id,
          error: txError.message
        })
        // Continue with other transactions even if one fails
        continue
      }
    }

    // If no transactions were restored, return error
    if (restoredTransactions.length === 0) {
      return NextResponse.json(
        { 
          error: `Failed to restore transactions. Failed transactions: ${failedTransactions.map(t => t.id).join(', ')}`,
          failedTransactions
        },
        { status: 400 }
      )
    }

    // Remove restored transactions from batch_transactions table using batch_transactions IDs
    let batchWasDeleted = false
    
    if (batchTxIds.length > 0) {
      const placeholders = batchTxIds.map(() => '?').join(',')
      await db.run(
        `DELETE FROM batch_transactions WHERE id IN (${placeholders})`,
        [...batchTxIds]
      )

      // Update batch count and amount
      const updatedBatch = await db.get(
        `SELECT COUNT(*) as count, COALESCE(SUM(CAST(json_extract(transactionData, '$.amount') AS REAL)), 0) as total 
         FROM batch_transactions WHERE batchId = ?`,
        [batchId]
      )

      // If batch has 0 transactions, delete it
      if (updatedBatch.count === 0) {
        await db.run(
          `DELETE FROM transaction_batches WHERE id = ?`,
          [batchId]
        )
        batchWasDeleted = true
      } else {
        await db.run(
          `UPDATE transaction_batches SET transactionCount = ?, totalAmount = ? WHERE id = ?`,
          [updatedBatch.count, updatedBatch.total, batchId]
        )
      }
    }

    return NextResponse.json({
      success: true,
      restoredCount: restoredTransactions.length,
      transactions: restoredTransactions,
      batchDeleted: batchWasDeleted,
    })
  } catch (error) {
    console.error('Error restoring transactions:', error)
    return NextResponse.json(
      { error: 'Failed to restore transactions' },
      { status: 500 }
    )
  }
}

// DELETE batch completely and restore transactions
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb()
    const db = await getDb()
    const { id: batchId } = await params

    // Get ALL transactions in this batch
    const batchTxs = await db.all(
      `SELECT id, transactionData FROM batch_transactions WHERE batchId = ?`,
      [batchId]
    )

    if (batchTxs.length === 0) {
      // Just delete the empty batch
      await db.run(`DELETE FROM transaction_batches WHERE id = ?`, [batchId])
      return NextResponse.json({ success: true, message: 'Empty batch deleted' })
    }

    // Restore transactions back to main transactions table
    for (const batchTx of batchTxs) {
      const txData = JSON.parse(batchTx.transactionData)
      try {
        await db.run(
          `DELETE FROM transactions WHERE id = ?`,
          [txData.id]
        )
        await db.run(
          `INSERT INTO transactions (id, userId, bankName, payee, address, dvNumber, particulars, amount, date, checkNumber, controlNumber, accountCode, debit, credit, remarks, fund, responsibilityCenter, moph, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            txData.id, txData.userId, txData.bankName, txData.payee, txData.address, txData.dvNumber,
            txData.particulars, txData.amount, txData.date, txData.checkNumber, txData.controlNumber,
            txData.accountCode, txData.debit, txData.credit, txData.remarks, txData.fund,
            txData.responsibilityCenter, txData.moph || '', txData.createdAt,
          ]
        )
      } catch (e: any) {
        console.error('Error restoring transaction', e.message)
      }
    }

    // Delete from batch_transactions and transaction_batches
    await db.run(`DELETE FROM batch_transactions WHERE batchId = ?`, [batchId])
    await db.run(`DELETE FROM transaction_batches WHERE id = ?`, [batchId])

    return NextResponse.json({ success: true, message: 'Batch deleted and transactions restored' })
  } catch (error) {
    console.error('Error deleting batch:', error)
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    )
  }
}

