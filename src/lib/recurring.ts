import { addDays, addMonths, toDateKey } from './date';
import type { RecurringRule } from '../types';

export function nextAfter(rule: RecurringRule, fromDate = toDateKey()): string {
  if (rule.frequency === 'weekly') {
    let d = fromDate;
    for (let i = 0; i < 14; i += 1) {
      d = addDays(d, 1);
      const js = new Date(d + 'T12:00:00').getDay();
      if (js === rule.day) return d;
    }
    return addDays(fromDate, 7);
  }
  // monthly: clamp day 1-28
  const day = Math.min(Math.max(rule.day || 1, 1), 28);
  let cursor = fromDate;
  for (let i = 0; i < 3; i += 1) {
    const [y, m] = cursor.split('-').map(Number);
    const candidate = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (candidate > fromDate) return candidate;
    cursor = addMonths(`${y}-${String(m).padStart(2, '0')}-01`, 1);
  }
  return addMonths(fromDate, 1);
}
