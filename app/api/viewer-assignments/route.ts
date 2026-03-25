import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Helper to map database columns to camelCase
const mapAssignment = (a: any) => ({
  id: a.id,
  viewerId: a.viewerid,
  entryUserId: a.entryuserid,
  createdAt: a.createdat,
  email: a.users?.email
})

// GET viewer's assigned entry users
export async function GET(request: NextRequest) {
  try {
    const viewerId = request.nextUrl.searchParams.get('viewerId')

    if (!viewerId) {
      return NextResponse.json(
        { error: 'Viewer ID required' },
        { status: 400 }
      )
    }

    const { data: assignments, error } = await supabase
      .from('viewer_access')
      .select(`
        *,
        users!viewer_access_entryuserid_fkey (
          email
        )
      `)
      .eq('viewerid', viewerId)

    if (error) throw error

    return NextResponse.json(assignments?.map(mapAssignment) || [])
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

// POST new viewer assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { viewerId, entryUserId } = body

    if (!viewerId || !entryUserId) {
      return NextResponse.json(
        { error: 'Viewer ID and Entry User ID required' },
        { status: 400 }
      )
    }

    const { data: assignment, error } = await supabase
      .from('viewer_access')
      .insert([{ viewerid: viewerId, entryuserid: entryUserId }])
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') { // Postgres code for duplicate key
        return NextResponse.json(
          { error: 'Assignment already exists' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json(mapAssignment(assignment), { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}

// DELETE viewer assignment
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('viewer_access')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}
