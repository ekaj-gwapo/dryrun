import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  response.cookies.set({
    name: 'user',
    value: '',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  })

  return response
}
