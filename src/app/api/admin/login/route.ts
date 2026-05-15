import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/admin/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      )
    }

    const adminRecord = await db.adminPassword.findFirst()
    if (!adminRecord) {
      // Create default admin password if not exists
      await db.adminPassword.create({ data: { password: 'fahad' } })
      return NextResponse.json({
        success: password === 'fahad',
        message: password === 'fahad' ? 'Login successful' : 'Invalid password',
      })
    }

    if (password === adminRecord.password) {
      return NextResponse.json({ success: true, message: 'Login successful' })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
