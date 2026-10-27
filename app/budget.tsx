import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';
import { allCategories } from '../src/lib/categories';
import {
  currentMonthKey,
  expensesInMonth,
  formatYuan,
  spendingTotal,
} from '../src/lib/split';

export default function BudgetScreen() {
  const {
    activeLedger,
    data,
    canUseBudget,
    setMonthlyBudget,
    setCategoryBudget,
    setSavingsGoal,
  } = useApp();
  const { t } = useI18n();
  const ledger = activeLedger;
  const [monthly, setMonthly] = useState(String(ledger?.monthlyBudget || ''));
  const [savings, setSavings] = useState(String(ledger?.savingsGoal || ''));

  if (!ledger) return null;

  if (!canUseBudget) {
    return (
      <View style={styles.lock}>
        <Card>
          <Text style={styles.title}>{t('budget.title')}</Text>
          <Text style={styles.meta}>{t('budget.proBody')}</Text>
          <View style={{ height: 12 }} />
          <Button label={t('common.unlockPro')} onPress={() => router.push('/paywall')} />
        </Card>
      </View>
    );
  }

  const monthExpenses = expensesInMonth(ledger.expenses, currentMonthKey());
  const used = spendingTotal(monthExpenses);
  const cats = allCategories(data.customCategories).filter((c) => c.id !== 'transfer');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Card style={{ gap: 10 }}>
        <Text style={styles.title}>{t('budget.monthly')}</Text>
        <Text style={styles.meta}>{t('budget.monthlyHint')}</Text>
        <Field label={t('budget.monthly')} value={monthly} onChangeText={setMonthly} keyboardType="decimal-pad" />
        {ledger.monthlyBudget > 0 ? (
          <Text style={styles.meta}>
            {t('budget.used', {
              used: formatYuan(used),
              limit: formatYuan(ledger.monthlyBudget),
            })}
          </Text>
        ) : null}
        <Button
          label={t('budget.save')}
          onPress={() => setMonthlyBudget(Number(monthly) || 0)}
        />
      </Card>

      <Card style={{ marginTop: 16, gap: 10 }}>
        <Text style={styles.title}>{t('budget.savings')}</Text>
        <Text style={styles.meta}>{t('budget.savingsHint')}</Text>
        <Field
          label={t('budget.savings')}
          value={savings}
          onChangeText={setSavings}
          keyboardType="decimal-pad"
        />
        <Button
          label={t('budget.saveSavings')}
          variant="secondary"
          onPress={() => setSavingsGoal(Number(savings) || 0)}
        />
      </Card>

      <Card style={{ marginTop: 16, gap: 12 }}>
        <Text style={styles.title}>{t('budget.categoryTitle')}</Text>
        {cats.slice(0, 8).map((c) => (
          <CategoryBudgetRow
            key={c.id}
            label={`${c.emoji} ${c.name}`}
            value={ledger.categoryBudgets[c.id] || 0}
            onSave={(n) => setCategoryBudget(c.id, n)}
          />
        ))}
      </Card>
    </ScrollView>
  );
}

function CategoryBudgetRow({
  label,
  value,
  onSave,
}: {
  label: string;
  value: number;
  onSave: (n: number) => void;
}) {
  const { t } = useI18n();
  const [text, setText] = useState(value ? String(value) : '');
  return (
    <View style={{ gap: 6 }}>
      <Field label={label} value={text} onChangeText={setText} keyboardType="decimal-pad" />
      <Button
        label={t('common.save')}
        variant="secondary"
        onPress={() => onSave(Number(text) || 0)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  lock: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink },
  meta: { color: colors.muted, lineHeight: 20 },
});
