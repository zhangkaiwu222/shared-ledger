import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { TranslateOptions } from 'i18n-js';
import {
  APP_LOCALES,
  type AppLocaleId,
  type ResolvedLocale,
  resolveLocale,
  setI18nLocale,
  t as translate,
} from './index';

const STORAGE_KEY = 'shared_ledger_locale_v1';

type I18nContextValue = {
  ready: boolean;
  preference: AppLocaleId;
  locale: ResolvedLocale;
  locales: typeof APP_LOCALES;
  setPreference: (id: AppLocaleId) => void;
  t: (key: string, options?: TranslateOptions) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [preference, setPreferenceState] = useState<AppLocaleId>('system');
  const [locale, setLocale] = useState<ResolvedLocale>('zh-Hans');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const pref = (saved as AppLocaleId) || 'system';
        const resolved = resolveLocale(pref);
        setPreferenceState(pref === 'system' || APP_LOCALES.some((l) => l.id === pref) ? pref : 'system');
        setLocale(resolved);
        setI18nLocale(resolved);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setPreference = useCallback((id: AppLocaleId) => {
    const resolved = resolveLocale(id);
    setPreferenceState(id);
    setLocale(resolved);
    setI18nLocale(resolved);
    void AsyncStorage.setItem(STORAGE_KEY, id);
  }, []);

  const t = useCallback(
    (key: string, options?: TranslateOptions) => {
      // locale in deps so components re-render with new strings
      void locale;
      return translate(key, options);
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      ready,
      preference,
      locale,
      locales: APP_LOCALES,
      setPreference,
      t,
    }),
    [ready, preference, locale, setPreference, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
