import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FREE_CUSTOM_CATEGORY_LIMIT,
  FREE_EXPORT_LIMIT,
  FREE_LEDGER_LIMIT,
  FREE_MEMBER_LIMIT,
  FREE_TEMPLATE_LIMIT,
} from '../constants/entitlements';
import { memberColors } from '../constants/theme';
import { toDateKey } from '../lib/date';
import { createId } from '../lib/id';
import { clearPin, hasPin, setPin, verifyPin } from '../lib/pin';
import { nextAfter } from '../lib/recurring';
import { equalShares } from '../lib/split';
import {
  defaultAppData,
  exportBackupJson,
  loadAppData,
  parseBackupJson,
  saveAppData,
} from '../lib/storage';
import type {
  AppData,
  CustomCategory,
  Expense,
  ExpenseTemplate,
  Ledger,
  Member,
  RecurringFrequency,
  RecurringRule,
  SplitMode,
} from '../types';

export type ExpenseInput = {
  amount: number;
  category: string;
  note: string;
  paidBy: string;
  splitMode: SplitMode;
  shares?: Record<string, number>;
  date?: string;
  receiptUri?: string;
  excludeFromSettle?: boolean;
};

export type RecurringInput = {
  title: string;
  amount: number;
  category: string;
  note: string;
  paidBy: string;
  splitMode: SplitMode;
  shares?: Record<string, number>;
  frequency: RecurringFrequency;
  day: number;
};

export type TemplateInput = {
  title: string;
  amount: number;
  category: string;
  note: string;
  paidBy: string;
  splitMode: SplitMode;
  shares?: Record<string, number>;
};

