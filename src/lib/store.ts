// In-memory NID card storage - works on Vercel serverless
export interface NidCardData {
  id: string;
  nameBn: string;
  nameEn: string;
  nid: string;
  pin: string;
  father: string;
  mother: string;
  birthPlace: string;
  dob: string;
  blood: string;
  address: string;
  gender: string;
  photoBase64: string | null;
  photoType: string | null;
  signBase64: string | null;
  signType: string | null;
  issueDate: string;
  createdAt: string;
}

// Global store that persists across serverless function invocations
const globalForStore = globalThis as unknown as {
  nidStore: Map<string, NidCardData> | undefined;
  adminPassword: string | undefined;
};

export const nidStore = globalForStore.nidStore ?? new Map<string, NidCardData>();

if (process.env.NODE_ENV !== 'production') globalForStore.nidStore = nidStore;

// Admin password - stored in memory
let _adminPassword = globalForStore.adminPassword ?? 'fahad';
if (process.env.NODE_ENV !== 'production') globalForStore.adminPassword = _adminPassword;

export function verifyAdmin(password: string): boolean {
  return password === _adminPassword;
}

export function resetAdminPassword(newPassword: string): void {
  _adminPassword = newPassword;
  globalForStore.adminPassword = newPassword;
}

export function getAllCards(): NidCardData[] {
  return Array.from(nidStore.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCardByNid(nid: string): NidCardData | undefined {
  return nidStore.get(nid);
}

export function getCardByPin(pin: string): NidCardData | undefined {
  return Array.from(nidStore.values()).find(c => c.pin === pin);
}

export function createCard(data: Omit<NidCardData, 'id' | 'createdAt'>): NidCardData | null {
  if (nidStore.has(data.nid)) return null; // Already exists
  const card: NidCardData = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  nidStore.set(data.nid, card);
  return card;
}

export function deleteCard(nid: string): boolean {
  return nidStore.delete(nid);
}

export function deleteAllCards(): number {
  const count = nidStore.size;
  nidStore.clear();
  return count;
}

export function searchCards(query: string): NidCardData[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllCards();
  return getAllCards().filter(d => {
    const searchStr = [d.nameBn, d.nameEn, d.nid, d.pin, d.father, d.mother, d.address, d.birthPlace].join(' ').toLowerCase();
    return searchStr.includes(q);
  });
}
