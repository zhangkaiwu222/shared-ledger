import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { PinLock } from '../src/components/PinLock';
import { colors } from '../src/constants/theme';
import { AppProvider, useApp } from '../src/context/AppContext';
import { I18nProvider, useI18n } from '../src/i18n/I18nContext';

function RootNavigator() {
  const { ready, t } = useI18n();
  const { ready: appReady } = useApp();

  if (!ready || !appReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.brand,
          headerTitleStyle: { color: colors.ink, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: t('stack.add'), presentation: 'modal' }} />
        <Stack.Screen name="edit/[id]" options={{ title: t('stack.edit'), presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ title: t('stack.paywall'), presentation: 'modal' }} />
        <Stack.Screen name="ledgers" options={{ title: t('stack.ledgers') }} />
        <Stack.Screen name="recurring" options={{ title: t('stack.recurring') }} />
        <Stack.Screen name="budget" options={{ title: t('stack.budget') }} />
        <Stack.Screen name="insights" options={{ title: t('stack.insights') }} />
        <Stack.Screen name="templates" options={{ title: t('stack.templates') }} />
        <Stack.Screen name="security" options={{ title: t('stack.security') }} />
      </Stack>
      <PinLock />
    </>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </I18nProvider>
  );
}
