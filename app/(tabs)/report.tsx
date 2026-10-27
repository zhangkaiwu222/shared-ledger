import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../src/components/ui';
import { colors } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { formatMonthLabel } from '../../src/i18n';
import { useI18n } from '../../src/i18n/I18nContext';
import { categoryDisplay } from '../../src/lib/categories';
import {
  annualSummary,
  monthOverMonth,
} from '../../src/lib/insights';
import {
  categoryTotals,
  computeBalances,
  currentMonthKey,
  expensesInMonth,
  expensesToCsv,
  formatYuan,
  monthlyTrend,
  spendingTotal,
} from '../../src/lib/split';

export default function ReportScreen() {
  const { activeLedger, data, canAdvancedReport, canExportCsv, canUseInsights } = useApp();
  const { t } = useI18n();
  const ledger = activeLedger;
  if (!ledger) return null;

  const key = currentMonthKey();
  const monthExpenses = expensesInMonth(ledger.expenses, key);
  const totals = categoryTotals(monthExpenses);
  const sum = spendingTotal(monthExpenses);
  const balances = computeBalances(ledger, monthExpenses);
  const max = Math.max(...totals.map((item) => item.total), 1);
  const month = formatMonthLabel();
  const trend = monthlyTrend(ledger.expenses, 6);
  const trendMax = Math.max(...trend.map((x) => x.total), 1);
  const mom = monthOverMonth(ledger.expenses, key);
  const annual = annualSummary(ledger.expenses);

  const exportCsv = async () => {
    if (!canExportCsv) {
      Alert.alert(t('common.proOnly'), t('report.exportNeedPro'));
      router.push('/paywall');
      return;
    }
    const csv = expensesToCsv(ledger.expenses, ledger.members);
    await Clipboard.setStringAsync(csv);
    Alert.alert(t('report.exportDone'), t('report.exportDoneBody'));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.kicker}>{month}</Text>
          <Text style={styles.big}>{formatYuan(sum)}</Text>
          <Text style={styles.meta}>{t('report.count', { count: monthExpenses.length })}</Text>
        </Card>

        <Card>
          <Text style={styles.section}>{t('report.byCategory')}</Text>
          {totals.length === 0 ? (
            <Text style={styles.empty}>{t('report.emptyMonth')}</Text>
          ) : (
            <View style={{ marginTop: 12, gap: 12 }}>
              {totals.map((item) => {
                const cat = categoryDisplay(item.category, data.customCategories);
                return (
                  <View key={item.category} style={{ gap: 6 }}>
                    <View style={styles.catRow}>
                      <Text style={styles.catLabel}>
                        {cat.emoji} {cat.name}
                      </Text>
                      <Text style={styles.catAmount}>{formatYuan(item.total)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[styles.barFill, { width: `${(item.total / max) * 100}%` }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.section}>{t('report.memberNet')}</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            {balances.map((b) => (
              <View key={b.memberId} style={styles.memberRow}>
                <View style={[styles.dot, { backgroundColor: b.color }]} />
                <Text style={styles.memberName}>{b.name}</Text>
                <Text style={{ flex: 1 }} />
                <Text
                  style={{
                    fontWeight: '800',
                    color: b.net >= 0 ? colors.brand : colors.accent,
                  }}
                >
                  {b.net >= 0 ? '+' : ''}
                  {formatYuan(b.net)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {canAdvancedReport ? (
          <>
            <Card>
              <Text style={styles.section}>{t('report.momTitle')}</Text>
              <Text style={styles.empty}>
                {mom.pct === null
                  ? t('report.momNoPrev', { prev: formatYuan(mom.previous) })
                  : mom.delta >= 0
                    ? t('report.momUp', {
                        prev: formatYuan(mom.previous),
                        pct: mom.pct,
                      })
                    : t('report.momDown', {
                        prev: formatYuan(mom.previous),
                        pct: Math.abs(mom.pct),
                      })}
              </Text>
            </Card>
            <Card>
              <Text style={styles.section}>{t('report.trendTitle')}</Text>
              <View style={{ marginTop: 12, gap: 10 }}>
                {trend.map((item) => (
                  <View key={item.key} style={{ gap: 4 }}>
                    <View style={styles.catRow}>
                      <Text style={styles.catLabel}>{item.key}</Text>
                      <Text style={styles.catAmount}>{formatYuan(item.total)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${(item.total / trendMax) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </Card>
            <Card>
              <Text style={styles.section}>{t('report.annualTitle', { year: annual.year })}</Text>
              <Text style={styles.big}>{formatYuan(annual.total)}</Text>
              <Text style={styles.meta}>{t('report.annualCount', { count: annual.count })}</Text>
            </Card>
          </>
        ) : (
          <Card>
            <Text style={styles.section}>{t('report.trendTitle')}</Text>
            <Text style={styles.empty}>{t('report.lockDesc', { month, count: monthExpenses.length, amount: formatYuan(sum) })}</Text>
            <View style={{ height: 12 }} />
            <Button label={t('report.unlock')} onPress={() => router.push('/paywall')} />
          </Card>
        )}

        {canUseInsights ? (
          <Button
            label={t('report.openInsights')}
            variant="secondary"
            onPress={() => router.push('/insights')}
          />
        ) : null}

        <Button
          label={t('report.exportCsv')}
          variant={canExportCsv ? 'primary' : 'secondary'}
          onPress={exportCsv}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  kicker: { color: colors.muted, fontWeight: '700' },
  big: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
  },
  meta: { marginTop: 4, color: colors.muted },
  section: { fontSize: 17, fontWeight: '800', color: colors.ink },
  empty: { marginTop: 10, color: colors.muted, lineHeight: 20 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catLabel: { fontWeight: '700', color: colors.ink },
  catAmount: { fontWeight: '700', color: colors.muted },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 999, backgroundColor: colors.brand },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  memberName: { fontWeight: '700', color: colors.ink },
});
