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
  createdAt: string;
};

export type Ledger = {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
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
  /** demo unlock for MVP testing without StoreKit */
  demoUnlockedAt?: string;
};

export type AppData = {
  ledger: Ledger | null;
  subscription: SubscriptionState;
  onboardingDone: boolean;
};
