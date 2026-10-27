/** Free vs Pro — Pro must feel worth paying for real household use */

export const FREE_EXPORT_LIMIT = 3;
export const FREE_LEDGER_LIMIT = 1;
export const FREE_MEMBER_LIMIT = 4;
export const FREE_RECURRING_LIMIT = 0;
export const FREE_CUSTOM_CATEGORY_LIMIT = 0;
export const FREE_TEMPLATE_LIMIT = 0;
export const FREE_HISTORY_MONTHS = 1;

export const PRO_FEATURES = [
  'pro.f.multiLedger',
  'pro.f.budget',
  'pro.f.recurring',
  'pro.f.csv',
  'pro.f.advancedReport',
  'pro.f.customCategory',
  'pro.f.unlimitedCards',
  'pro.f.templates',
  'pro.f.insights',
  'pro.f.backup',
  'pro.f.pin',
  'pro.f.receipt',
  'pro.f.members',
  'pro.f.savings',
] as const;
