'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/lib/store'
import NidCardForm from '@/components/nid-card-form'
import NidCardView from '@/components/nid-card-view'
import NidCardAdmin from '@/components/nid-card-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Home, Shield, X } from 'lucide-react'
import { toast } from 'sonner'
import type { NidCardData } from '@/lib/store'

export default function HomePage() {
  const { currentView, setCurrentView, setCurrentCard, searchQuery, setSearchQuery } = useAppStore()
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<NidCardData | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      // Try NID first
      let res = await fetch(`/api/nid?nid=${encodeURIComponent(searchQuery.trim())}`)
      let data = await res.json()

      if (!data.success) {
        // Try PIN
        res = await fetch(`/api/nid?pin=${encodeURIComponent(searchQuery.trim())}`)
        data = await res.json()
      }

      if (data.success) {
        setSearchResult(data.data)
        toast.success('কার্ড পাওয়া গেছে / Card found!')
      } else {
        setSearchResult(null)
        toast.error('কার্ড পাওয়া যায়নি / Card not found')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSearching(false)
    }
  }

  const handleViewSearchedCard = () => {
    if (searchResult) {
      setCurrentCard(searchResult)
      setCurrentView('card-view')
      setShowSearch(false)
      setSearchResult(null)
      setSearchQuery('')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f2f5' }}>
      {/* Government Banner */}
      <div
        className="text-white py-3 px-4"
        style={{ backgroundColor: '#006a4e' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
          {/* Bangladesh Flag */}
          <svg width="36" height="24" viewBox="0 0 36 24" className="flex-shrink-0">
            <rect width="36" height="24" fill="#006a4e" />
            <circle cx="15" cy="12" r="7" fill="#f4a300" />
          </svg>
          <div className="text-center">
            <div className="text-sm sm:text-base font-bold leading-tight">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </div>
            <div className="text-[10px] sm:text-xs leading-tight opacity-90">
              Government of the People&apos;s Republic of Bangladesh
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div
        className="border-b shadow-sm"
        style={{ backgroundColor: '#004d38' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Emblem */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
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
              <div className="text-white">
                <div className="text-sm sm:text-lg font-bold leading-tight">
                  জাতীয় পরিচয় পত্র
                </div>
                <div className="text-[10px] sm:text-xs opacity-80">
                  National Identity Card
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentView('home')
                  setSearchResult(null)
                  setShowSearch(false)
                }}
                className={`text-white hover:bg-white/10 gap-1 ${currentView === 'home' ? 'bg-white/20' : ''}`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">হোম</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentView('admin')
                  setSearchResult(null)
                  setShowSearch(false)
                }}
                className={`text-white hover:bg-white/10 gap-1 ${currentView === 'admin' ? 'bg-white/20' : ''}`}
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className={`text-white hover:bg-white/10 gap-1 ${showSearch ? 'bg-white/20' : ''}`}
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">খুঁজুন</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar (toggleable) */}
      {showSearch && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="NID নম্বর বা PIN দিয়ে খুঁজুন / Search by NID or PIN"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                disabled={searching}
                className="bg-[#006a4e] hover:bg-[#004d38] text-white gap-1"
              >
                {searching ? (
                  <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                খুঁজুন
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSearch(false)
                  setSearchResult(null)
                  setSearchQuery('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>

            {/* Search Result */}
            {searchResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-15 border border-gray-200 rounded overflow-hidden bg-gray-50">
                      {searchResult.photoBase64 ? (
                        <img
                          src={`data:${searchResult.photoType || 'image/jpeg'};base64,${searchResult.photoBase64}`}
                          alt={searchResult.nameEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          N/A
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#006a4e]">
                        {searchResult.nameBn}
                      </p>
                      <p className="text-sm text-gray-600">
                        {searchResult.nameEn}
                      </p>
                      <p className="text-xs text-gray-400">
                        NID: {searchResult.nid} | PIN: {searchResult.pin}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleViewSearchedCard}
                    className="bg-[#006a4e] hover:bg-[#004d38] text-white"
                    size="sm"
                  >
                    দেখুন / View Card
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 py-6">
        {currentView === 'home' && <NidCardForm />}
        {currentView === 'card-view' && <NidCardView />}
        {currentView === 'admin' && <NidCardAdmin />}
      </main>

      {/* Footer */}
      <footer
        className="text-white py-4 px-4 mt-auto"
        style={{ backgroundColor: '#006a4e' }}
      >
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p className="font-semibold">
            বাংলাদেশ নির্বাচন কমিশন / Bangladesh Election Commission
          </p>
          <p className="text-xs opacity-80 mt-1">
            জাতীয় পরিচয় নিবন্ধন অধিদপ্তর / National Identity Registration Wing
          </p>
          <p className="text-xs opacity-60 mt-1">
            © {new Date().getFullYear()} গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
          </p>
        </div>
      </footer>
    </div>
  )
}
