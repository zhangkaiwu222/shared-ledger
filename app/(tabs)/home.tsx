import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip } from '../../src/components/ui';
import { colors } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { useI18n } from '../../src/i18n/I18nContext';
import { categoryDisplay } from '../../src/lib/categories';
import {
  computeBalances,
  currentMonthKey,
  expensesInMonth,
  expenseDateKey,
  formatSharePercents,
  formatYuan,
  memberName,
  spendingTotal,
} from '../../src/lib/split';

export default function HomeScreen() {
  const { activeLedger, data, removeExpense, duplicateExpense, isPro } = useApp();
  const { t } = useI18n();
  const ledger = activeLedger;
  const [query, setQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState<string | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

  const monthKey = currentMonthKey();
  const monthExpenses = useMemo(
    () => (ledger ? expensesInMonth(ledger.expenses, monthKey) : []),
    [ledger, monthKey],
  );
  const monthTotal = spendingTotal(monthExpenses);
  const budget = ledger?.monthlyBudget || 0;

  const filtered = useMemo(() => {
    if (!ledger) return [];
    return ledger.expenses.filter((e) => {
      if (e.category === 'transfer') return false;
      if (memberFilter !== 'all' && e.paidBy !== memberFilter) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!e.note.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [ledger, memberFilter, categoryFilter, query]);

  if (!ledger) return null;

  const balances = computeBalances(ledger);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>{t('appName')}</Text>
                <Text style={styles.ledgerName}>{ledger.name}</Text>
              </View>
              {!isPro ? (
                <Pressable onPress={() => router.push('/paywall')} style={styles.proPill}>
                  <Text style={styles.proText}>{t('home.upgradePro')}</Text>
                </Pressable>
              ) : (
                <View style={[styles.proPill, styles.proOn]}>
                  <Text style={[styles.proText, { color: colors.brand }]}>
                    {t('home.proBadge')}
                  </Text>
                </View>
              )}
            </View>

            <Card style={styles.summary}>
              <Text style={styles.summaryLabel}>{t('home.monthSpent')}</Text>
              <Text style={styles.summaryAmount}>{formatYuan(monthTotal)}</Text>
              {budget > 0 ? (
                <View style={styles.budgetBox}>
                  <Text style={styles.budgetLabel}>{t('home.budgetLabel')}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.min(100, (monthTotal / budget) * 100)}%`,
                          backgroundColor:
                            monthTotal > budget ? colors.accent : colors.brand,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={{
                      color: monthTotal > budget ? colors.accent : colors.muted,
                      fontWeight: '700',
                      marginTop: 6,
                    }}
                  >
                    {monthTotal > budget
                      ? t('home.budgetOver', { amount: formatYuan(monthTotal - budget) })
                      : t('home.budgetLeft', { amount: formatYuan(budget - monthTotal) })}
                  </Text>
                </View>
              ) : null}
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

            <Button label={t('home.addExpense')} onPress={() => router.push('/add')} />
            {isPro ? (
              <Button
                label={t('home.quickTemplates')}
                variant="secondary"
                onPress={() => router.push('/templates')}
              />
            ) : null}

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor={colors.muted}
              style={styles.search}
            />

            <Text style={styles.filterLabel}>{t('home.filterMember')}</Text>
            <View style={styles.chips}>
              <Chip
                label={t('common.all')}
                selected={memberFilter === 'all'}
                onPress={() => setMemberFilter('all')}
              />
              {ledger.members.map((m) => (
                <Chip
                  key={m.id}
                  label={m.name}
                  color={m.color}
                  selected={memberFilter === m.id}
                  onPress={() => setMemberFilter(m.id)}
                />
              ))}
            </View>

            <Text style={styles.filterLabel}>{t('home.filterCategory')}</Text>
            <View style={styles.chips}>
              <Chip
                label={t('common.all')}
                selected={categoryFilter === 'all'}
                onPress={() => setCategoryFilter('all')}
              />
              {Array.from(new Set(ledger.expenses.map((e) => e.category)))
                .filter((c) => c !== 'transfer')
                .map((c) => {
                  const d = categoryDisplay(c, data.customCategories);
                  return (
                    <Chip
                      key={c}
                      label={`${d.emoji} ${d.name}`}
                      selected={categoryFilter === c}
                      onPress={() => setCategoryFilter(c)}
                    />
                  );
                })}
            </View>

            <Text style={styles.section}>{t('home.recent')}</Text>
            <Text style={styles.hint}>{t('home.tapEdit')}</Text>
          </View>
        }
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyTitle}>{t('home.emptyTitle')}</Text>
            <Text style={styles.emptyDesc}>{t('home.emptyDesc')}</Text>
          </Card>
        }
        renderItem={({ item }) => {
          const cat = categoryDisplay(item.category, data.customCategories);
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/edit/[id]', params: { id: item.id } })}
              onLongPress={() => {
                Alert.alert(t('home.deleteTitle'), `${cat.name} ${formatYuan(item.amount)}`, [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('home.duplicate'),
                    onPress: () => {
                      const res = duplicateExpense(item.id);
                      if (!res.ok) {
                        router.push('/paywall');
                        return;
                      }
                      Alert.alert(t('home.duplicatedTitle'), t('home.duplicatedBody'));
                    },
                  },
                  {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => removeExpense(item.id),
                  },
                ]);
              }}
              style={styles.row}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{cat.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {cat.name}
                  {item.note ? ` · ${item.note}` : ''}
                  {item.excludeFromSettle ? ` · ${t('home.personalTag')}` : ''}
                  {item.receiptUri ? ' · 📎' : ''}
                </Text>
                <Text style={styles.rowMeta}>
                  {expenseDateKey(item)} ·{' '}
                  {t('home.paidBy', {
                    name: memberName(ledger.members, item.paidBy, t('common.unknown')),
                  })}{' '}
                  ·{' '}
                  {item.splitMode === 'equal'
                    ? t('common.equalSplit')
                    : formatSharePercents(ledger.members, item.shares)}
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
  header: { gap: 12, marginBottom: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  kicker: { color: colors.brand, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  ledgerName: { fontSize: 26, fontWeight: '800', color: colors.ink, marginTop: 4 },
  proPill: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  proOn: { backgroundColor: colors.brandSoft },
  proText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  summary: { gap: 6 },
  summaryLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  summaryAmount: { fontSize: 34, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  budgetBox: { marginTop: 8 },
  budgetLabel: { color: colors.muted, fontWeight: '600', marginBottom: 6 },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 999 },
  balanceRow: { marginTop: 12, gap: 8 },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  balanceName: { color: colors.ink, fontWeight: '600', width: 72 },
  balanceNet: { fontWeight: '700' },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
  },
  filterLabel: { fontSize: 13, fontWeight: '700', color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  section: { marginTop: 4, fontSize: 15, fontWeight: '700', color: colors.ink },
  hint: { color: colors.muted, fontSize: 12, marginTop: -4 },
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
