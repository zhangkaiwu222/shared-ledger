import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';
import {
  annualSummary,
  digestText,
  forecastNext30Days,
  memberSpendBreakdown,
  monthOverMonth,
  savingsProgress,
} from '../src/lib/insights';
import {
  currentMonthKey,
  expensesInMonth,
  formatYuan,
} from '../src/lib/split';

export default function InsightsScreen() {
  const { activeLedger, canUseInsights, canUseSavings } = useApp();
  const { t } = useI18n();
  const ledger = activeLedger;

  if (!canUseInsights) {
    return (
      <View style={styles.lock}>
        <Card>
          <Text style={styles.section}>{t('insights.title')}</Text>
          <Text style={styles.empty}>{t('insights.proBody')}</Text>
          <View style={{ height: 12 }} />
          <Button label={t('common.unlockPro')} onPress={() => router.push('/paywall')} />
        </Card>
      </View>
    );
  }

  if (!ledger) return null;

  const key = currentMonthKey();
  const monthExpenses = expensesInMonth(ledger.expenses, key);
  const members = memberSpendBreakdown(ledger, monthExpenses);
  const mom = monthOverMonth(ledger.expenses, key);
  const forecast = forecastNext30Days(ledger.recurring);
  const annual = annualSummary(ledger.expenses);
  const savings = savingsProgress(ledger.expenses, ledger.savingsGoal, key);
  const maxShare = Math.max(...members.map((m) => m.share), 1);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.kicker}>{key}</Text>
        <Text style={styles.section}>{t('insights.momTitle')}</Text>
        <Text style={styles.big}>{formatYuan(mom.current)}</Text>
        <Text style={styles.meta}>
          {t('insights.momPrev', { amount: formatYuan(mom.previous) })}
          {' · '}
          {mom.pct === null
            ? t('insights.momNoPrev')
            : mom.delta >= 0
              ? t('insights.momUp', { pct: mom.pct })
              : t('insights.momDown', { pct: Math.abs(mom.pct) })}
        </Text>
      </Card>

      <Card>
        <Text style={styles.section}>{t('insights.memberTitle')}</Text>
        <View style={{ marginTop: 12, gap: 10 }}>
          {members.map((m) => (
            <View key={m.memberId} style={{ gap: 4 }}>
              <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: m.color }]} />
                <Text style={styles.name}>{m.name}</Text>
                <Text style={styles.amount}>{formatYuan(m.share)}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(m.share / maxShare) * 100}%` }]} />
              </View>
              <Text style={styles.sub}>
                {t('insights.paidShare', {
                  paid: formatYuan(m.paid),
                  share: formatYuan(m.share),
                })}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>{t('insights.forecastTitle')}</Text>
        <Text style={styles.big}>{formatYuan(forecast)}</Text>
        <Text style={styles.meta}>{t('insights.forecastDesc')}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>{t('insights.annualTitle', { year: annual.year })}</Text>
        <Text style={styles.big}>{formatYuan(annual.total)}</Text>
        <Text style={styles.meta}>{t('insights.annualCount', { count: annual.count })}</Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {annual.byMonth
            .filter((m) => m.total > 0)
            .map((m) => (
              <View key={m.key} style={styles.row}>
                <Text style={styles.name}>{m.key}</Text>
                <Text style={styles.amount}>{formatYuan(m.total)}</Text>
              </View>
            ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>{t('insights.savingsTitle')}</Text>
        {savings ? (
          <>
            <Text style={styles.meta}>
              {t('insights.savingsUsed', {
                spent: formatYuan(savings.spent),
                goal: formatYuan(savings.goal),
              })}
            </Text>
            <View style={[styles.barTrack, { marginTop: 10 }]}>
              <View style={[styles.barFill, { width: `${savings.ratio * 100}%` }]} />
            </View>
            <Text style={styles.meta}>
              {t('insights.savingsLeft', { amount: formatYuan(savings.remaining) })}
            </Text>
          </>
        ) : (
          <Text style={styles.empty}>{t('insights.savingsEmpty')}</Text>
        )}
        <View style={{ height: 12 }} />
        <Button
          label={canUseSavings ? t('insights.setSavings') : t('common.unlockPro')}
          variant="secondary"
          onPress={() => {
            if (!canUseSavings) {
              router.push('/paywall');
              return;
            }
            router.push('/budget');
          }}
        />
      </Card>

      <Button
        label={t('insights.copyDigest')}
        variant="secondary"
        onPress={async () => {
          await Clipboard.setStringAsync(digestText(ledger, ledger.members, key));
          Alert.alert(t('insights.digestDone'), t('insights.digestDoneBody'));
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lock: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  kicker: { color: colors.muted, fontWeight: '700' },
  section: { fontSize: 17, fontWeight: '800', color: colors.ink },
  big: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  meta: { marginTop: 6, color: colors.muted, lineHeight: 20 },
  empty: { marginTop: 8, color: colors.muted, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, fontWeight: '700', color: colors.ink },
  amount: { fontWeight: '800', color: colors.ink },
  sub: { color: colors.muted, fontSize: 12 },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 999, backgroundColor: colors.brand },
});
