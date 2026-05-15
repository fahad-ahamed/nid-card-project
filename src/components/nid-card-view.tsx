'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/lib/store'
import NidCardPrint from './nid-card-print'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Download,
  FileImage,
  Printer,
  Loader2,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

export default function NidCardView() {
  const { currentCard, setCurrentView } = useAppStore()
  const [downloading, setDownloading] = useState<string | null>(null)

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg">কোনো কার্ড নেই / No card to display</p>
        <Button
          className="mt-4 bg-[#006a4e] hover:bg-[#004d38] text-white"
          onClick={() => setCurrentView('home')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ফিরে যান / Go Back
        </Button>
      </div>
    )
  }

  const downloadAsPNG = async () => {
    setDownloading('png')
    try {
      const html2canvas = (await import('html2canvas')).default

      // Capture front
      const frontEl = document.getElementById('nid-front')
      const backEl = document.getElementById('nid-back')

      if (frontEl) {
        const canvas = await html2canvas(frontEl, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
        })
        const link = document.createElement('a')
        link.download = `NID_Front_${currentCard.nid}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }

      if (backEl) {
        const canvas = await html2canvas(backEl, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
        })
        const link = document.createElement('a')
        link.download = `NID_Back_${currentCard.nid}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }

      toast.success('PNG downloaded successfully!')
    } catch {
      toast.error('Failed to download PNG')
    } finally {
      setDownloading(null)
    }
  }

  const downloadAsPDF = async () => {
    setDownloading('pdf')
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const frontEl = document.getElementById('nid-front')
      const backEl = document.getElementById('nid-back')

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [105, 160],
      })

      if (frontEl) {
        const canvas = await html2canvas(frontEl, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
        })
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 0, 0, 160, 105)
      }

      if (backEl) {
        pdf.addPage([160, 105], 'landscape')
        const canvas = await html2canvas(backEl, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
        })
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 0, 0, 160, 105)
      }

      pdf.save(`NID_${currentCard.nid}.pdf`)
      toast.success('PDF downloaded successfully!')
    } catch {
      toast.error('Failed to download PDF')
    } finally {
      setDownloading(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentView('home')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          ফিরে যান / Back
        </Button>
        <h2 className="text-lg font-bold text-[#006a4e]">
          NID কার্ড দেখুন / View NID Card
        </h2>
      </div>

      {/* Card Display */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-6 overflow-auto">
          <div className="flex flex-col items-center">
            <NidCardPrint card={currentCard} />
          </div>
        </CardContent>
      </Card>

      {/* Download Buttons */}
      <div className="flex flex-wrap justify-center gap-3 print:hidden">
        <Button
          onClick={downloadAsPDF}
          disabled={downloading !== null}
          className="bg-[#006a4e] hover:bg-[#004d38] text-white gap-2"
        >
          {downloading === 'pdf' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          PDF ডাউনলোড / Download PDF
        </Button>
        <Button
          onClick={downloadAsPNG}
          disabled={downloading !== null}
          variant="outline"
          className="gap-2 border-[#006a4e] text-[#006a4e] hover:bg-[#006a4e] hover:text-white"
        >
          {downloading === 'png' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileImage className="h-4 w-4" />
          )}
          PNG ডাউনলোড / Download PNG
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="gap-2 border-[#c1272d] text-[#c1272d] hover:bg-[#c1272d] hover:text-white"
        >
          <Printer className="h-4 w-4" />
          প্রিন্ট / Print
        </Button>
      </div>

      {/* Card Info */}
      <Card className="border border-gray-200 print:hidden">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            কার্ডের তথ্য / Card Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-400">NID:</span>{' '}
              <span className="font-mono font-bold">{currentCard.nid}</span>
            </div>
            <div>
              <span className="text-gray-400">PIN:</span>{' '}
              <span className="font-mono font-bold">{currentCard.pin}</span>
            </div>
            <div>
              <span className="text-gray-400">Issue:</span>{' '}
              <span className="font-mono">{currentCard.issueDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
