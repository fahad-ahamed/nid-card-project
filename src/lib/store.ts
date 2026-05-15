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

// ===== AUTO-DELETE TIMER =====
export interface TimerData {
  deleteAt: number;  // Unix timestamp in milliseconds
  label: string;
  createdAt: number;
  type: 'hours' | 'days' | 'date';
  value: string;
}

const globalForTimer = globalThis as unknown as {
  nidTimer: TimerData | undefined;
};

let _timer: TimerData | null = globalForTimer.nidTimer ?? null;

export function setTimer(type: 'hours' | 'days' | 'date', value: string): { success: boolean; message: string } {
  let deleteAt = 0;
  let label = '';

  if (type === 'hours') {
    const hours = parseInt(value);
    if (isNaN(hours) || hours < 1) return { success: false, message: 'সঠিক ঘন্টা দিন' };
    deleteAt = Date.now() + (hours * 3600 * 1000);
    label = hours + ' ঘন্টা পরে';
  } else if (type === 'days') {
    const days = parseInt(value);
    if (isNaN(days) || days < 1) return { success: false, message: 'সঠিক দিন দিন' };
    deleteAt = Date.now() + (days * 86400 * 1000);
    label = days + ' দিন পরে';
  } else if (type === 'date') {
    deleteAt = new Date(value).getTime();
    if (isNaN(deleteAt) || deleteAt <= Date.now()) {
      return { success: false, message: 'সঠিক ভবিষ্যৎ তারিখ দিন' };
    }
    label = new Date(value).toLocaleString('bn-BD') + ' তারিখে';
  }

  _timer = { deleteAt, label, createdAt: Date.now(), type, value };
  globalForTimer.nidTimer = _timer;
  return { success: true, message: 'টাইমার সেট হয়েছে: ' + label + ' সব ডাটা ডিলিট হবে' };
}

export function cancelTimer(): boolean {
  if (_timer) {
    _timer = null;
    globalForTimer.nidTimer = undefined;
    return true;
  }
  return false;
}

export function getTimerStatus(): { active: boolean; timer?: TimerData & { remaining: number; remainingLabel: string }; expired?: boolean } {
  // Check if timer has expired - if so, delete all data
  if (_timer && _timer.deleteAt <= Date.now()) {
    nidStore.clear();
    _timer = null;
    globalForTimer.nidTimer = undefined;
    return { active: false, expired: true };
  }

  if (!_timer) return { active: false };

  const remaining = _timer.deleteAt - Date.now();
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(days + ' দিন');
  if (hours > 0) parts.push(hours + ' ঘন্টা');
  if (mins > 0) parts.push(mins + ' মিনিট');
  if (days === 0 && hours === 0) parts.push(secs + ' সেকেন্ড');

  return {
    active: true,
    timer: {
      ..._timer,
      remaining,
      remainingLabel: parts.join(' '),
    }
  };
}
