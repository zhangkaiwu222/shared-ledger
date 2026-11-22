import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Card } from '../src/components/ui';
import { LINKS } from '../src/constants/links';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useIap } from '../src/iap/IapProvider';
import { useI18n } from '../src/i18n/I18nContext';

export default function PaywallScreen() {
  const { isPro, unlockProDemo } = useApp();
  const { t } = useI18n();
  const {
    storeReady,
    connected,
    purchasing,
    monthly,
    yearly,
    subscribe,
    restore,
    retryLoadStore,
    lastError,
  } = useIap();

  const storeErrorText =
    lastError === 'store_connect_failed'
      ? t('paywall.storeConnectFailed')
      : lastError === 'store_no_products'
        ? t('paywall.storeNoProducts')
        : lastError === 'store_fetch_timeout'
          ? t('paywall.storeFetchTimeout')
          : lastError;
  const wasPro = useRef(isPro);

  useEffect(() => {
    if (!wasPro.current && isPro) {
      Alert.alert(t('paywall.alreadyTitle'), t('paywall.purchaseSuccess'));
      router.back();
    }
    wasPro.current = isPro;
  }, [isPro, t]);

  const open = (url: string) => {
    void Linking.openURL(url);
  };

  const onSubscribe = useCallback(
    async (plan: 'monthly' | 'yearly') => {
      if (Platform.OS !== 'ios') {
        Alert.alert(t('paywall.iapTitle'), t('paywall.storeUnavailable'));
        return;
      }
      if (!storeReady) {
        Alert.alert(t('paywall.iapTitle'), t('paywall.storeLoading'));
        return;
      }
      const result = await subscribe(plan);
      if (result.ok) return;
      if (result.reason === 'cancelled') return;
      Alert.alert(
        t('paywall.iapTitle'),
        lastError || t('paywall.purchaseFailed'),
      );
    },
    [storeReady, subscribe, lastError, isPro, t],
  );

  const onRestore = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(t('paywall.restoreTitle'), t('paywall.storeUnavailable'));
      return;
    }
    const result = await restore();
    if (result.ok && result.reason === 'none') {
      Alert.alert(t('paywall.restoreTitle'), t('paywall.restoreNone'));
      return;
    }
    if (result.ok) return;
    Alert.alert(t('paywall.restoreTitle'), lastError || t('paywall.purchaseFailed'));
  }, [restore, lastError, t]);

  if (isPro) {
    return (
      <View style={styles.wrap}>
        <Card>
          <Text style={styles.title}>{t('paywall.alreadyTitle')}</Text>
          <Text style={styles.desc}>{t('paywall.alreadyDesc')}</Text>
          <View style={{ height: 12 }} />
          <Button label={t('paywall.back')} onPress={() => router.back()} />
        </Card>
      </View>
    );
  }

  const features = [
    t('paywall.f1'),
    t('paywall.f2'),
    t('paywall.f3'),
    t('paywall.f4'),
    t('paywall.f5'),
    t('paywall.f6'),
    t('paywall.f7'),
    t('paywall.f8'),
    t('paywall.f9'),
    t('paywall.f10'),
    t('paywall.f11'),
    t('paywall.f12'),
  ];

  const monthlyPrice = monthly?.displayPrice ?? '¥15';
  const yearlyPrice = yearly?.displayPrice ?? '¥98';
  const iosStore = Platform.OS === 'ios';
  const canBuy = iosStore && connected && !purchasing;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.wrap}>
      <Text style={styles.brand}>{t('paywall.brand')}</Text>
      <Text style={styles.headline}>{t('paywall.headline')}</Text>
      <Text style={styles.desc}>{t('paywall.desc')}</Text>

      {iosStore && !connected && !storeErrorText ? (
        <View style={styles.storeRow}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.storeHint}>{t('paywall.storeLoading')}</Text>
        </View>
      ) : null}
      {iosStore && storeErrorText ? (
        <View style={styles.storeErrorBox}>
          <Text style={styles.storeErrorText}>{storeErrorText}</Text>
          <Button
            label={t('paywall.retryStore')}
            variant="secondary"
            onPress={() => void retryLoadStore()}
          />
        </View>
      ) : null}
      {iosStore && connected && !monthly && !yearly && !storeErrorText ? (
        <View style={styles.storeRow}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.storeHint}>{t('paywall.storeLoading')}</Text>
        </View>
      ) : null}

      <Card style={{ marginTop: 16, gap: 12 }}>
        {features.map((f) => (
          <Text key={f} style={styles.feature}>
            ✓  {f}
          </Text>
        ))}
      </Card>

      <View style={styles.prices}>
        <Card style={styles.priceCard}>
          <Text style={styles.priceLabel}>{t('paywall.monthly')}</Text>
          <Text style={styles.price}>{monthlyPrice}</Text>
          <Text style={styles.priceHint}>{t('paywall.perMonth')}</Text>
          <View style={{ height: 8 }} />
          <Button
            label={t('paywall.subscribeMonthly')}
            disabled={!canBuy}
            onPress={() => void onSubscribe('monthly')}
          />
        </Card>
        <Card style={[styles.priceCard, styles.priceBest]}>
          <Text style={styles.badge}>{t('paywall.best')}</Text>
          <Text style={styles.priceLabel}>{t('paywall.yearly')}</Text>
          <Text style={styles.price}>{yearlyPrice}</Text>
          <Text style={styles.priceHint}>{t('paywall.perYear')}</Text>
          <View style={{ height: 8 }} />
          <Button
            label={t('paywall.subscribeYearly')}
            disabled={!canBuy}
            onPress={() => void onSubscribe('yearly')}
          />
        </Card>
      </View>

      <Button
        label={t('paywall.restore')}
        variant="secondary"
        disabled={purchasing || (iosStore && !connected)}
        onPress={() => void onRestore()}
      />
      <Button label={t('paywall.continueFree')} variant="ghost" onPress={() => router.back()} />

      {__DEV__ ? (
        <Button
          label={t('paywall.demoUnlock')}
          variant="ghost"
          onPress={() => {
            unlockProDemo();
            Alert.alert(t('paywall.demoTitle'), t('paywall.demoBody'));
            router.back();
          }}
        />
      ) : null}

      <Text style={styles.legal}>{t('paywall.legal')}</Text>
      <Text style={styles.links}>
        <Text style={styles.link} onPress={() => open(LINKS.terms)}>
          {t('paywall.terms')}
        </Text>
        {'  ·  '}
        <Text style={styles.link} onPress={() => open(LINKS.privacy)}>
          {t('paywall.privacy')}
        </Text>
        {'  ·  '}
        <Text style={styles.link} onPress={() => open(LINKS.support)}>
          {t('paywall.support')}
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 10, paddingBottom: 40 },
  brand: { color: colors.brand, fontWeight: '800', letterSpacing: 1 },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  desc: { color: colors.muted, lineHeight: 22, fontSize: 15 },
  feature: { color: colors.ink, fontWeight: '600', fontSize: 15 },
  prices: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  priceCard: { flex: 1, alignItems: 'center', gap: 4 },
  priceBest: {
    borderColor: colors.brand,
    borderWidth: 2,
    backgroundColor: colors.brandSoft,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 10,
    fontWeight: '800',
    color: colors.brand,
  },
  priceLabel: { color: colors.muted, fontWeight: '700' },
  price: { fontSize: 28, fontWeight: '800', color: colors.ink },
  priceHint: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  storeHint: { color: colors.muted, fontSize: 14 },
  storeErrorBox: { marginTop: 8, gap: 8 },
  storeErrorText: { color: colors.danger, fontSize: 13, lineHeight: 20 },
  legal: {
    marginTop: 8,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    textAlign: 'center',
  },
  links: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 4 },
  link: { color: colors.brand, fontWeight: '700', textDecorationLine: 'underline' },
});
