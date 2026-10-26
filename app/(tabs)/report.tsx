import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../src/components/ui';
import { categories, colors } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import {
  categoryTotals,
  computeBalances,
  currentMonthKey,
  currentMonthLabel,
  expensesInMonth,
  formatYuan,
} from '../../src/lib/split';

export default function ReportScreen() {
  const { data, isPro } = useApp();
  const ledger = data.ledger;
  if (!ledger) return null;

  const key = currentMonthKey();
  const monthExpenses = expensesInMonth(ledger.expenses, key);
  const totals = categoryTotals(monthExpenses);
  const sum = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const balances = computeBalances({ ...ledger, expenses: monthExpenses });
  const max = Math.max(...totals.map((t) => t.total), 1);

  if (!isPro) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.lock}>
          <Card>
            <Text style={styles.lockTitle}>{currentMonthLabel()}报表</Text>
            <Text style={styles.lockDesc}>
              本月已记 {monthExpenses.length} 笔，合计 {formatYuan(sum)}。
              升级 Pro 查看分类占比、成员贡献与可分享年报。
            </Text>
            <View style={{ height: 12 }} />
            <Button label="解锁完整报表" onPress={() => router.push('/paywall')} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.kicker}>{currentMonthLabel()}</Text>
          <Text style={styles.big}>{formatYuan(sum)}</Text>
          <Text style={styles.meta}>共 {monthExpenses.length} 笔支出</Text>
        </Card>

        <Card>
          <Text style={styles.section}>分类占比</Text>
          {totals.length === 0 ? (
            <Text style={styles.empty}>本月还没有账单。</Text>
          ) : (
            <View style={{ marginTop: 12, gap: 12 }}>
              {totals.map((t) => {
                const cat = categories.find((c) => c.id === t.category);
                return (
                  <View key={t.category} style={{ gap: 6 }}>
                    <View style={styles.catRow}>
                      <Text style={styles.catLabel}>
                        {cat?.emoji ?? '✨'} {cat?.label ?? t.category}
                      </Text>
                      <Text style={styles.catAmount}>{formatYuan(t.total)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${(t.total / max) * 100}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.section}>成员本月净额</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            {balances.map((b) => (
              <View key={b.memberId} style={styles.memberRow}>
                <View style={[styles.dot, { backgroundColor: b.color }]} />
                <Text style={styles.memberName}>{b.name}</Text>
                <Text style={{ flex: 1 }} />
                <Text style={{ fontWeight: '800', color: b.net >= 0 ? colors.brand : colors.accent }}>
                  {b.net >= 0 ? '+' : ''}
                  {formatYuan(b.net)}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  lock: { flex: 1, padding: 20, justifyContent: 'center' },
  lockTitle: { fontSize: 22, fontWeight: '800', color: colors.ink },
  lockDesc: { marginTop: 10, color: colors.muted, lineHeight: 22, fontSize: 15 },
  kicker: { color: colors.muted, fontWeight: '700' },
  big: {
    marginTop: 6,
    fontSize: 36,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
  },
  meta: { marginTop: 4, color: colors.muted },
  section: { fontSize: 17, fontWeight: '800', color: colors.ink },
  empty: { marginTop: 10, color: colors.muted },
  catRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catLabel: { fontWeight: '700', color: colors.ink },
  catAmount: { fontWeight: '700', color: colors.muted },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.brand,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  memberName: { fontWeight: '700', color: colors.ink },
});
