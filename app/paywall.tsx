import { router } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../src/components/ui';
import { IAP_PRODUCT_IDS, LINKS } from '../src/constants/links';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';

export default function PaywallScreen() {
  const { isPro, unlockProDemo } = useApp();
  const { t } = useI18n();

  const open = (url: string) => {
    void Linking.openURL(url);
  };

  const subscribePlaceholder = (plan: 'monthly' | 'yearly') => {
    Alert.alert(
      t('paywall.iapTitle'),
      t('paywall.iapBody', {
        id: plan === 'monthly' ? IAP_PRODUCT_IDS.monthly : IAP_PRODUCT_IDS.yearly,
      }),
    );
  };

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.wrap}>
      <Text style={styles.brand}>{t('paywall.brand')}</Text>
      <Text style={styles.headline}>{t('paywall.headline')}</Text>
      <Text style={styles.desc}>{t('paywall.desc')}</Text>

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
          <Text style={styles.price}>¥15</Text>
          <Text style={styles.priceHint}>{t('paywall.perMonth')}</Text>
          <View style={{ height: 8 }} />
          <Button
            label={t('paywall.subscribeMonthly')}
            onPress={() => subscribePlaceholder('monthly')}
          />
        </Card>
        <Card style={[styles.priceCard, styles.priceBest]}>
          <Text style={styles.badge}>{t('paywall.best')}</Text>
          <Text style={styles.priceLabel}>{t('paywall.yearly')}</Text>
          <Text style={styles.price}>¥98</Text>
          <Text style={styles.priceHint}>{t('paywall.perYear')}</Text>
          <View style={{ height: 8 }} />
          <Button
            label={t('paywall.subscribeYearly')}
            onPress={() => subscribePlaceholder('yearly')}
          />
        </Card>
      </View>

      <Button
        label={t('paywall.restore')}
        variant="secondary"
        onPress={() => Alert.alert(t('paywall.restoreTitle'), t('paywall.restoreBody'))}
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
