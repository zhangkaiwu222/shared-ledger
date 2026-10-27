import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, Field } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';
import { allCategories } from '../src/lib/categories';
import type { RecurringFrequency } from '../src/types';

export default function RecurringScreen() {
  const {
    activeLedger,
    data,
    canUseRecurring,
    addRecurring,
    toggleRecurring,
    removeRecurring,
  } = useApp();
  const { t } = useI18n();
  const ledger = activeLedger;
  const cats = allCategories(data.customCategories).filter((c) => c.id !== 'transfer');

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(cats[0]?.id || 'rent');
  const [paidBy, setPaidBy] = useState(ledger?.members[0]?.id || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [day, setDay] = useState('1');

  if (!ledger) return null;

  if (!canUseRecurring) {
    return (
      <View style={styles.lock}>
        <Card>
          <Text style={styles.title}>{t('recurring.title')}</Text>
          <Text style={styles.meta}>{t('recurring.proBody')}</Text>
          <View style={{ height: 12 }} />
          <Button label={t('common.unlockPro')} onPress={() => router.push('/paywall')} />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      {ledger.recurring.length === 0 ? (
        <Text style={styles.meta}>{t('recurring.empty')}</Text>
      ) : (
        ledger.recurring.map((rule) => (
          <Card key={rule.id} style={{ marginBottom: 12, gap: 8 }}>
            <Text style={styles.title}>{rule.title}</Text>
            <Text style={styles.meta}>
              ¥{rule.amount.toFixed(2)} · {rule.frequency} · {t('recurring.next', { date: rule.nextDate })}
            </Text>
            <Button
              label={rule.enabled ? t('recurring.enabled') : t('recurring.disabled')}
              variant="secondary"
              onPress={() => toggleRecurring(rule.id, !rule.enabled)}
            />
            <Button
              label={t('common.delete')}
              variant="ghost"
              onPress={() => removeRecurring(rule.id)}
            />
          </Card>
        ))
      )}

      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>{t('recurring.add')}</Text>
        <Field label={t('recurring.ruleTitle')} value={title} onChangeText={setTitle} />
        <Field
          label={t('add.amount')}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <View style={styles.chips}>
          <Chip
            label={t('recurring.monthly')}
            selected={frequency === 'monthly'}
            onPress={() => setFrequency('monthly')}
          />
          <Chip
            label={t('recurring.weekly')}
            selected={frequency === 'weekly'}
            onPress={() => setFrequency('weekly')}
          />
        </View>
        <Field
          label={frequency === 'monthly' ? t('recurring.dayOfMonth') : t('recurring.weekday')}
          value={day}
          onChangeText={setDay}
          keyboardType="number-pad"
        />
        <View style={styles.chips}>
          {cats.slice(0, 8).map((c) => (
            <Chip
              key={c.id}
              label={`${c.emoji} ${c.name}`}
              selected={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </View>
        <View style={styles.chips}>
          {ledger.members.map((m) => (
            <Chip
              key={m.id}
              label={m.name}
              color={m.color}
              selected={paidBy === m.id}
              onPress={() => setPaidBy(m.id)}
            />
          ))}
        </View>
        <Button
          label={t('common.save')}
          onPress={() => {
            const value = Number(amount);
            if (!value || value <= 0) {
              Alert.alert(t('add.invalidAmountTitle'), t('add.invalidAmountBody'));
              return;
            }
            addRecurring({
              title: title || 'Recurring',
              amount: value,
              category,
              note: title,
              paidBy,
              splitMode: 'equal',
              frequency,
              day: Number(day) || 1,
            });
            setTitle('');
            setAmount('');
          }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 8 },
  lock: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink },
  meta: { color: colors.muted, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
