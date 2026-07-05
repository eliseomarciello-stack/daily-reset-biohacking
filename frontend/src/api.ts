// Frontend-only "API" — no network, no backend, no env vars required.
// Storage: AsyncStorage (native) / IndexedDB via the storage util (web).
// The exported `api` shape is unchanged so screens don't need refactor.

import { storage } from '@/src/utils/storage';
import { generateReset, ResetAnswers } from '@/src/reset-logic';

const RESETS_KEY = 'daily_reset.resets.v1';
const LEADS_KEY = 'daily_reset.email_leads.v1';

export type ResetInput = ResetAnswers;

export type Reset = ResetInput & {
  id: string;
  created_at: string;
  generated_pattern: string;
  generated_summary: string;
  generated_worked: string;
  generated_friction: string;
  generated_adjustment: string;
  generated_micro_action: string;
  generated_avoidance: string;
};

export type EmailLead = {
  id: string;
  email: string;
  created_at: string;
};

// ---------- helpers ----------
function uuid(): string {
  // RFC4122 v4 without deps — sufficient for local ids.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function readList<T>(key: string): Promise<T[]> {
  const raw = await storage.getItem<string>(key, '');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeList<T>(key: string, list: T[]): Promise<void> {
  await storage.setItem<string>(key, JSON.stringify(list));
}

// ---------- public api ----------
export const api = {
  async createReset(input: ResetInput): Promise<Reset> {
    const generated = generateReset(input);
    const reset: Reset = {
      id: uuid(),
      created_at: new Date().toISOString(),
      ...input,
      ...generated,
    };
    const list = await readList<Reset>(RESETS_KEY);
    list.unshift(reset);
    // Cap history to a sane size to avoid unbounded local storage growth.
    const capped = list.slice(0, 200);
    await writeList(RESETS_KEY, capped);
    return reset;
  },

  async listResets(): Promise<Reset[]> {
    const list = await readList<Reset>(RESETS_KEY);
    return list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },

  async getReset(id: string): Promise<Reset> {
    const list = await readList<Reset>(RESETS_KEY);
    const found = list.find((r) => r.id === id);
    if (!found) throw new Error('Reset non trovato');
    return found;
  },

  async submitEmailLead(email: string): Promise<EmailLead> {
    const normalized = email.trim().toLowerCase();
    const list = await readList<EmailLead>(LEADS_KEY);
    const existing = list.find((l) => l.email === normalized);
    if (existing) return existing;
    const lead: EmailLead = {
      id: uuid(),
      email: normalized,
      created_at: new Date().toISOString(),
    };
    list.unshift(lead);
    await writeList(LEADS_KEY, list.slice(0, 500));
    return lead;
  },
};
