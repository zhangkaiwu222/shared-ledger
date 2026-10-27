import { categories } from '../constants/theme';
import { categoryLabel } from '../i18n';
import type { CustomCategory } from '../types';

export function allCategories(custom: CustomCategory[]) {
  return [
    ...categories.map((c) => ({
      id: c.id,
      emoji: c.emoji,
      name: categoryLabel(c.id),
      builtin: true as const,
    })),
    ...custom.map((c) => ({
      id: c.id,
      emoji: c.emoji,
      name: c.name,
      builtin: false as const,
    })),
  ];
}

export function categoryDisplay(
  id: string,
  custom: CustomCategory[],
): { emoji: string; name: string } {
  const hit = allCategories(custom).find((c) => c.id === id);
  if (hit) return { emoji: hit.emoji, name: hit.name };
  return { emoji: '✨', name: categoryLabel(id) };
}
