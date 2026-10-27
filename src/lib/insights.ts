import type { Expense, Ledger, Member, RecurringRule } from '../types';
import {
  currentMonthKey,
  expenseDateKey,
  expensesInMonth,
  formatYuan,
  round2,
  spendingTotal,
} from './split';

export type MemberSpend = {
  memberId: string;
  name: string;
  color: string;
  paid: number;
  share: number;
};

export function memberSpendBreakdown(
  ledger: Ledger,
  expenses: Expense[],
): MemberSpend[] {
  const paid: Record<string, number> = {};
  const share: Record<string, number> = {};
  for (const m of ledger.members) {
    paid[m.id] = 0;
    share[m.id] = 0;
  }
  for (const e of expenses) {
    if (e.category === 'transfer') continue;
    paid[e.paidBy] = (paid[e.paidBy] ?? 0) + e.amount;
    for (const [mid, ratio] of Object.entries(e.shares)) {
      share[mid] = (share[mid] ?? 0) + e.amount * ratio;
    }
  }
  return ledger.members
    .map((m) => ({
      memberId: m.id,
      name: m.name,
      color: m.color,
      paid: round2(paid[m.id] ?? 0),
      share: round2(share[m.id] ?? 0),
    }))
    .sort((a, b) => b.share - a.share);
}

/** Estimate next 30 days from enabled monthly/weekly recurring rules */
export function forecastNext30Days(recurring: RecurringRule[]): number {
  let total = 0;
  for (const rule of recurring) {
    if (!rule.enabled) continue;
    if (rule.frequency === 'monthly') {
      total += rule.amount;
    } else {
      total += rule.amount * 4;
    }
  }
  return round2(total);
}

export function previousMonthKey(key = currentMonthKey()): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function yearKey(date = new Date()): string {
  return String(date.getFullYear());
}

export function expensesInYear(expenses: Expense[], year: string): Expense[] {
  return expenses.filter((e) => expenseDateKey(e).startsWith(`${year}-`));
}

export function monthOverMonth(
  expenses: Expense[],
  key = currentMonthKey(),
): { current: number; previous: number; delta: number; pct: number | null } {
  const current = spendingTotal(expensesInMonth(expenses, key));
  const previous = spendingTotal(expensesInMonth(expenses, previousMonthKey(key)));
  const delta = round2(current - previous);
  const pct = previous > 0 ? round2((delta / previous) * 100) : null;
  return { current, previous, delta, pct };
}

export function annualSummary(expenses: Expense[], year = yearKey()) {
  const list = expensesInYear(expenses, year).filter((e) => e.category !== 'transfer');
  const total = spendingTotal(list);
  const byMonth: { key: string; total: number }[] = [];
  for (let m = 1; m <= 12; m += 1) {
    const key = `${year}-${String(m).padStart(2, '0')}`;
    byMonth.push({ key, total: spendingTotal(expensesInMonth(expenses, key)) });
  }
  return { year, total, count: list.length, byMonth };
}

export function savingsProgress(
  expenses: Expense[],
  goal: number,
  key = currentMonthKey(),
): { spent: number; goal: number; remaining: number; ratio: number } | null {
  if (goal <= 0) return null;
  const spent = spendingTotal(expensesInMonth(expenses, key));
  const remaining = round2(Math.max(0, goal - spent));
  return {
    spent,
    goal,
    remaining,
    ratio: Math.min(1, spent / goal),
  };
}

export function digestText(
  ledger: Ledger,
  members: Member[],
  key = currentMonthKey(),
): string {
  const monthExpenses = expensesInMonth(ledger.expenses, key);
  const total = spendingTotal(monthExpenses);
  const membersLine = memberSpendBreakdown(ledger, monthExpenses)
    .map((m) => `${m.name}: 承担 ${formatYuan(m.share)} / 实付 ${formatYuan(m.paid)}`)
    .join('\n');
  return [
    `【${ledger.name}】${key} 月度摘要`,
    `合计支出：${formatYuan(total)}（${monthExpenses.filter((e) => e.category !== 'transfer').length} 笔）`,
    membersLine,
    `—— 由「一起算」生成`,
  ].join('\n');
}
