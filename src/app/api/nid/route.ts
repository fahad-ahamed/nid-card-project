import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/nid - Search by NID or PIN, or get all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nid = searchParams.get('nid')
    const pin = searchParams.get('pin')
    const all = searchParams.get('all')

    if (all === 'true') {
      const cards = await db.nidCard.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ success: true, data: cards })
    }

    if (nid) {
      const card = await db.nidCard.findUnique({ where: { nid } })
      if (!card) {
        return NextResponse.json(
          { success: false, message: 'NID card not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: card })
    }

    if (pin) {
      const card = await db.nidCard.findFirst({ where: { pin } })
      if (!card) {
        return NextResponse.json(
          { success: false, message: 'NID card not found with this PIN' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: card })
    }

    return NextResponse.json(
      { success: false, message: 'Provide nid, pin, or all=true parameter' },
      { status: 400 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// POST /api/nid - Create new NID card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nameBn,
      nameEn,
      nid,
      pin,
      father,
      mother,
      birthPlace,
      dob,
      blood,
      address,
      gender,
      photoBase64,
      photoType,
      signBase64,
      signType,
      issueDate,
    } = body

    // Validate required fields
    if (!nameBn || !nameEn || !nid || !pin || !father || !mother || !dob || !blood || !address || !issueDate) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Check if NID already exists
    const existing = await db.nidCard.findUnique({ where: { nid } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'NID number already exists' },
        { status: 409 }
      )
    }

    const card = await db.nidCard.create({
      data: {
        nameBn,
        nameEn,
        nid,
        pin,
        father,
        mother,
        birthPlace: birthPlace || '',
        dob,
        blood,
        address,
        gender: gender || 'male',
        photoBase64: photoBase64 || null,
        photoType: photoType || null,
        signBase64: signBase64 || null,
        signType: signType || null,
        issueDate,
      },
    })

    return NextResponse.json({ success: true, data: card }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/nid - Delete by NID or delete all
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nid = searchParams.get('nid')
    const all = searchParams.get('all')

    if (all === 'true') {
      await db.nidCard.deleteMany()
      return NextResponse.json({ success: true, message: 'All NID cards deleted' })
    }

    if (nid) {
      const card = await db.nidCard.findUnique({ where: { nid } })
      if (!card) {
        return NextResponse.json(
          { success: false, message: 'NID card not found' },
          { status: 404 }
        )
      }
      await db.nidCard.delete({ where: { nid } })
      return NextResponse.json({ success: true, message: 'NID card deleted' })
    }

    return NextResponse.json(
      { success: false, message: 'Provide nid or all=true parameter' },
      { status: 400 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
