import { NextRequest, NextResponse } from 'next/server'
import { setTimer, cancelTimer, getTimerStatus } from '@/lib/store'

// GET /api/timer - Get timer status
export async function GET() {
  try {
    const status = getTimerStatus()
    return NextResponse.json(status)
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// POST /api/timer - Set timer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, value } = body

    if (!type || !value) {
      return NextResponse.json(
        { success: false, message: 'Timer type and value are required' },
        { status: 400 }
      )
    }

    const result = setTimer(type as 'hours' | 'days' | 'date', String(value))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/timer - Cancel timer
export async function DELETE() {
  try {
    const cancelled = cancelTimer()
    if (cancelled) {
      return NextResponse.json({ success: true, message: 'টাইমার বাতিল হয়েছে' })
    }
    return NextResponse.json({ success: false, message: 'কোনো টাইমার নেই' })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
