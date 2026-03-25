import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Helper to map database columns to camelCase
const mapBatch = (b: any) => ({
  id: b.id,
  viewerId: b.viewerid,
  entryUserId: b.entryuserid,
  batchName: b.batchname,
  transactionCount: b.transactioncount,
  totalAmount: b.totalamount,
  appliedFilters: b.appliedfilters,
  createdAt: b.createdat
})

// GET batch details with transactions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params

    // Get batch metadata
    const { data: batch, error: batchError } = await supabase
      .from('transaction_batches')
      .select('*')
      .eq('id', batchId)
      .single()

    if (batchError || !batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      )
    }

    // Get batch transactions
    const { data: batchTransactions, error: txError } = await supabase
      .from('batch_transactions')
      .select('*')
      .eq('batchid', batchId)
      .order('createdat', { ascending: false })

    if (txError) throw txError

    // Parse transaction data
    const transactions = batchTransactions.map((bt: any) => ({
      ...(typeof bt.transactiondata === 'string' ? JSON.parse(bt.transactiondata) : bt.transactiondata),
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
    const { data: batchTxs, error: fetchError } = await supabase
      .from('batch_transactions')
      .select('id, transactiondata')
      .eq('batchid', batchId)
      .in('id', transactionIds)

    if (fetchError || !batchTxs || batchTxs.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in batch' },
        { status: 404 }
      )
    }

    // Restore transactions back to main transactions table
    const restoredTransactions = []
    const batchTxIdsToExclude = []
    const failedTransactions = []

    for (const batchTx of batchTxs) {
      const txData = typeof batchTx.transactiondata === 'string' ? JSON.parse(batchTx.transactiondata) : batchTx.transactiondata

      try {
        console.log('[v0] Restoring transaction:', txData.id)
        
        // Delete first to ensure no duplicates
        await supabase.from('transactions').delete().eq('id', txData.id)

        // Then re-insert the transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert([
            {
              id: txData.id,
              userid: txData.userId,
              bankname: txData.bankName,
              payee: txData.payee,
              address: txData.address,
              dvnumber: txData.dvNumber,
              particulars: txData.particulars,
              amount: txData.amount,
              date: txData.date,
              checknumber: txData.checkNumber,
              controlnumber: txData.controlNumber,
              accountcode: txData.accountCode,
              debit: txData.debit,
              credit: txData.credit,
              remarks: txData.remarks,
              fund: txData.fund,
              responsibilitycenter: txData.responsibilityCenter,
              moph: txData.moph || '',
              createdat: txData.createdAt,
            }
          ])

        if (insertError) throw insertError

        console.log('[v0] Successfully restored transaction:', txData.id)
        restoredTransactions.push(txData)
        batchTxIdsToExclude.push(batchTx.id)
      } catch (txError: any) {
        console.error(`[v0] Error restoring transaction ${txData.id}:`, txError.message)
        failedTransactions.push({
          id: txData.id,
          error: txError.message
        })
        continue
      }
    }

    if (restoredTransactions.length === 0) {
      return NextResponse.json(
        { 
          error: `Failed to restore transactions.`,
          failedTransactions
        },
        { status: 400 }
      )
    }

    let batchWasDeleted = false
    
    if (batchTxIdsToExclude.length > 0) {
      // Remove restored transactions from batch_transactions table
      await supabase.from('batch_transactions').delete().in('id', batchTxIdsToExclude)

      // Update batch count and amount
      const { data: remainingTxs, error: remainingError } = await supabase
        .from('batch_transactions')
        .select('transactiondata')
        .eq('batchid', batchId)

      if (remainingError) throw remainingError

      if (!remainingTxs || remainingTxs.length === 0) {
        await supabase.from('transaction_batches').delete().eq('id', batchId)
        batchWasDeleted = true
      } else {
        const totalAmount = remainingTxs.reduce((sum, bt) => {
          const data = typeof bt.transactiondata === 'string' ? JSON.parse(bt.transactiondata) : bt.transactiondata
          return sum + (data.amount || 0)
        }, 0)

        await supabase
          .from('transaction_batches')
          .update({
            transactioncount: remainingTxs.length,
            totalamount: totalAmount,
          })
          .eq('id', batchId)
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
    const { id: batchId } = await params

    // Get ALL transactions in this batch
    const { data: batchTxs, error: fetchError } = await supabase
      .from('batch_transactions')
      .select('id, transactiondata')
      .eq('batchid', batchId)

    if (fetchError) throw fetchError

    if (!batchTxs || batchTxs.length === 0) {
      await supabase.from('transaction_batches').delete().eq('id', batchId)
      return NextResponse.json({ success: true, message: 'Empty batch deleted' })
    }

    // Restore transactions back to main transactions table
    for (const batchTx of batchTxs) {
      const txData = typeof batchTx.transactiondata === 'string' ? JSON.parse(batchTx.transactiondata) : batchTx.transactiondata
      try {
        await supabase.from('transactions').delete().eq('id', txData.id)
        await supabase
          .from('transactions')
          .insert([
            {
              id: txData.id,
              userid: txData.userId,
              bankname: txData.bankName,
              payee: txData.payee,
              address: txData.address,
              dvnumber: txData.dvNumber,
              particulars: txData.particulars,
              amount: txData.amount,
              date: txData.date,
              checknumber: txData.checkNumber,
              controlnumber: txData.controlNumber,
              accountcode: txData.accountCode,
              debit: txData.debit,
              credit: txData.credit,
              remarks: txData.remarks,
              fund: txData.fund,
              responsibilitycenter: txData.responsibilityCenter,
              moph: txData.moph || '',
              createdat: txData.createdAt,
            }
          ])
      } catch (e: any) {
        console.error('Error restoring transaction', e.message)
      }
    }

    // Delete from batch_transactions and transaction_batches
    await supabase.from('batch_transactions').delete().eq('batchid', batchId)
    await supabase.from('transaction_batches').delete().eq('id', batchId)

    return NextResponse.json({ success: true, message: 'Batch deleted and transactions restored' })
  } catch (error) {
    console.error('Error deleting batch:', error)
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    )
  }
}
