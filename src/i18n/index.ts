import { getLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';
import en from './locales/en';
import jaPartial from './locales/ja';
import koPartial from './locales/ko';
import zhHans from './locales/zh-Hans';
import zhHantPartial from './locales/zh-Hant';
import { deepMerge } from './merge';

export const APP_LOCALES = [
  { id: 'system', nativeLabel: 'System / 跟随系统' },
  { id: 'zh-Hans', nativeLabel: '简体中文' },
  { id: 'zh-Hant', nativeLabel: '繁體中文' },
  { id: 'en', nativeLabel: 'English' },
  { id: 'ja', nativeLabel: '日本語' },
  { id: 'ko', nativeLabel: '한국어' },
] as const;

export type AppLocaleId = (typeof APP_LOCALES)[number]['id'];
export type ResolvedLocale = 'zh-Hans' | 'zh-Hant' | 'en' | 'ja' | 'ko';

const ja = deepMerge(en, jaPartial as never);
const ko = deepMerge(en, koPartial as never);
const zhHant = deepMerge(en, zhHantPartial as never);

export const i18n = new I18n({
  en,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ja,
  ko,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function resolveLocale(preference: AppLocaleId | string | undefined): ResolvedLocale {
  if (preference && preference !== 'system') {
    if (
      preference === 'zh-Hans' ||
      preference === 'zh-Hant' ||
      preference === 'en' ||
      preference === 'ja' ||
      preference === 'ko'
    ) {
      return preference;
    }
  }

  const tag = (getLocales()[0]?.languageTag ?? 'zh-CN').toLowerCase();
  const code = (getLocales()[0]?.languageCode ?? 'zh').toLowerCase();
  const script = (getLocales()[0]?.languageScriptCode ?? '').toLowerCase();

  if (code === 'ja') return 'ja';
  if (code === 'ko') return 'ko';
  if (code === 'en') return 'en';
  if (code === 'zh') {
    if (
      script === 'hant' ||
      tag.includes('hant') ||
      tag.includes('tw') ||
      tag.includes('hk') ||
      tag.includes('mo')
    ) {
      return 'zh-Hant';
    }
    return 'zh-Hans';
  }
  return 'zh-Hans';
}

export function setI18nLocale(locale: ResolvedLocale) {
  i18n.locale = locale;
}

export function t(key: string, options?: TranslateOptions): string {
  return i18n.t(key, options);
}

export function categoryLabel(id: string): string {
  return t(`category.${id}`, { defaultValue: id });
}

export function formatMonthLabel(date = new Date()): string {
  return t('month.format', {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
  });
}
