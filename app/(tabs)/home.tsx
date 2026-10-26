import { router } from 'expo-router';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../src/components/ui';
import { categories, colors } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import {
  computeBalances,
  formatYuan,
  memberName,
} from '../../src/lib/split';

export default function HomeScreen() {
  const { data, removeExpense, isPro } = useApp();
  const ledger = data.ledger;

  if (!ledger) return null;

  const balances = computeBalances(ledger);
  const total = ledger.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={ledger.expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.kicker}>一起算</Text>
                <Text style={styles.ledgerName}>{ledger.name}</Text>
              </View>
              {!isPro ? (
                <Pressable onPress={() => router.push('/paywall')} style={styles.proPill}>
                  <Text style={styles.proText}>升级 Pro</Text>
                </Pressable>
              ) : (
                <View style={[styles.proPill, styles.proOn]}>
                  <Text style={[styles.proText, { color: colors.brand }]}>Pro</Text>
                </View>
              )}
            </View>

            <Card style={styles.summary}>
              <Text style={styles.summaryLabel}>累计支出</Text>
              <Text style={styles.summaryAmount}>{formatYuan(total)}</Text>
              <View style={styles.balanceRow}>
                {balances.map((b) => (
                  <View key={b.memberId} style={styles.balanceItem}>
                    <View style={[styles.dot, { backgroundColor: b.color }]} />
                    <Text style={styles.balanceName}>{b.name}</Text>
                    <Text
                      style={[
                        styles.balanceNet,
                        { color: b.net >= 0 ? colors.brand : colors.accent },
                      ]}
                    >
                      {b.net >= 0 ? '+' : ''}
                      {formatYuan(b.net)}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <Button label="记一笔" onPress={() => router.push('/add')} />
            <Text style={styles.section}>最近明细</Text>
          </View>
        }
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyTitle}>还没有账单</Text>
            <Text style={styles.emptyDesc}>点「记一笔」，10 秒记下谁付的、怎么分。</Text>
          </Card>
        }
        renderItem={({ item }) => {
          const cat = categories.find((c) => c.id === item.category);
          return (
            <Pressable
              onLongPress={() => {
                Alert.alert('删除这笔？', `${cat?.label ?? item.category} ${formatYuan(item.amount)}`, [
                  { text: '取消', style: 'cancel' },
                  {
                    text: '删除',
                    style: 'destructive',
                    onPress: () => removeExpense(item.id),
                  },
                ]);
              }}
              style={styles.row}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{cat?.emoji ?? '✨'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {cat?.label ?? item.category}
                  {item.note ? ` · ${item.note}` : ''}
                </Text>
                <Text style={styles.rowMeta}>
                  {memberName(ledger.members, item.paidBy)} 付 ·{' '}
                  {item.splitMode === 'equal' ? '均摊' : '自定义'}
                </Text>
              </View>
              <Text style={styles.rowAmount}>{formatYuan(item.amount)}</Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 20, paddingBottom: 40, gap: 10 },
  header: { gap: 16, marginBottom: 8 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    color: colors.brand,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  ledgerName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
  },
  proPill: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  proOn: { backgroundColor: colors.brandSoft },
  proText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  summary: { gap: 6 },
  summaryLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  summaryAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
  },
  balanceRow: { marginTop: 12, gap: 8 },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  balanceName: { color: colors.ink, fontWeight: '600', width: 72 },
  balanceNet: { fontWeight: '700' },
  section: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  emptyTitle: { fontWeight: '700', fontSize: 16, color: colors.ink },
  emptyDesc: { marginTop: 6, color: colors.muted, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  emojiWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  rowTitle: { fontWeight: '700', color: colors.ink, fontSize: 15 },
  rowMeta: { color: colors.muted, marginTop: 3, fontSize: 12 },
  rowAmount: { fontWeight: '800', color: colors.ink, fontSize: 16 },
});
