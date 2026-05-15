'use client'

import React, { useEffect, useRef } from 'react'
import type { NidCardData } from '@/lib/store'

// Simple PDF417 barcode generator using canvas
function generatePDF417Barcode(
  canvas: HTMLCanvasElement,
  data: string
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Simplified PDF417-like barcode rendering
  // For production, use a proper PDF417 library
  const moduleWidth = 1
  const rowHeight = 2
  const cols = 30
  const rows = Math.ceil(data.length * 1.5)

  canvas.width = cols * moduleWidth * 3 + 20
  canvas.height = rows * rowHeight + 10

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Start pattern
  let x = 10
  let y = 5

  for (let row = 0; row < rows; row++) {
    x = 10
    for (let col = 0; col < cols; col++) {
      const charIndex = (row * cols + col) % data.length
      const charCode = data.charCodeAt(charIndex)
      const pattern = charCode % 8

      for (let bit = 0; bit < 3; bit++) {
        const isBlack = (pattern >> bit) & 1
        if (isBlack) {
          ctx.fillStyle = '#000000'
          ctx.fillRect(x, y, moduleWidth, rowHeight)
        }
        x += moduleWidth
      }
    }
    y += rowHeight
  }
}

interface NidCardPrintProps {
  card: NidCardData
}

export default function NidCardPrint({ card }: NidCardPrintProps) {
  const barcodeRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (barcodeRef.current) {
      const barcodeData = `<pin>${card.pin}</pin><name>${card.nameEn}</name><DOB>${card.dob}</DOB><FP></FP><F>Right Index</F><TYPE>A</TYPE><V>2.0</V>`
      generatePDF417Barcode(barcodeRef.current, barcodeData)
    }
  }, [card])

  const photoSrc = card.photoBase64
    ? `data:${card.photoType || 'image/jpeg'};base64,${card.photoBase64}`
    : null

  const signSrc = card.signBase64
    ? `data:${card.signType || 'image/png'};base64,${card.signBase64}`
    : null

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* FRONT SIDE */}
      <div
        id="nid-front"
        className="relative bg-white shadow-xl border-2 border-gray-300"
        style={{
          width: '540px',
          height: '340px',
          fontFamily:
            "'Noto Sans Bengali', 'Kalpurush', 'Siyam Rupali', 'Arial', sans-serif",
        }}
      >
        {/* Top government header */}
        <div
          className="flex items-center justify-center gap-3 text-white py-2 px-4"
          style={{ backgroundColor: '#006a4e' }}
        >
          {/* Bangladesh Emblem */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="40" r="25" fill="#f4a300" />
            <path
              d="M50 15 L55 30 L70 30 L58 40 L62 55 L50 45 L38 55 L42 40 L30 30 L45 30Z"
              fill="#c1272d"
            />
            <rect x="45" y="60" width="10" height="25" fill="#f4a300" />
            <rect x="30" y="75" width="40" height="5" fill="#f4a300" />
            <rect x="25" y="82" width="50" height="4" fill="#f4a300" />
          </svg>
          <div className="text-center">
            <div className="text-sm font-bold leading-tight">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </div>
            <div className="text-[10px] leading-tight opacity-90">
              Government of the People&apos;s Republic of Bangladesh
            </div>
          </div>
        </div>

        {/* Card Title */}
        <div
          className="text-center py-1"
          style={{ backgroundColor: '#f0f2f5' }}
        >
          <div className="text-xs font-bold text-[#006a4e]">
            জাতীয় পরিচয় পত্র / National ID Card
          </div>
        </div>

        {/* Main Content */}
        <div className="flex p-3 gap-3" style={{ height: '245px' }}>
          {/* Photo */}
          <div className="flex-shrink-0">
            <div
              className="border-2 border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden"
              style={{ width: '120px', height: '150px' }}
            >
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">
                  ছবি<br />
                  Photo
                </div>
              )}
            </div>
          </div>

          {/* Data Fields */}
          <div className="flex-1 text-[11px] leading-relaxed space-y-1">
            <div>
              <span className="text-gray-500">নাম: </span>
              <span className="font-bold text-black">{card.nameBn}</span>
            </div>
            <div>
              <span className="text-gray-500">Name: </span>
              <span className="font-bold text-black">{card.nameEn}</span>
            </div>
            <div>
              <span className="text-gray-500">পিতা: </span>
              <span className="text-black">{card.father}</span>
            </div>
            <div>
              <span className="text-gray-500">মাতা: </span>
              <span className="text-black">{card.mother}</span>
            </div>
            <div>
              <span className="text-gray-500">জন্ম তারিখ: </span>
              <span className="text-black">{card.dob}</span>
            </div>
            <div>
              <span className="text-gray-500">Date of Birth: </span>
              <span className="text-black">{card.dob}</span>
            </div>
            <div className="pt-1 border-t border-gray-200">
              <span className="text-[#006a4e] font-bold text-xs">
                ID NO: {card.nid}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2"
          style={{ backgroundColor: '#006a4e' }}
        />
      </div>

      {/* BACK SIDE */}
      <div
        id="nid-back"
        className="relative bg-white shadow-xl border-2 border-gray-300"
        style={{
          width: '540px',
          height: '340px',
          fontFamily:
            "'Noto Sans Bengali', 'Kalpurush', 'Siyam Rupali', 'Arial', sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          className="h-2"
          style={{ backgroundColor: '#006a4e' }}
        />

        {/* Back header */}
        <div
          className="text-center py-1"
          style={{ backgroundColor: '#f0f2f5' }}
        >
          <div className="text-xs font-bold text-[#006a4e]">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / Govt. of Bangladesh
          </div>
        </div>

        {/* Back content */}
        <div className="p-4 space-y-2 text-[11px]" style={{ height: '280px' }}>
          {/* Property text */}
          <div className="text-gray-600 text-[10px] border-b border-gray-200 pb-1">
            এই কার্ডটি বাংলাদেশ নির্বাচন কমিশন কর্তৃক প্রদত্ত এবং এটি
            গণপ্রজাতন্ত্রী বাংলাদেশের সরকারের সম্পত্তি।
          </div>

          <div>
            <span className="text-gray-500">ঠিকানা: </span>
            <span className="text-black font-medium">{card.address}</span>
          </div>

          <div className="flex gap-6">
            <div>
              <span className="text-gray-500">রক্তের গ্রুপ: </span>
              <span className="text-black font-bold">{card.blood}</span>
            </div>
            <div>
              <span className="text-gray-500">Blood Group: </span>
              <span className="text-black font-bold">{card.blood}</span>
            </div>
          </div>

          <div>
            <span className="text-gray-500">জন্মস্থান: </span>
            <span className="text-black">{card.birthPlace}</span>
          </div>

          {/* Signature area */}
          <div className="flex items-end gap-4 pt-2">
            <div className="flex-1">
              {signSrc && (
                <img
                  src={signSrc}
                  alt="Signature"
                  className="h-10 object-contain"
                />
              )}
              <div className="border-t border-gray-400 text-[9px] text-gray-500 mt-1">
                প্রদানকারী কর্তৃপক্ষের স্বাক্ষর
              </div>
            </div>
            <div className="text-[10px] text-gray-600">
              <div>
                প্রদানের তারিখ: <span className="font-bold">{card.issueDate}</span>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="pt-1">
            <canvas
              ref={barcodeRef}
              className="border border-gray-200"
              style={{ maxWidth: '100%', height: '50px' }}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2"
          style={{ backgroundColor: '#006a4e' }}
        />
      </div>
    </div>
  )
}
