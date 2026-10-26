import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData } from '../types';

const KEY = 'shared_ledger_v1';

export const defaultAppData = (): AppData => ({
  ledger: null,
  subscription: { isPro: false },
  onboardingDone: false,
});

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultAppData();
    return { ...defaultAppData(), ...JSON.parse(raw) } as AppData;
  } catch {
    return defaultAppData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}