type AppContextValue = {
  ready: boolean;
  data: AppData;
  isPro: boolean;
  activeLedger: Ledger | null;
  exportCount: number;
  canExportCard: boolean;
  canCreateLedger: boolean;
  canAddMember: boolean;
  canUseBudget: boolean;
  canUseRecurring: boolean;
  canExportCsv: boolean;
  canAdvancedReport: boolean;
  canAddCustomCategory: boolean;
  canUseTemplates: boolean;
  canUseInsights: boolean;
  canBackup: boolean;
  canUsePin: boolean;
  canAttachReceipt: boolean;
  canUseSavings: boolean;
  locked: boolean;
  unlockWithPin: (pin: string) => Promise<boolean>;
  createLedger: (name: string, memberNames: string[]) => { ok: boolean; reason?: string };
  switchLedger: (id: string) => void;
  renameLedger: (id: string, name: string) => void;
  addExpense: (input: ExpenseInput) => void;
  updateExpense: (id: string, input: ExpenseInput) => void;
  removeExpense: (id: string) => void;
  duplicateExpense: (id: string) => { ok: boolean; reason?: string };
  markSettlementPaid: (from: string, to: string, amount: number) => void;
  setMonthlyBudget: (amount: number) => { ok: boolean; reason?: string };
  setCategoryBudget: (category: string, amount: number) => { ok: boolean; reason?: string };
  setSavingsGoal: (amount: number) => { ok: boolean; reason?: string };
  addRecurring: (input: RecurringInput) => { ok: boolean; reason?: string };
  toggleRecurring: (id: string, enabled: boolean) => void;
  removeRecurring: (id: string) => void;
  runDueRecurring: () => number;
  addCustomCategory: (name: string, emoji: string) => { ok: boolean; reason?: string };
  removeCustomCategory: (id: string) => void;
  addMember: (name: string) => { ok: boolean; reason?: string };
  addTemplate: (input: TemplateInput) => { ok: boolean; reason?: string };
  removeTemplate: (id: string) => void;
  applyTemplate: (id: string) => { ok: boolean; reason?: string };
  exportBackup: () => string | null;
  importBackup: (raw: string) => { ok: boolean; reason?: string };
  enablePin: (pin: string) => Promise<{ ok: boolean; reason?: string }>;
  disablePin: (pin: string) => Promise<{ ok: boolean; reason?: string }>;
  unlockProDemo: () => void;
  markExportUsed: () => boolean;
  resetAll: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function emptyLedger(name: string, members: Member[]): Ledger {
  return {
    id: createId('ledger'),
    name,
    members,
    expenses: [],
    recurring: [],
    settlements: [],
    monthlyBudget: 0,
    categoryBudgets: {},
    savingsGoal: 0,
    createdAt: new Date().toISOString(),
  };
}

function withActiveLedger(
  prev: AppData,
  updater: (ledger: Ledger) => Ledger,
): AppData {
  if (!prev.activeLedgerId) return prev;
  return {
    ...prev,
    ledgers: prev.ledgers.map((l) =>
      l.id === prev.activeLedgerId ? updater(l) : l,
    ),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(defaultAppData());
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    (async () => {
      const loaded = await loadAppData();
      setData(loaded);
      if (loaded.pinEnabled && loaded.subscription.isPro) {
        const exists = await hasPin();
        setLocked(exists);
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveAppData(data);
  }, [data, ready]);

  const isPro = data.subscription.isPro;
  const activeLedger =
    data.ledgers.find((l) => l.id === data.activeLedgerId) || data.ledgers[0] || null;
  const exportCount = data.exportCount;
  const canExportCard = isPro || exportCount < FREE_EXPORT_LIMIT;
  const canCreateLedger = isPro || data.ledgers.length < FREE_LEDGER_LIMIT;
  const canAddMember =
    isPro || !activeLedger || activeLedger.members.length < FREE_MEMBER_LIMIT;
  const canUseBudget = isPro;
  const canUseRecurring = isPro;
  const canExportCsv = isPro;
  const canAdvancedReport = isPro;
  const canAddCustomCategory =
    isPro || data.customCategories.length < FREE_CUSTOM_CATEGORY_LIMIT;
  const canUseTemplates = isPro || data.templates.length < FREE_TEMPLATE_LIMIT;
  const canUseInsights = isPro;
  const canBackup = isPro;
  const canUsePin = isPro;
  const canAttachReceipt = isPro;
  const canUseSavings = isPro;

  const unlockWithPin = useCallback(async (pin: string) => {
    const ok = await verifyPin(pin);
    if (ok) setLocked(false);
    return ok;
  }, []);

  const createLedger = useCallback(
    (name: string, memberNames: string[]) => {
      const members: Member[] = memberNames
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n, i) => ({
          id: createId('m'),
          name: n,
          color: memberColors[i % memberColors.length],
        }));
      if (members.length < 2) return { ok: false, reason: 'need_members' };

      let created: Ledger | null = null;
      let fail = false;
      setData((prev) => {
        const allow = prev.subscription.isPro || prev.ledgers.length < FREE_LEDGER_LIMIT;
        if (!allow) {
          fail = true;
          return prev;
        }
        created = emptyLedger(name.trim() || 'Ledger', members);
        return {
          ...prev,
          ledgers: [...prev.ledgers, created],
          activeLedgerId: created.id,
          onboardingDone: true,
        };
      });
      if (fail) return { ok: false, reason: 'pro_required' };
      return { ok: true };
    },
    [],
  );

  const switchLedger = useCallback((id: string) => {
    setData((prev) =>
      prev.ledgers.some((l) => l.id === id)
        ? { ...prev, activeLedgerId: id }
        : prev,
    );
  }, []);

  const renameLedger = useCallback((id: string, name: string) => {
    setData((prev) => ({
      ...prev,
      ledgers: prev.ledgers.map((l) =>
        l.id === id ? { ...l, name: name.trim() || l.name } : l,
      ),
    }));
  }, []);

  const buildExpense = useCallback(
    (input: ExpenseInput, memberIds: string[], existing?: Expense): Expense => {
      const shares =
        input.splitMode === 'equal'
          ? equalShares(memberIds)
          : input.shares ?? equalShares(memberIds);
      const now = new Date().toISOString();
      return {
        id: existing?.id || createId('exp'),
        amount: input.amount,
        category: input.category,
        note: input.note.trim(),
        paidBy: input.paidBy,
        splitMode: input.splitMode,
        shares,
        date: input.date || existing?.date || toDateKey(),
        createdAt: existing?.createdAt || now,
        updatedAt: existing ? now : undefined,
        receiptUri:
          input.receiptUri !== undefined ? input.receiptUri : existing?.receiptUri,
        excludeFromSettle: Boolean(
          input.excludeFromSettle !== undefined
            ? input.excludeFromSettle
            : existing?.excludeFromSettle,
        ),
      };
    },
    [],
  );

  const addExpense = useCallback(
    (input: ExpenseInput) => {
      setData((prev) =>
        withActiveLedger(prev, (ledger) => {
          const expense = buildExpense(
            input,
            ledger.members.map((m) => m.id),
          );
          return { ...ledger, expenses: [expense, ...ledger.expenses] };
        }),
      );
    },
    [buildExpense],
  );

  const updateExpense = useCallback(
    (id: string, input: ExpenseInput) => {
      setData((prev) =>
        withActiveLedger(prev, (ledger) => {
          const existing = ledger.expenses.find((e) => e.id === id);
          if (!existing) return ledger;
          const expense = buildExpense(
            input,
            ledger.members.map((m) => m.id),
            existing,
          );
          return {
            ...ledger,
            expenses: ledger.expenses.map((e) => (e.id === id ? expense : e)),
          };
        }),
      );
    },
    [buildExpense],
  );

  const removeExpense = useCallback((id: string) => {
    setData((prev) =>
      withActiveLedger(prev, (ledger) => ({
        ...ledger,
        expenses: ledger.expenses.filter((e) => e.id !== id),
      })),
    );
  }, []);

  const duplicateExpense = useCallback(
    (id: string) => {
      let fail = false;
      setData((prev) => {
        if (!prev.subscription.isPro) {
          fail = true;
          return prev;
        }
        return withActiveLedger(prev, (ledger) => {
          const existing = ledger.expenses.find((e) => e.id === id);
          if (!existing) return ledger;
          const copy: Expense = {
            ...existing,
            id: createId('exp'),
            date: toDateKey(),
            createdAt: new Date().toISOString(),
            updatedAt: undefined,
          };
          return { ...ledger, expenses: [copy, ...ledger.expenses] };
        });
      });
      return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
    },
    [],
  );

  const markSettlementPaid = useCallback((from: string, to: string, amount: number) => {
    setData((prev) =>
      withActiveLedger(prev, (ledger) => {
        const now = new Date().toISOString();
        const transfer: Expense = {
          id: createId('exp'),
          amount,
          category: 'transfer',
          note: 'Settlement',
          paidBy: from,
          splitMode: 'custom',
          shares: { [to]: 1 },
          date: toDateKey(),
          createdAt: now,
        };
        const record = {
          id: createId('set'),
          from,
          to,
          amount,
          paidAt: now,
          note: '',
        };
        return {
          ...ledger,
          expenses: [transfer, ...ledger.expenses],
          settlements: [record, ...ledger.settlements],
        };
      }),
    );
  }, []);

  const setMonthlyBudget = useCallback((amount: number) => {
    let fail = false;
    setData((prev) => {
      if (!prev.subscription.isPro) {
        fail = true;
        return prev;
      }
      return withActiveLedger(prev, (ledger) => ({
        ...ledger,
        monthlyBudget: Math.max(0, amount),
      }));
    });
    return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
  }, []);

  const setCategoryBudget = useCallback((category: string, amount: number) => {
    let fail = false;
    setData((prev) => {
      if (!prev.subscription.isPro) {
        fail = true;
        return prev;
      }
      return withActiveLedger(prev, (ledger) => ({
        ...ledger,
        categoryBudgets: {
          ...ledger.categoryBudgets,
          [category]: Math.max(0, amount),
        },
      }));
    });
    return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
  }, []);

  const setSavingsGoal = useCallback((amount: number) => {
    let fail = false;
    setData((prev) => {
      if (!prev.subscription.isPro) {
        fail = true;
        return prev;
      }
      return withActiveLedger(prev, (ledger) => ({
        ...ledger,
        savingsGoal: Math.max(0, amount),
      }));
    });
    return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
  }, []);

  const addRecurring = useCallback((input: RecurringInput) => {
    let fail = false;
    setData((prev) => {
      if (!prev.subscription.isPro) {
        fail = true;
        return prev;
      }
      return withActiveLedger(prev, (ledger) => {
        const memberIds = ledger.members.map((m) => m.id);
        const shares =
          input.splitMode === 'equal'
            ? equalShares(memberIds)
            : input.shares ?? equalShares(memberIds);
        const rule: RecurringRule = {
          id: createId('rec'),
          title: input.title.trim() || 'Recurring',
          amount: input.amount,
          category: input.category,
          note: input.note.trim(),
          paidBy: input.paidBy,
          splitMode: input.splitMode,
          shares,
          frequency: input.frequency,
          day: input.day,
          enabled: true,
          nextDate: toDateKey(),
        };
        rule.nextDate = nextAfter({ ...rule, nextDate: toDateKey() }, toDateKey());
        const today = toDateKey();
        if (input.frequency === 'monthly') {
          const d = Number(today.slice(8, 10));
          if (d === Math.min(Math.max(input.day, 1), 28)) rule.nextDate = today;
        }
        return { ...ledger, recurring: [rule, ...ledger.recurring] };
      });
    });
    return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
  }, []);

  const toggleRecurring = useCallback((id: string, enabled: boolean) => {
    setData((prev) =>
      withActiveLedger(prev, (ledger) => ({
        ...ledger,
        recurring: ledger.recurring.map((r) =>
          r.id === id ? { ...r, enabled } : r,
        ),
      })),
    );
  }, []);

  const removeRecurring = useCallback((id: string) => {
    setData((prev) =>
      withActiveLedger(prev, (ledger) => ({
        ...ledger,
        recurring: ledger.recurring.filter((r) => r.id !== id),
      })),
    );
  }, []);

  const runDueRecurring = useCallback(() => {
    let created = 0;
    const today = toDateKey();
    setData((prev) => {
      if (!prev.subscription.isPro) return prev;
      return withActiveLedger(prev, (ledger) => {
        const newExpenses: Expense[] = [];
        const recurring = ledger.recurring.map((rule) => {
          if (!rule.enabled) return rule;
          let nextDate = rule.nextDate;
          let guard = 0;
          while (nextDate <= today && guard < 6) {
            newExpenses.push({
              id: createId('exp'),
              amount: rule.amount,
              category: rule.category,
              note: rule.note || rule.title,
              paidBy: rule.paidBy,
              splitMode: rule.splitMode,
              shares: rule.shares,
              date: nextDate,
              createdAt: new Date().toISOString(),
            });
            created += 1;
            nextDate = nextAfter({ ...rule, nextDate }, nextDate);
            guard += 1;
          }
          return { ...rule, nextDate };
        });
        if (!newExpenses.length) return ledger;
        return {
          ...ledger,
          recurring,
          expenses: [...newExpenses, ...ledger.expenses],
        };
      });
    });
    return created;
  }, []);

  const addCustomCategory = useCallback((name: string, emoji: string) => {
    let fail = false;
    setData((prev) => {
      if (!prev.subscription.isPro) {
        fail = true;
        return prev;
      }
      const cat: CustomCategory = {
        id: createId('cat'),
        name: name.trim() || 'Custom',
        emoji: emoji || '📌',
      };
      return { ...prev, customCategories: [...prev.customCategories, cat] };
    });
    return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
  }, []);

  const removeCustomCategory = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      customCategories: prev.customCategories.filter((c) => c.id !== id),
    }));
  }, []);

  const addMember = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, reason: 'empty' };
    let fail = false;
    setData((prev) => {
      const ledger = prev.ledgers.find((l) => l.id === prev.activeLedgerId);
      if (!ledger) {
        fail = true;
        return prev;
      }
      const allow =
        prev.subscription.isPro || ledger.members.length < FREE_MEMBER_LIMIT;
      if (!allow) {
        fail = true;
        return prev;
      }
      return withActiveLedger(prev, (l) => ({
        ...l,
        members: [
          ...l.members,
          {
            id: createId('m'),
            name: trimmed,
            color: memberColors[l.members.length % memberColors.length],
          },
        ],
      }));
    });
    return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
  }, []);

  const addTemplate = useCallback((input: TemplateInput) => {
    let fail = false;
    setData((prev) => {
      if (!prev.subscription.isPro) {
        fail = true;
        return prev;
      }
      const memberIds =
        prev.ledgers.find((l) => l.id === prev.activeLedgerId)?.members.map((m) => m.id) ||
        [];
      const shares =
        input.splitMode === 'equal'
          ? equalShares(memberIds)
          : input.shares ?? equalShares(memberIds);
      const tpl: ExpenseTemplate = {
        id: createId('tpl'),
        title: input.title.trim() || 'Template',
        amount: input.amount,
        category: input.category,
        note: input.note.trim(),
        paidBy: input.paidBy,
        splitMode: input.splitMode,
        shares,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, templates: [tpl, ...prev.templates] };
    });
    return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
  }, []);

  const removeTemplate = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      templates: prev.templates.filter((t) => t.id !== id),
    }));
  }, []);

  const applyTemplate = useCallback(
    (id: string) => {
      let fail = false;
      setData((prev) => {
        if (!prev.subscription.isPro) {
          fail = true;
          return prev;
        }
        const tpl = prev.templates.find((t) => t.id === id);
        if (!tpl) {
          fail = true;
          return prev;
        }
        return withActiveLedger(prev, (ledger) => {
          const expense: Expense = {
            id: createId('exp'),
            amount: tpl.amount,
            category: tpl.category,
            note: tpl.note || tpl.title,
            paidBy: tpl.paidBy,
            splitMode: tpl.splitMode,
            shares: tpl.shares,
            date: toDateKey(),
            createdAt: new Date().toISOString(),
          };
          return { ...ledger, expenses: [expense, ...ledger.expenses] };
        });
      });
      return fail ? { ok: false, reason: 'pro_required' } : { ok: true };
    },
    [],
  );

  const exportBackup = useCallback(() => {
    if (!isPro) return null;
    return exportBackupJson(data);
  }, [data, isPro]);

  const importBackup = useCallback((raw: string) => {
    if (!isPro) return { ok: false, reason: 'pro_required' };
    const parsed = parseBackupJson(raw);
    if (!parsed) return { ok: false, reason: 'invalid' };
    setData(parsed);
    return { ok: true };
  }, [isPro]);

  const enablePin = useCallback(async (pin: string) => {
    if (!isPro) return { ok: false, reason: 'pro_required' };
    const ok = await setPin(pin);
    if (!ok) return { ok: false, reason: 'invalid_pin' };
    setData((prev) => ({ ...prev, pinEnabled: true }));
    return { ok: true };
  }, [isPro]);

  const disablePin = useCallback(async (pin: string) => {
    const ok = await verifyPin(pin);
    if (!ok) return { ok: false, reason: 'wrong_pin' };
    await clearPin();
    setData((prev) => ({ ...prev, pinEnabled: false }));
    setLocked(false);
    return { ok: true };
  }, []);

  const unlockProDemo = useCallback(() => {
    setData((prev) => ({
      ...prev,
      subscription: {
        isPro: true,
        demoUnlockedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const markExportUsed = useCallback(() => {
    if (isPro) return true;
    if (exportCount >= FREE_EXPORT_LIMIT) return false;
    setData((prev) => ({ ...prev, exportCount: prev.exportCount + 1 }));
    return true;
  }, [exportCount, isPro]);

  const resetAll = useCallback(async () => {
    await clearPin();
    const fresh = defaultAppData();
    setData(fresh);
    setLocked(false);
    await saveAppData(fresh);
  }, []);

  useEffect(() => {
    if (!ready || !isPro || !activeLedger) return;
    runDueRecurring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isPro, activeLedger?.id]);

  const value = useMemo(
    () => ({
      ready,
      data,
      isPro,
      activeLedger,
      exportCount,
      canExportCard,
      canCreateLedger,
      canAddMember,
      canUseBudget,
      canUseRecurring,
      canExportCsv,
      canAdvancedReport,
      canAddCustomCategory,
      canUseTemplates,
      canUseInsights,
      canBackup,
      canUsePin,
      canAttachReceipt,
      canUseSavings,
      locked,
      unlockWithPin,
      createLedger,
      switchLedger,
      renameLedger,
      addExpense,
      updateExpense,
      removeExpense,
      duplicateExpense,
      markSettlementPaid,
      setMonthlyBudget,
      setCategoryBudget,
      setSavingsGoal,
      addRecurring,
      toggleRecurring,
      removeRecurring,
      runDueRecurring,
      addCustomCategory,
      removeCustomCategory,
      addMember,
      addTemplate,
      removeTemplate,
      applyTemplate,
      exportBackup,
      importBackup,
      enablePin,
      disablePin,
      unlockProDemo,
      markExportUsed,
      resetAll,
    }),
    [
      ready,
      data,
      isPro,
      activeLedger,
      exportCount,
      canExportCard,
      canCreateLedger,
      canAddMember,
      canUseBudget,
      canUseRecurring,
      canExportCsv,
      canAdvancedReport,
      canAddCustomCategory,
      canUseTemplates,
      canUseInsights,
      canBackup,
      canUsePin,
      canAttachReceipt,
      canUseSavings,
      locked,
      unlockWithPin,
      createLedger,
      switchLedger,
      renameLedger,
      addExpense,
      updateExpense,
      removeExpense,
      duplicateExpense,
      markSettlementPaid,
      setMonthlyBudget,
      setCategoryBudget,
      setSavingsGoal,
      addRecurring,
      toggleRecurring,
      removeRecurring,
      runDueRecurring,
      addCustomCategory,
      removeCustomCategory,
      addMember,
      addTemplate,
      removeTemplate,
      applyTemplate,
      exportBackup,
      importBackup,
      enablePin,
      disablePin,
      unlockProDemo,
      markExportUsed,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
