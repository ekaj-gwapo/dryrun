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

// GET all batches for a viewer
export async function GET(request: NextRequest) {
  try {
    const viewerId = request.nextUrl.searchParams.get('viewerId')

    if (!viewerId) {
      return NextResponse.json(
        { error: 'Viewer ID required' },
        { status: 400 }
      )
    }

    const { data: batches, error } = await supabase
      .from('transaction_batches')
      .select('*')
      .eq('viewerid', viewerId)
      .order('createdat', { ascending: false })

    if (error) throw error

    return NextResponse.json(batches?.map(mapBatch) || [])
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

    const totalAmount = transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0)
    
    // Get the count of batches for this viewer to generate sequential number
    const { count, error: countError } = await supabase
      .from('transaction_batches')
      .select('*', { count: 'exact', head: true })
      .eq('viewerid', viewerId)

    if (countError) throw countError

    const sequentialNumber = String((count || 0) + 1).padStart(2, '0')
    const batchName = `Batch ${sequentialNumber}`

    // Create batch record
    const { data: batch, error: batchError } = await supabase
      .from('transaction_batches')
      .insert([
        {
          viewerid: viewerId,
          entryuserid: entryUserId,
          batchname: batchName,
          transactioncount: transactions.length,
          totalamount: totalAmount,
          appliedfilters: appliedFilters || {},
        }
      ])
      .select('*')
      .single()

    if (batchError) throw batchError

    // Create batch transaction records and delete from main transactions table
    for (const tx of transactions) {
      const { error: batchTxError } = await supabase
        .from('batch_transactions')
        .insert([
          {
            batchid: batch.id,
            transactionid: tx.id,
            transactiondata: tx,
          }
        ])

      if (batchTxError) throw batchTxError

      // Delete the transaction from main transactions table
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', tx.id)

      if (deleteError) throw deleteError
    }

    return NextResponse.json(mapBatch(batch), { status: 201 })
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    )
  }
}
