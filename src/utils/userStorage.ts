import type { User, UserSession } from '../types';
import { hashPassword } from './storage';

const USERS_KEY = 'aec_users_v2';
const SESSION_KEY = 'aec_user_session_v2';
const SEED_KEY = 'aec_users_seed_v1';

const DEFAULT_USERS = [
  { name: 'Abdalla', pin: '1122', limit: 0 },
  { name: 'Alaraby', pin: '3344', limit: 0 },
  { name: 'Admin',   pin: '5566', limit: 0 },
];

export function seedDefaultUsers(force = false): void {
  if (!force && localStorage.getItem(SEED_KEY)) return;
  const existing = loadUsers();
  DEFAULT_USERS.forEach((u) => {
    const alreadyExists = existing.some((e) => e.name.toLowerCase() === u.name.toLowerCase());
    if (!alreadyExists) addUser(u.name, u.pin, u.limit);
  });
  localStorage.setItem(SEED_KEY, '1');
}

export function resetToDefaultUsers(): void {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(SEED_KEY);
  seedDefaultUsers(true);
}

// ---------- USER CRUD ----------

export function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addUser(name: string, pin: string, creditLimit: number): User {
  const users = loadUsers();
  const user: User = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    pinHash: hashPassword(pin.trim()),
    creditLimit,
    creditsUsed: 0,
    createdAt: new Date().toISOString(),
    lastUsed: '',
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function deleteUser(id: string): void {
  saveUsers(loadUsers().filter((u) => u.id !== id));
}

export function updateUserLimit(id: string, creditLimit: number): void {
  saveUsers(loadUsers().map((u) => (u.id === id ? { ...u, creditLimit } : u)));
}

export function resetUserCredits(id: string): void {
  saveUsers(loadUsers().map((u) => (u.id === id ? { ...u, creditsUsed: 0 } : u)));
}

// ---------- PIN VERIFICATION ----------

export function verifyPin(pin: string): User | null {
  const hash = hashPassword(pin.trim());
  return loadUsers().find((u) => u.pinHash === hash) || null;
}

// ---------- SESSION ----------

export function getCurrentSession(): UserSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function setCurrentSession(user: User): void {
  const session: UserSession = {
    userId: user.id,
    name: user.name,
    loginTime: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('userSessionChange'));
}

export function clearCurrentSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('userSessionChange'));
}

// ---------- CREDITS ----------

export function checkUserCredits(userId: string): { allowed: boolean; used: number; limit: number } {
  const user = loadUsers().find((u) => u.id === userId);
  if (!user) return { allowed: false, used: 0, limit: 0 };
  if (user.creditLimit === 0) return { allowed: true, used: user.creditsUsed, limit: 0 };
  return {
    allowed: user.creditsUsed < user.creditLimit,
    used: user.creditsUsed,
    limit: user.creditLimit,
  };
}

export function incrementUserCredits(userId: string): void {
  saveUsers(
    loadUsers().map((u) =>
      u.id === userId
        ? { ...u, creditsUsed: u.creditsUsed + 1, lastUsed: new Date().toISOString() }
        : u
    )
  );
}
