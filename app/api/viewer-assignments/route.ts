import { getDb, initDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// GET viewer's assigned entry users
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

    const assignments = await db.all(
      `SELECT va.*, u.email FROM viewer_access va
       LEFT JOIN users u ON va.entryUserId = u.id
       WHERE va.viewerId = ?`,
      [viewerId]
    )

    return NextResponse.json(assignments)
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
    await initDb()
    const db = await getDb()
    const body = await request.json()
    const { viewerId, entryUserId } = body

    if (!viewerId || !entryUserId) {
      return NextResponse.json(
        { error: 'Viewer ID and Entry User ID required' },
        { status: 400 }
      )
    }

    const id = randomUUID()
    
    try {
      await db.run(
        'INSERT INTO viewer_access (id, viewerId, entryUserId) VALUES (?, ?, ?)',
        [id, viewerId, entryUserId]
      )
    } catch (err: any) {
      if (err.message.includes('UNIQUE')) {
        return NextResponse.json(
          { error: 'Assignment already exists' },
          { status: 400 }
        )
      }
      throw err
    }

    const assignment = await db.get('SELECT * FROM viewer_access WHERE id = ?', [id])
    return NextResponse.json(assignment, { status: 201 })
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
    await initDb()
    const db = await getDb()
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID required' },
        { status: 400 }
      )
    }

    await db.run('DELETE FROM viewer_access WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}
