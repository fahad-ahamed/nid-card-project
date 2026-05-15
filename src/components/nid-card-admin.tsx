'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import type { NidCardData } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Lock,
  Users,
  CalendarCheck,
  Trash2,
  Search,
  Eye,
  Loader2,
  LogOut,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'

export default function NidCardAdmin() {
  const {
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    setCurrentView,
    setCurrentCard,
  } = useAppStore()

  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [cards, setCards] = useState<NidCardData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchAllCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/nid?all=true')
      const data = await res.json()
      if (data.success) {
        setCards(data.data)
      }
    } catch {
      toast.error('Failed to fetch cards')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAllCards()
    }
  }, [isAdminLoggedIn, fetchAllCards])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        setIsAdminLoggedIn(true)
        toast.success('Login successful!')
      } else {
        toast.error(data.message || 'Invalid password')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleDeleteCard = async (nid: string) => {
    setDeleting(nid)
    try {
      const res = await fetch(`/api/nid?nid=${nid}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCards((prev) => prev.filter((c) => c.nid !== nid))
        toast.success('Card deleted successfully')
      } else {
        toast.error(data.message || 'Failed to delete')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteAll = async () => {
    try {
      const res = await fetch('/api/nid?all=true', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCards([])
        toast.success('All cards deleted successfully')
      } else {
        toast.error('Failed to delete all cards')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleViewCard = (card: NidCardData) => {
    setCurrentCard(card)
    setCurrentView('card-view')
  }

  const filteredCards = cards.filter(
    (card) =>
      card.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.nameBn.includes(searchTerm) ||
      card.nid.includes(searchTerm) ||
      card.pin.includes(searchTerm)
  )

  const todayCount = cards.filter((card) => {
    const created = new Date(card.createdAt).toDateString()
    const today = new Date().toDateString()
    return created === today
  }).length

  // Login screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardHeader className="bg-[#006a4e] text-white rounded-t-lg text-center">
            <Shield className="h-12 w-12 mx-auto mb-2" />
            <CardTitle className="text-xl">অ্যাডমিন লগইন / Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">পাসওয়ার্ড / Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-[#006a4e] hover:bg-[#004d38] text-white gap-2"
              >
                {loggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                লগইন / Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#006a4e]">
          অ্যাডমিন প্যানেল / Admin Panel
        </h2>
        <Button
          variant="outline"
          onClick={() => setIsAdminLoggedIn(false)}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          লগআউট / Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-[#006a4e]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[#006a4e]/10 rounded-lg">
              <Users className="h-6 w-6 text-[#006a4e]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">মোট NID কার্ড / Total Cards</p>
              <p className="text-2xl font-bold text-[#006a4e]">{cards.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#f4a300]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[#f4a300]/10 rounded-lg">
              <CalendarCheck className="h-6 w-6 text-[#f4a300]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">আজকের কার্ড / Today&apos;s Cards</p>
              <p className="text-2xl font-bold text-[#f4a300]">{todayCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="নাম, NID বা PIN দিয়ে খুঁজুন / Search by name, NID or PIN"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchAllCards}
            className="gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            রিফ্রেশ / Refresh
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                সব মুছুন / Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>সতর্কতা! / Warning!</AlertDialogTitle>
                <AlertDialogDescription>
                  আপনি কি সব NID কার্ড মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায়
                  ফেরানো যাবে না। Are you sure you want to delete all NID cards?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>না / No</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  হ্যাঁ, মুছুন / Yes, Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#006a4e]" />
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">কোনো NID কার্ড নেই / No NID cards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              className="border hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Mini photo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-20 border border-gray-200 rounded overflow-hidden bg-gray-50">
                      {card.photoBase64 ? (
                        <img
                          src={`data:${card.photoType || 'image/jpeg'};base64,${card.photoBase64}`}
                          alt={card.nameEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Users className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Card info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{card.nameBn}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {card.nameEn}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      NID: <span className="font-mono">{card.nid}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      PIN: <span className="font-mono">{card.pin}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {card.blood} | {card.gender}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-xs border-[#006a4e] text-[#006a4e] hover:bg-[#006a4e] hover:text-white"
                    onClick={() => handleViewCard(card)}
                  >
                    <Eye className="h-3 w-3" />
                    দেখুন / View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-xs border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleDeleteCard(card.nid)}
                    disabled={deleting === card.nid}
                  >
                    {deleting === card.nid ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    মুছুন / Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
