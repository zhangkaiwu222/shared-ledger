import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FREE_EXPORT_LIMIT, memberColors } from '../constants/theme';
import { createId } from '../lib/id';
import { equalShares } from '../lib/split';
import { defaultAppData, loadAppData, saveAppData } from '../lib/storage';
import type { AppData, Expense, Ledger, Member, SplitMode } from '../types';

type AddExpenseInput = {
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
  exportCount: number;
  canExport: boolean;
  createLedger: (name: string, memberNames: string[]) => void;
  addExpense: (input: AddExpenseInput) => void;
  removeExpense: (id: string) => void;
  unlockProDemo: () => void;
  markExportUsed: () => boolean;
  resetAll: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(defaultAppData());
  const [exportCount, setExportCount] = useState(0);

  useEffect(() => {
    (async () => {
      const loaded = await loadAppData();
      setData(loaded);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveAppData(data);
  }, [data, ready]);

  const isPro = data.subscription.isPro;
  const canExport = isPro || exportCount < FREE_EXPORT_LIMIT;

  const createLedger = useCallback((name: string, memberNames: string[]) => {
    const members: Member[] = memberNames
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n, i) => ({
        id: createId('m'),
        name: n,
        color: memberColors[i % memberColors.length],
      }));

    if (members.length < 2) return;

    const ledger: Ledger = {
      id: createId('ledger'),
      name: name.trim() || '我们的账本',
      members,
      expenses: [],
      createdAt: new Date().toISOString(),
    };

    setData({
      ledger,
      subscription: { isPro: false },
      onboardingDone: true,
    });
    setExportCount(0);
  }, []);

  const addExpense = useCallback((input: AddExpenseInput) => {
    setData((prev) => {
      if (!prev.ledger) return prev;
      const memberIds = prev.ledger.members.map((m) => m.id);
      const shares =
        input.splitMode === 'equal'
          ? equalShares(memberIds)
          : input.shares ?? equalShares(memberIds);

      const expense: Expense = {
        id: createId('exp'),
        amount: input.amount,
        category: input.category,
        note: input.note.trim(),
        paidBy: input.paidBy,
        splitMode: input.splitMode,
        shares,
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        ledger: {
          ...prev.ledger,
          expenses: [expense, ...prev.ledger.expenses],
        },
      };
    });
  }, []);

  const removeExpense = useCallback((id: string) => {
    setData((prev) => {
      if (!prev.ledger) return prev;
      return {
        ...prev,
        ledger: {
          ...prev.ledger,
          expenses: prev.ledger.expenses.filter((e) => e.id !== id),
        },
      };
    });
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
    setExportCount((c) => c + 1);
    return true;
  }, [exportCount, isPro]);

  const resetAll = useCallback(async () => {
    const fresh = defaultAppData();
    setData(fresh);
    setExportCount(0);
    await saveAppData(fresh);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      data,
      isPro,
      exportCount,
      canExport,
      createLedger,
      addExpense,
      removeExpense,
      unlockProDemo,
      markExportUsed,
      resetAll,
    }),
    [
      ready,
      data,
      isPro,
      exportCount,
      canExport,
      createLedger,
      addExpense,
      removeExpense,
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
