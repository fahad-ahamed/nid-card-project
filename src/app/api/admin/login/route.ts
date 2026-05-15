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
        message: password === 'fahad' ? 'Login successful' : 'ভুল পাসওয়ার্ড!',
      })
    }

    if (password === adminRecord.password) {
      return NextResponse.json({ success: true, message: 'Login successful' })
    }

    return NextResponse.json(
      { success: false, message: 'ভুল পাসওয়ার্ড!' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/login - Password reset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { resetCode, newPassword, confirmPassword } = body

    const RESET_CODE = '32423'

    if (resetCode !== RESET_CODE) {
      return NextResponse.json(
        { success: false, message: 'ভুল রিসেট কোড!' },
        { status: 400 }
      )
    }

    if (!newPassword || newPassword.length < 3) {
      return NextResponse.json(
        { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৩ অক্ষরের হতে হবে!' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'পাসওয়ার্ড মিলছে না!' },
        { status: 400 }
      )
    }

    const adminRecord = await db.adminPassword.findFirst()
    if (adminRecord) {
      await db.adminPassword.update({
        where: { id: adminRecord.id },
        data: { password: newPassword },
      })
    } else {
      await db.adminPassword.create({ data: { password: newPassword } })
    }

    return NextResponse.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
