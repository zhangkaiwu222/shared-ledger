export type MemberId = string;

export type Member = {
  id: MemberId;
  name: string;
  color: string;
};

export type SplitMode = 'equal' | 'custom';

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string;
  paidBy: MemberId;
  splitMode: SplitMode;
  /** memberId -> share ratio, must sum to 1 when custom */
  shares: Record<MemberId, number>;
  /** calendar date YYYY-MM-DD */
  date: string;
  createdAt: string;
  updatedAt?: string;
  /** local image URI (Pro) */
  receiptUri?: string;
  /** personal expense — excluded from settle-up (Pro) */
  excludeFromSettle?: boolean;
};

export type RecurringFrequency = 'weekly' | 'monthly';

export type RecurringRule = {
  id: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  paidBy: MemberId;
  splitMode: SplitMode;
  shares: Record<MemberId, number>;
  frequency: RecurringFrequency;
  /** 1-28 for monthly; 0-6 for weekly (Sun-Sat) */
  day: number;
  enabled: boolean;
  nextDate: string;
};

export type CustomCategory = {
  id: string;
  name: string;
  emoji: string;
};

export type SettlementRecord = {
  id: string;
  from: MemberId;
  to: MemberId;
  amount: number;
  paidAt: string;
  note: string;
};

export type ExpenseTemplate = {
  id: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  paidBy: MemberId;
  splitMode: SplitMode;
  shares: Record<MemberId, number>;
  createdAt: string;
};

export type Ledger = {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  recurring: RecurringRule[];
  settlements: SettlementRecord[];
  /** overall monthly budget; 0 = off */
  monthlyBudget: number;
  /** category id -> budget */
  categoryBudgets: Record<string, number>;
  /** monthly savings target; 0 = off (Pro) */
  savingsGoal: number;
  createdAt: string;
};

export type Settlement = {
  from: MemberId;
  to: MemberId;
  amount: number;
};

export type MemberBalance = {
  memberId: MemberId;
  name: string;
  color: string;
  paid: number;
  owed: number;
  /** positive = others owe them; negative = they owe others */
  net: number;
};

export type SubscriptionState = {
  isPro: boolean;
  demoUnlockedAt?: string;
};

export type AppData = {
  /** @deprecated migrated to ledgers */
  ledger?: Ledger | null;
  ledgers: Ledger[];
  activeLedgerId: string | null;
  customCategories: CustomCategory[];
  templates: ExpenseTemplate[];
  /** PIN is stored in SecureStore; this flag only mirrors enabled state */
  pinEnabled: boolean;
  subscription: SubscriptionState;
  onboardingDone: boolean;
  exportCount: number;
};
