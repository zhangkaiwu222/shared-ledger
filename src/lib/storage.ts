import AsyncStorage from '@react-native-async-storage/async-storage';
import { toDateKey } from './date';
import type { AppData, Expense, ExpenseTemplate, Ledger } from '../types';

const KEY = 'shared_ledger_v2';
const LEGACY_KEY = 'shared_ledger_v1';

function normalizeExpense(raw: Partial<Expense> & { id: string }): Expense {
  const createdAt = raw.createdAt || new Date().toISOString();
  return {
    id: raw.id,
    amount: Number(raw.amount) || 0,
    category: raw.category || 'other',
    note: raw.note || '',
    paidBy: raw.paidBy || '',
    splitMode: raw.splitMode === 'custom' ? 'custom' : 'equal',
    shares: raw.shares || {},
    date: raw.date || createdAt.slice(0, 10) || toDateKey(),
    createdAt,
    updatedAt: raw.updatedAt,
    receiptUri: raw.receiptUri,
    excludeFromSettle: Boolean(raw.excludeFromSettle),
  };
}

function normalizeTemplate(raw: Partial<ExpenseTemplate> & { id: string }): ExpenseTemplate {
  return {
    id: raw.id,
    title: raw.title || 'Template',
    amount: Number(raw.amount) || 0,
    category: raw.category || 'other',
    note: raw.note || '',
    paidBy: raw.paidBy || '',
    splitMode: raw.splitMode === 'custom' ? 'custom' : 'equal',
    shares: raw.shares || {},
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function normalizeLedger(raw: Partial<Ledger> & { id: string; name: string }): Ledger {
  return {
    id: raw.id,
    name: raw.name,
    members: raw.members || [],
    expenses: (raw.expenses || []).map((e) => normalizeExpense(e)),
    recurring: raw.recurring || [],
    settlements: raw.settlements || [],
    monthlyBudget: raw.monthlyBudget || 0,
    categoryBudgets: raw.categoryBudgets || {},
    savingsGoal: Number(raw.savingsGoal) || 0,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const defaultAppData = (): AppData => ({
  ledgers: [],
  activeLedgerId: null,
  customCategories: [],
  templates: [],
  pinEnabled: false,
  subscription: { isPro: false },
  onboardingDone: false,
  exportCount: 0,
});

function migrate(parsed: Record<string, unknown>): AppData {
  const base = defaultAppData();
  const subscription = {
    ...base.subscription,
    ...((parsed.subscription as object) || {}),
  };

  let ledgers: Ledger[] = [];
  if (Array.isArray(parsed.ledgers) && parsed.ledgers.length) {
    ledgers = (parsed.ledgers as Ledger[]).map((l) => normalizeLedger(l));
  } else if (parsed.ledger && typeof parsed.ledger === 'object') {
    ledgers = [normalizeLedger(parsed.ledger as Ledger)];
  }

  return {
    ledgers,
    activeLedgerId:
      (parsed.activeLedgerId as string) ||
      ledgers[0]?.id ||
      null,
    customCategories: Array.isArray(parsed.customCategories)
      ? (parsed.customCategories as AppData['customCategories'])
      : [],
    templates: Array.isArray(parsed.templates)
      ? (parsed.templates as ExpenseTemplate[]).map((t) => normalizeTemplate(t))
      : [],
    pinEnabled: Boolean(parsed.pinEnabled),
    subscription,
    onboardingDone: Boolean(parsed.onboardingDone) || ledgers.length > 0,
    exportCount: Number(parsed.exportCount) || 0,
  };
}

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = (await AsyncStorage.getItem(KEY)) || (await AsyncStorage.getItem(LEGACY_KEY));
    if (!raw) return defaultAppData();
    const data = migrate(JSON.parse(raw));
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch {
    return defaultAppData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export function exportBackupJson(data: AppData): string {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2,
  );
}

export function parseBackupJson(raw: string): AppData | null {
  try {
    const parsed = JSON.parse(raw) as { data?: Record<string, unknown> } & Record<string, unknown>;
    const payload = (parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed) as Record<
      string,
      unknown
    >;
    if (!Array.isArray(payload.ledgers) && !payload.ledger) return null;
    return migrate(payload);
  } catch {
    return null;
  }
}
