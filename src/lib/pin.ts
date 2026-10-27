import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PIN_KEY = 'shared_ledger_pin_v1';

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function hasPin(): Promise<boolean> {
  if (!(await canUseSecureStore())) return false;
  const value = await SecureStore.getItemAsync(PIN_KEY);
  return Boolean(value);
}

export async function setPin(pin: string): Promise<boolean> {
  if (!(await canUseSecureStore())) return false;
  if (!/^\d{4,6}$/.test(pin)) return false;
  await SecureStore.setItemAsync(PIN_KEY, pin);
  return true;
}

export async function clearPin(): Promise<void> {
  if (!(await canUseSecureStore())) return;
  await SecureStore.deleteItemAsync(PIN_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (!(await canUseSecureStore())) return true;
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  if (!stored) return true;
  return stored === pin;
}
