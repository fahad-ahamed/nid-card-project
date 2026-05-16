'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Sparkles, Loader2, ImageIcon, UserCircle } from 'lucide-react'
import { toast } from 'sonner'

const DEMO_DATA = {
  nameBn: 'মোহাম্মদ রহিম উদ্দিন',
  nameEn: 'Mohammad Rahim Uddin',
  nid: '19987654321001234',
  pin: '5678901234',
  father: 'মোহাম্মদ করিম উদ্দিন',
  mother: 'ফাতেমা বেগম',
  birthPlace: 'ঢাকা',
  dob: '1995-03-15',
  blood: 'O+',
  address: 'গ্রাম: টেকেরহাটি, উপজেলা: সাভার, জেলা: ঢাকা',
  gender: 'male',
  issueDate: '2024-01-15',
}

interface FileUpload {
  base64: string
  type: string
  name: string
}

export default function NidCardForm() {
  const { setCurrentView, setCurrentCard } = useAppStore()

  const [formData, setFormData] = useState({
    nameBn: '',
    nameEn: '',
    nid: '',
    pin: '',
    father: '',
    mother: '',
    birthPlace: '',
    dob: '',
    blood: '',
    address: '',
    gender: 'male',
    issueDate: new Date().toISOString().split('T')[0],
  })

  const [photo, setPhoto] = useState<FileUpload | null>(null)
  const [signature, setSignature] = useState<FileUpload | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState<'photo' | 'sign' | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const signInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const fileToBase64 = (file: File): Promise<FileUpload> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve({
          base64,
          type: file.type,
          name: file.name,
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = useCallback(
    async (file: File, type: 'photo' | 'sign') => {
      const maxSize = type === 'photo' ? 5 * 1024 * 1024 : 2 * 1024 * 1024
      const maxLabel = type === 'photo' ? '5MB' : '2MB'

      if (file.size > maxSize) {
        toast.error(`File size exceeds ${maxLabel}`)
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      const fileData = await fileToBase64(file)
      if (type === 'photo') {
        setPhoto(fileData)
      } else {
        setSignature(fileData)
      }
    },
    []
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, type: 'photo' | 'sign') => {
      e.preventDefault()
      setDragOver(null)
      const file = e.dataTransfer.files[0]
      if (file) handleFileUpload(file, type)
    },
    [handleFileUpload]
  )

  const handleAutoGenerate = () => {
    setFormData(DEMO_DATA)
    toast.success('Demo data filled automatically')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nameBn || !formData.nameEn || !formData.nid || !formData.pin) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photoBase64: photo?.base64 || null,
          photoType: photo?.type || null,
          signBase64: signature?.base64 || null,
          signType: signature?.type || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('NID card created successfully!')
        setCurrentCard(data.data)
        setCurrentView('card-view')
      } else {
        toast.error(data.message || 'Failed to create NID card')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-[#006a4e] text-white rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl text-center font-bold">
            জাতীয় পরিচয় পত্র আবেদন / National ID Card Application
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auto Generate Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoGenerate}
                className="gap-2 border-[#006a4e] text-[#006a4e] hover:bg-[#006a4e] hover:text-white"
              >
                <Sparkles className="h-4 w-4" />
                Auto Generate Demo
              </Button>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#006a4e] border-b-2 border-[#006a4e]/20 pb-2">
                ব্যক্তিগত তথ্য / Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameBn">নাম (বাংলা) / Name (Bengali) *</Label>
                  <Input
                    id="nameBn"
                    value={formData.nameBn}
                    onChange={(e) => handleInputChange('nameBn', e.target.value)}
                    placeholder="বাংলায় নাম লিখুন"
                    className="font-bengali"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn">Name (English) *</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    placeholder="Enter name in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father">পিতার নাম / Father&apos;s Name *</Label>
                  <Input
                    id="father"
                    value={formData.father}
                    onChange={(e) => handleInputChange('father', e.target.value)}
                    placeholder="পিতার নাম লিখুন"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother">মাতার নাম / Mother&apos;s Name *</Label>
                  <Input
                    id="mother"
                    value={formData.mother}
                    onChange={(e) => handleInputChange('mother', e.target.value)}
                    placeholder="মাতার নাম লিখুন"
                  />
                </div>
              </div>
            </div>

            {/* NID & Identity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#006a4e] border-b-2 border-[#006a4e]/20 pb-2">
                পরিচয় তথ্য / Identity Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nid">NID নম্বর / NID Number *</Label>
                  <Input
                    id="nid"
                    value={formData.nid}
                    onChange={(e) => handleInputChange('nid', e.target.value)}
                    placeholder="e.g. 19987654321001234"
                    maxLength={17}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN নম্বর / PIN Number *</Label>
                  <Input
                    id="pin"
                    value={formData.pin}
                    onChange={(e) => handleInputChange('pin', e.target.value)}
                    placeholder="e.g. 5678901234"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">জন্ম তারিখ / Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">লিঙ্গ / Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val) => handleInputChange('gender', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">পুরুষ / Male</SelectItem>
                      <SelectItem value="female">মহিলা / Female</SelectItem>
                      <SelectItem value="other">অন্যান্য / Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood">রক্তের গ্রুপ / Blood Group *</Label>
                  <Select
                    value={formData.blood}
                    onValueChange={(val) => handleInputChange('blood', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(
                        (bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">জন্মস্থান / Birth Place</Label>
                  <Input
                    id="birthPlace"
                    value={formData.birthPlace}
                    onChange={(e) =>
                      handleInputChange('birthPlace', e.target.value)
                    }
                    placeholder="e.g. ঢাকা"
                  />
                </div>
              </div>
            </div>

            {/* Address & Issue Date */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#006a4e] border-b-2 border-[#006a4e]/20 pb-2">
                ঠিকানা ও প্রদান / Address & Issue
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">ঠিকানা / Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">
                      প্রদানের তারিখ / Issue Date *
                    </Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) =>
                        handleInputChange('issueDate', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#006a4e] border-b-2 border-[#006a4e]/20 pb-2">
                ছবি ও স্বাক্ষর / Photo & Signature
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>ছবি / Photo (Max 5MB)</Label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'photo')
                    }}
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver('photo')
                    }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, 'photo')}
                    onClick={() => photoInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                      dragOver === 'photo'
                        ? 'border-[#006a4e] bg-[#006a4e]/5'
                        : 'border-gray-300 hover:border-[#006a4e]/50'
                    }`}
                  >
                    {photo ? (
                      <div className="relative">
                        <img
                          src={`data:${photo.type};base64,${photo.base64}`}
                          alt="Uploaded photo"
                          className="w-32 h-40 object-cover mx-auto rounded"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPhoto(null)
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <UserCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Drag & drop photo or click to browse
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Passport size photo recommended
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signature Upload */}
                <div className="space-y-2">
                  <Label>স্বাক্ষর / Signature (Max 2MB)</Label>
                  <input
                    ref={signInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'sign')
                    }}
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver('sign')
                    }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, 'sign')}
                    onClick={() => signInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                      dragOver === 'sign'
                        ? 'border-[#006a4e] bg-[#006a4e]/5'
                        : 'border-gray-300 hover:border-[#006a4e]/50'
                    }`}
                  >
                    {signature ? (
                      <div className="relative">
                        <img
                          src={`data:${signature.type};base64,${signature.base64}`}
                          alt="Uploaded signature"
                          className="w-48 h-16 object-contain mx-auto"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSignature(null)
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Drag & drop signature or click to browse
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          White background recommended
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#006a4e] hover:bg-[#004d38] text-white px-12 py-3 text-lg font-semibold gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    NID কার্ড তৈরি করুন / Create NID Card
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
