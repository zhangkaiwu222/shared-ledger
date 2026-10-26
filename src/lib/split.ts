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

export function computeBalances(ledger: Ledger): MemberBalance[] {
  const paid: Record<MemberId, number> = {};
  const owed: Record<MemberId, number> = {};

  for (const m of ledger.members) {
    paid[m.id] = 0;
    owed[m.id] = 0;
  }

  for (const e of ledger.expenses) {
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

export function monthKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function expensesInMonth(expenses: Expense[], key: string): Expense[] {
  return expenses.filter((e) => monthKey(e.createdAt) === key);
}

export function categoryTotals(expenses: Expense[]): { category: string; total: number }[] {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    map[e.category] = (map[e.category] ?? 0) + e.amount;
  }
  return Object.entries(map)
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total);
}

export function memberName(members: Member[], id: MemberId): string {
  return members.find((m) => m.id === id)?.name ?? '未知';
}

export function formatYuan(n: number): string {
  return `¥${n.toFixed(2)}`;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function currentMonthLabel(): string {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
