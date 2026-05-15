import { create } from 'zustand'

export type ViewType = 'home' | 'card-view' | 'admin' | 'search'

export interface NidCardData {
  id: string
  nameBn: string
  nameEn: string
  nid: string
  pin: string
  father: string
  mother: string
  birthPlace: string
  dob: string
  blood: string
  address: string
  gender: string
  photoBase64?: string | null
  photoType?: string | null
  signBase64?: string | null
  signType?: string | null
  issueDate: string
  createdAt: string
  updatedAt: string
}

interface AppState {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void

  currentCard: NidCardData | null
  setCurrentCard: (card: NidCardData | null) => void

  searchQuery: string
  setSearchQuery: (query: string) => void

  searchResults: NidCardData[]
  setSearchResults: (results: NidCardData[]) => void

  isAdminLoggedIn: boolean
  setIsAdminLoggedIn: (val: boolean) => void

  allCards: NidCardData[]
  setAllCards: (cards: NidCardData[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),

  currentCard: null,
  setCurrentCard: (card) => set({ currentCard: card }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),

  isAdminLoggedIn: false,
  setIsAdminLoggedIn: (val) => set({ isAdminLoggedIn: val }),

  allCards: [],
  setAllCards: (cards) => set({ allCards: cards }),
}))
