import { PayRecord, UserProfile, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from './calculator';

const STORAGE_KEY = 'payslip_tracker_v2';

export interface UserData {
  profile: UserProfile;
  settings: UserSettings;
  records: PayRecord[];
  updatedAt: string;
}

export interface AppDatabase {
  currentUserId: string | null;
  theme: 'dark' | 'light';
  users: Record<string, UserData>;
}

function getInitialDb(): AppDatabase {
  return {
    currentUserId: 'guest',
    theme: 'dark',
    users: {
      guest: {
        profile: {
          id: 'guest',
          name: 'ผู้ใช้ทั่วไป (Guest)',
          provider: 'guest',
        },
        settings: { ...DEFAULT_SETTINGS },
        records: [],
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate legacy data if exists
      const legacyRaw = localStorage.getItem('pst_v1');
      if (legacyRaw) {
        try {
          const leg = JSON.parse(legacyRaw);
          const db = getInitialDb();
          if (leg.users) {
            Object.keys(leg.users).forEach((k) => {
              const u = leg.users[k];
              db.users[k] = {
                profile: {
                  id: k,
                  name: k.startsWith('google:') ? 'ผู้ใช้ Google' : k,
                  provider: k.startsWith('google:') ? 'google' : 'local',
                },
                settings: { ...DEFAULT_SETTINGS, ...(u.set || {}) },
                records: u.recs || [],
                updatedAt: u.updatedAt || new Date().toISOString(),
              };
            });
            const lastCu = sessionStorage.getItem('pst_cu');
            if (lastCu && db.users[lastCu]) {
              db.currentUserId = lastCu;
            }
          }
          saveDatabase(db);
          return db;
        } catch {
          // ignore migration error
        }
      }
      const initial = getInitialDb();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.users || !parsed.users.guest) {
      const init = getInitialDb();
      return { ...init, ...parsed };
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load storage database', e);
    return getInitialDb();
  }
}

export function saveDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('pst_db_changed', { detail: db }));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function getCurrentUser(db: AppDatabase): UserData {
  const uid = db.currentUserId || 'guest';
  if (!db.users[uid]) {
    db.users[uid] = {
      profile: {
        id: uid,
        name: uid,
        provider: 'local',
      },
      settings: { ...DEFAULT_SETTINGS },
      records: [],
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(db);
  }
  return db.users[uid];
}

export function updateUserRecords(records: PayRecord[]): void {
  const db = loadDatabase();
  const uid = db.currentUserId || 'guest';
  if (db.users[uid]) {
    db.users[uid].records = records;
    db.users[uid].updatedAt = new Date().toISOString();
    saveDatabase(db);
  }
}

export function updateUserSettings(settings: UserSettings): void {
  const db = loadDatabase();
  const uid = db.currentUserId || 'guest';
  if (db.users[uid]) {
    db.users[uid].settings = settings;
    db.users[uid].updatedAt = new Date().toISOString();
    saveDatabase(db);
  }
}

export function setCurrentUser(profile: UserProfile): void {
  const db = loadDatabase();
  db.currentUserId = profile.id;
  if (!db.users[profile.id]) {
    // Copy settings from current or default
    const existing = db.users.guest?.settings || DEFAULT_SETTINGS;
    db.users[profile.id] = {
      profile,
      settings: { ...existing },
      records: [],
      updatedAt: new Date().toISOString(),
    };
  } else {
    db.users[profile.id].profile = profile;
  }
  saveDatabase(db);
}

export function savePayRecord(record: PayRecord): void {
  const db = loadDatabase();
  const uid = db.currentUserId || 'guest';
  const u = db.users[uid];
  if (!u) return;

  const filtered = (u.records || []).filter((r) => r.key !== record.key && r.id !== record.id);
  filtered.push(record);
  // Sort descending by payDate
  filtered.sort((a, b) => (a.period.payDate < b.period.payDate ? 1 : -1));

  u.records = filtered;
  u.updatedAt = new Date().toISOString();
  saveDatabase(db);
}

export function deletePayRecord(recordIdOrKey: string): void {
  const db = loadDatabase();
  const uid = db.currentUserId || 'guest';
  const u = db.users[uid];
  if (!u) return;

  u.records = (u.records || []).filter((r) => r.id !== recordIdOrKey && r.key !== recordIdOrKey);
  u.updatedAt = new Date().toISOString();
  saveDatabase(db);
}

export function generateSyncCode(): string {
  const db = loadDatabase();
  const user = getCurrentUser(db);
  const payload = {
    ver: 2,
    profile: user.profile,
    settings: user.settings,
    records: user.records,
    exportedAt: new Date().toISOString(),
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function importSyncCode(code: string): { success: boolean; count: number; error?: string } {
  try {
    const raw = decodeURIComponent(atob(code.trim()));
    const data = JSON.parse(raw);
    if (!data.records || !Array.isArray(data.records)) {
      return { success: false, count: 0, error: 'ข้อมูลไม่ถูกต้อง' };
    }

    const db = loadDatabase();
    const uid = db.currentUserId || 'guest';
    const u = db.users[uid];
    if (u) {
      if (data.settings) {
        u.settings = { ...DEFAULT_SETTINGS, ...data.settings };
      }
      u.records = data.records;
      u.updatedAt = new Date().toISOString();
      saveDatabase(db);
      return { success: true, count: data.records.length };
    }
    return { success: false, count: 0, error: 'ไม่พบบัญชีผู้ใช้' };
  } catch (err) {
    return { success: false, count: 0, error: 'รหัสซิงค์เสียหายหรือไม่ถูกต้อง' };
  }
}
