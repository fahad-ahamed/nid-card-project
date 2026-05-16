import { NextRequest, NextResponse } from 'next/server'
import {
  getAllCards,
  getCardByNid,
  getCardByPin,
  createCard,
  deleteCard,
  deleteAllCards,
  searchCards,
} from '@/lib/store'

// GET /api/nid - Search by NID or PIN, or get all, or admin search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nid = searchParams.get('nid')
    const pin = searchParams.get('pin')
    const all = searchParams.get('all')
    const q = searchParams.get('q') // admin search query

    // Admin search - search across all fields
    if (q !== null) {
      const results = searchCards(q)
      return NextResponse.json({ success: true, data: results, total: results.length })
    }

    // Get all NID cards
    if (all === 'true') {
      const cards = getAllCards()
      return NextResponse.json({ success: true, data: cards })
    }

    // Search by NID number
    if (nid) {
      const card = getCardByNid(nid)
      if (!card) {
        return NextResponse.json(
          { found: false, message: 'কোনো তথ্য পাওয়া যায়নি' },
          { status: 404 }
        )
      }
      // Return in the same format as original PHP nid_search.php
      return NextResponse.json({
        found: true,
        data: {
          name_bn: card.nameBn,
          name_en: card.nameEn,
          nid: card.nid,
          pin: card.pin,
          father: card.father,
          mother: card.mother,
          birth: card.birthPlace,
          dob: card.dob,
          blood: card.blood,
          address: card.address,
          gender: card.gender,
          issue_date: card.issueDate,
          created_at: card.createdAt,
          photo_base64: card.photoBase64,
          photo_type: card.photoType,
          sign_base64: card.signBase64,
          sign_type: card.signType,
        }
      })
    }

    // Search by PIN
    if (pin) {
      const card = getCardByPin(pin)
      if (!card) {
        return NextResponse.json(
          { found: false, message: 'কোনো তথ্য পাওয়া যায়নি' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        found: true,
        data: {
          name_bn: card.nameBn,
          name_en: card.nameEn,
          nid: card.nid,
          pin: card.pin,
          father: card.father,
          mother: card.mother,
          birth: card.birthPlace,
          dob: card.dob,
          blood: card.blood,
          address: card.address,
          gender: card.gender,
          issue_date: card.issueDate,
          created_at: card.createdAt,
          photo_base64: card.photoBase64,
          photo_type: card.photoType,
          sign_base64: card.signBase64,
          sign_type: card.signType,
        }
      })
    }

    // Simple search (for nav search) - by NID or PIN
    const search = searchParams.get('search')
    if (search) {
      // Try NID first
      let card = getCardByNid(search)
      if (!card) {
        // Try PIN
        card = getCardByPin(search)
      }
      if (!card) {
        return NextResponse.json({ found: false, message: 'কোনো তথ্য পাওয়া যায়নি' })
      }
      return NextResponse.json({
        found: true,
        data: {
          name_bn: card.nameBn,
          name_en: card.nameEn,
          nid: card.nid,
          pin: card.pin,
          father: card.father,
          mother: card.mother,
          birth: card.birthPlace,
          dob: card.dob,
          blood: card.blood,
          address: card.address,
          gender: card.gender,
          issue_date: card.issueDate,
          created_at: card.createdAt,
          photo_base64: card.photoBase64,
          photo_type: card.photoType,
          sign_base64: card.signBase64,
          sign_type: card.signType,
        }
      })
    }

    return NextResponse.json(
      { success: false, message: 'Provide nid, pin, q, or all=true parameter' },
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

    const card = createCard({
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
    })

    if (!card) {
      return NextResponse.json(
        { success: false, message: 'NID number already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true, data: card }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/nid - Delete by NID, delete all, or delete selected
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nid = searchParams.get('nid')
    const all = searchParams.get('all')
    const nids = searchParams.get('nids') // comma-separated

    // Delete selected NIDs
    if (nids) {
      const nidList = nids.split(',').filter(Boolean)
      let count = 0
      for (const n of nidList) {
        const deleted = deleteCard(n)
        if (deleted) count++
      }
      return NextResponse.json({ success: true, message: count + 'টি NID ডাটা ডিলিট হয়েছে' })
    }

    // Delete all
    if (all === 'true') {
      const count = deleteAllCards()
      return NextResponse.json({ success: true, message: count + 'টি NID ডাটা ডিলিট হয়েছে' })
    }

    // Delete single
    if (nid) {
      const card = getCardByNid(nid)
      if (!card) {
        return NextResponse.json(
          { success: false, message: 'ফাইল পাওয়া যায়নি' },
          { status: 404 }
        )
      }
      deleteCard(nid)
      return NextResponse.json({ success: true, message: 'NID ' + nid + ' ডিলিট হয়েছে' })
    }

    return NextResponse.json(
      { success: false, message: 'Provide nid, nids, or all=true parameter' },
      { status: 400 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
