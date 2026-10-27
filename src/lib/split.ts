import { monthKeyFromDate } from './date';
import type {
  Expense,
  Ledger,
  Member,
  MemberBalance,
  MemberId,
  Settlement,
} from '../types';

export function equalShares(memberIds: MemberId[]): Record<MemberId, number> {
  const n = memberIds.length || 1;
  const base = 1 / n;
  return Object.fromEntries(memberIds.map((id) => [id, base]));
}

export function expenseDateKey(e: Expense): string {
  return e.date || e.createdAt.slice(0, 10);
}

export function computeBalances(
  ledger: Ledger,
  expenses: Expense[] = ledger.expenses,
): MemberBalance[] {
  const paid: Record<MemberId, number> = {};
  const owed: Record<MemberId, number> = {};

  for (const m of ledger.members) {
    paid[m.id] = 0;
    owed[m.id] = 0;
  }

  for (const e of expenses) {
    if (e.excludeFromSettle) continue;
    paid[e.paidBy] = (paid[e.paidBy] ?? 0) + e.amount;
    for (const [memberId, ratio] of Object.entries(e.shares)) {
      owed[memberId] = (owed[memberId] ?? 0) + e.amount * ratio;
    }
  }

  return ledger.members.map((m) => {
    const p = paid[m.id] ?? 0;
    const o = owed[m.id] ?? 0;
    return {
      memberId: m.id,
      name: m.name,
      color: m.color,
      paid: round2(p),
      owed: round2(o),
      net: round2(p - o),
    };
  });
}

/** Minimize transfers: debtors pay creditors */
export function settleUp(balances: MemberBalance[]): Settlement[] {
  const debtors = balances
    .filter((b) => b.net < -0.009)
    .map((b) => ({ id: b.memberId, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .filter((b) => b.net > 0.009)
    .map((b) => ({ id: b.memberId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    if (pay >= 0.01) {
      settlements.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: round2(pay),
      });
    }
    debtors[i].amount = round2(debtors[i].amount - pay);
    creditors[j].amount = round2(creditors[j].amount - pay);
    if (debtors[i].amount < 0.01) i += 1;
    if (creditors[j].amount < 0.01) j += 1;
  }

  return settlements;
}

export function expensesInMonth(expenses: Expense[], key: string): Expense[] {
  return expenses.filter((e) => monthKeyFromDate(expenseDateKey(e)) === key);
}

export function categoryTotals(expenses: Expense[]): { category: string; total: number }[] {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    if (e.category === 'transfer') continue;
    map[e.category] = (map[e.category] ?? 0) + e.amount;
  }
  return Object.entries(map)
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total);
}

export function spendingTotal(expenses: Expense[]): number {
  return round2(
    expenses.filter((e) => e.category !== 'transfer').reduce((s, e) => s + e.amount, 0),
  );
}

export function memberName(
  members: Member[],
  id: MemberId,
  fallback = 'Unknown',
): string {
  return members.find((m) => m.id === id)?.name ?? fallback;
}

export function formatYuan(n: number): string {
  return `¥${n.toFixed(2)}`;
}

export function formatSharePercents(
  members: Member[],
  shares: Record<MemberId, number>,
): string {
  return members
    .map((m) => {
      const pct = round2((shares[m.id] ?? 0) * 100);
      const text = Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
      return `${m.name} ${text}%`;
    })
    .join(' / ');
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthlyTrend(
  expenses: Expense[],
  months: number,
): { key: string; total: number }[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys.map((key) => ({
    key,
    total: spendingTotal(expensesInMonth(expenses, key)),
  }));
}

export function expensesToCsv(
  expenses: Expense[],
  members: Member[],
): string {
  const header = ['date', 'amount', 'category', 'note', 'paidBy', 'split'];
  const rows = expenses.map((e) => [
    expenseDateKey(e),
    e.amount.toFixed(2),
    e.category,
    `"${(e.note || '').replace(/"/g, '""')}"`,
    memberName(members, e.paidBy),
    formatSharePercents(members, e.shares),
  ]);
  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
