import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Chip, Field } from '../src/components/ui';
import { categories, colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { equalShares } from '../src/lib/split';

export default function AddExpenseScreen() {
  const { data, addExpense } = useApp();
  const ledger = data.ledger;
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(categories[0].id);
  const [note, setNote] = useState('');
  const [paidBy, setPaidBy] = useState(ledger?.members[0]?.id ?? '');

  const previewShares = useMemo(() => {
    if (!ledger) return {};
    return equalShares(ledger.members.map((m) => m.id));
  }, [ledger]);

  if (!ledger) return null;

  const onSave = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert('金额不对', '请输入大于 0 的数字。');
      return;
    }
    if (!paidBy) {
      Alert.alert('请选择付款人');
      return;
    }
    addExpense({
      amount: Math.round(value * 100) / 100,
      category,
      note,
      paidBy,
      splitMode: 'equal',
      shares: previewShares,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field
          label="金额（元）"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          autoFocus
        />

        <View style={styles.block}>
          <Text style={styles.label}>分类</Text>
          <View style={styles.chips}>
            {categories.map((c) => (
              <Chip
                key={c.id}
                label={`${c.emoji} ${c.label}`}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>谁付的</Text>
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
        </View>

        <Field
          label="备注（可选）"
          value={note}
          onChangeText={setNote}
          placeholder="例如：周末火锅"
        />

        <View style={styles.preview}>
          <Text style={styles.label}>分摊预览（均摊）</Text>
          {ledger.members.map((m) => (
            <Text key={m.id} style={styles.previewLine}>
              {m.name} 承担{' '}
              {amount && Number(amount) > 0
                ? `¥${((Number(amount) * (previewShares[m.id] ?? 0))).toFixed(2)}`
                : '—'}
            </Text>
          ))}
        </View>

        <Button label="保存" onPress={onSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  block: { gap: 10 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preview: {
    backgroundColor: colors.brandSoft,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  previewLine: { color: colors.ink, fontWeight: '600' },
});
