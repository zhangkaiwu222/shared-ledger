import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, Chip, Field } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';
import { allCategories } from '../src/lib/categories';
import { toDateKey } from '../src/lib/date';
import { equalShares, formatYuan, round2 } from '../src/lib/split';
import type { SplitMode } from '../src/types';

function percentsFromEqual(memberIds: string[]): Record<string, string> {
  const n = memberIds.length || 1;
  const base = Math.floor(10000 / n) / 100;
  const values: Record<string, string> = {};
  let assigned = 0;
  memberIds.forEach((id, i) => {
    if (i === memberIds.length - 1) {
      values[id] = round2(100 - assigned).toFixed(2).replace(/\.00$/, '');
    } else {
      values[id] = String(base);
      assigned = round2(assigned + base);
    }
  });
  return values;
}

function percentsFromShares(
  memberIds: string[],
  shares: Record<string, number>,
): Record<string, string> {
  return Object.fromEntries(
    memberIds.map((id) => {
      const pct = round2((shares[id] ?? 0) * 100);
      return [id, Number.isInteger(pct) ? String(pct) : pct.toFixed(1)];
    }),
  );
}

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    activeLedger,
    data,
    addExpense,
    updateExpense,
    canAttachReceipt,
    canUseTemplates,
    addTemplate,
    isPro,
  } = useApp();
  const { t } = useI18n();
  const ledger = activeLedger;
  const editing = id ? ledger?.expenses.find((e) => e.id === id) : undefined;

  const cats = allCategories(data.customCategories).filter((c) => c.id !== 'transfer');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [date, setDate] = useState(editing?.date || toDateKey());
  const [category, setCategory] = useState(editing?.category || cats[0]?.id || 'food');
  const [note, setNote] = useState(editing?.note || '');
  const [paidBy, setPaidBy] = useState(editing?.paidBy || ledger?.members[0]?.id || '');
  const [splitMode, setSplitMode] = useState<SplitMode>(editing?.splitMode || 'equal');
  const [percents, setPercents] = useState<Record<string, string>>({});
  const [receiptUri, setReceiptUri] = useState(editing?.receiptUri || '');
  const [excludeFromSettle, setExcludeFromSettle] = useState(
    Boolean(editing?.excludeFromSettle),
  );

  useEffect(() => {
    if (!ledger) return;
    const ids = ledger.members.map((m) => m.id);
    if (editing?.splitMode === 'custom') {
      setPercents(percentsFromShares(ids, editing.shares));
    } else {
      setPercents(percentsFromEqual(ids));
    }
  }, [ledger, editing]);

  const memberIds = useMemo(() => ledger?.members.map((m) => m.id) ?? [], [ledger]);

  const shares = useMemo(() => {
    if (!ledger) return {};
    if (splitMode === 'equal') return equalShares(memberIds);
    const parsed: Record<string, number> = {};
    for (const mid of memberIds) {
      const n = Number(percents[mid]);
      parsed[mid] = Number.isFinite(n) ? n : 0;
    }
    const total = Object.values(parsed).reduce((s, n) => s + n, 0);
    if (total <= 0) return equalShares(memberIds);
    return Object.fromEntries(memberIds.map((mid) => [mid, (parsed[mid] ?? 0) / total]));
  }, [ledger, splitMode, percents, memberIds]);

  const percentTotal = useMemo(
    () => round2(memberIds.reduce((s, mid) => s + (Number(percents[mid]) || 0), 0)),
    [memberIds, percents],
  );

  if (!ledger) return null;

  const onSave = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert(t('add.invalidAmountTitle'), t('add.invalidAmountBody'));
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert(t('add.invalidDate'));
      return;
    }
    if (!paidBy) {
      Alert.alert(t('add.pickPayer'));
      return;
    }
    if (splitMode === 'custom' && Math.abs(percentTotal - 100) > 0.05) {
      Alert.alert(t('add.percentTitle'), t('add.percentBody', { n: percentTotal }));
      return;
    }

    if ((receiptUri || excludeFromSettle) && !isPro) {
      Alert.alert(t('common.proOnly'), t('add.proExtrasBody'));
      router.push('/paywall');
      return;
    }

    const input = {
      amount: Math.round(value * 100) / 100,
      category,
      note,
      paidBy,
      splitMode,
      shares,
      date,
      receiptUri: receiptUri || undefined,
      excludeFromSettle,
    };
    if (editing) updateExpense(editing.id, input);
    else addExpense(input);
    router.back();
  };

  const pickReceipt = async () => {
    if (!canAttachReceipt) {
      router.push('/paywall');
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('add.receiptPermissionTitle'), t('add.receiptPermissionBody'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field
          label={t('add.amount')}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          autoFocus={!editing}
        />
        <Field label={t('add.date')} value={date} onChangeText={setDate} placeholder="2026-10-27" />

        <View style={styles.block}>
          <Text style={styles.label}>{t('add.category')}</Text>
          <View style={styles.chips}>
            {cats.map((c) => (
              <Chip
                key={c.id}
                label={`${c.emoji} ${c.name}`}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>{t('add.paidBy')}</Text>
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

        <View style={styles.block}>
          <Text style={styles.label}>{t('add.splitMode')}</Text>
          <View style={styles.chips}>
            <Chip label={t('add.equal')} selected={splitMode === 'equal'} onPress={() => setSplitMode('equal')} />
            <Chip
              label={t('add.byPercent')}
              selected={splitMode === 'custom'}
              onPress={() => setSplitMode('custom')}
            />
          </View>
        </View>

        {splitMode === 'custom' ? (
          <View style={styles.ratioCard}>
            <View style={styles.ratioHeader}>
              <Text style={styles.label}>{t('add.percentLabel')}</Text>
              <Chip label={t('add.resetEqual')} onPress={() => setPercents(percentsFromEqual(memberIds))} />
            </View>
            {ledger.members.map((m) => (
              <View key={m.id} style={styles.ratioRow}>
                <View style={[styles.dot, { backgroundColor: m.color }]} />
                <Text style={styles.ratioName}>{m.name}</Text>
                <TextInput
                  value={percents[m.id] ?? ''}
                  onChangeText={(text) =>
                    setPercents((prev) => ({ ...prev, [m.id]: text.replace(/[^\d.]/g, '') }))
                  }
                  keyboardType="decimal-pad"
                  style={styles.ratioInput}
                />
                <Text style={styles.pct}>%</Text>
              </View>
            ))}
            <Text
              style={[
                styles.totalHint,
                Math.abs(percentTotal - 100) > 0.05 && styles.totalBad,
              ]}
            >
              {Math.abs(percentTotal - 100) > 0.05
                ? t('add.percentNeed100', { n: percentTotal })
                : t('add.percentOk', { n: percentTotal })}
            </Text>
          </View>
        ) : null}

        <Field
          label={t('add.note')}
          value={note}
          onChangeText={setNote}
          placeholder={t('add.notePlaceholder')}
        />

        <View style={styles.block}>
          <Text style={styles.label}>{t('add.personal')}</Text>
          <View style={styles.chips}>
            <Chip
              label={t('add.includeSettle')}
              selected={!excludeFromSettle}
              onPress={() => setExcludeFromSettle(false)}
            />
            <Chip
              label={isPro ? t('add.excludeSettle') : t('add.excludeSettlePro')}
              selected={excludeFromSettle}
              onPress={() => {
                if (!isPro) {
                  router.push('/paywall');
                  return;
                }
                setExcludeFromSettle(true);
              }}
            />
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>{t('add.receipt')}</Text>
          {receiptUri ? (
            <Pressable onPress={pickReceipt}>
              <Image source={{ uri: receiptUri }} style={styles.receipt} />
            </Pressable>
          ) : (
            <Button
              label={canAttachReceipt ? t('add.addReceipt') : t('add.addReceiptPro')}
              variant="secondary"
              onPress={pickReceipt}
            />
          )}
          {receiptUri ? (
            <Button
              label={t('add.clearReceipt')}
              variant="ghost"
              onPress={() => setReceiptUri('')}
            />
          ) : null}
        </View>

        <View style={styles.preview}>
          <Text style={styles.label}>
            {splitMode === 'equal' ? t('add.previewEqual') : t('add.previewCustom')}
          </Text>
          {ledger.members.map((m) => {
            const ratio = shares[m.id] ?? 0;
            const money =
              amount && Number(amount) > 0
                ? formatYuan(round2(Number(amount) * ratio))
                : '—';
            return (
              <Text key={m.id} style={styles.previewLine}>
                {t('add.bears', { name: m.name, pct: (ratio * 100).toFixed(1), money })}
              </Text>
            );
          })}
        </View>

        <Button label={t('common.save')} onPress={onSave} />
        <Button
          label={canUseTemplates ? t('add.saveTemplate') : t('add.saveTemplatePro')}
          variant="secondary"
          onPress={() => {
            if (!canUseTemplates) {
              router.push('/paywall');
              return;
            }
            const value = Number(amount);
            if (!Number.isFinite(value) || value <= 0 || !paidBy) {
              Alert.alert(t('add.invalidAmountTitle'), t('add.invalidAmountBody'));
              return;
            }
            addTemplate({
              title: note.trim() || t('add.templateDefault'),
              amount: Math.round(value * 100) / 100,
              category,
              note,
              paidBy,
              splitMode,
              shares,
            });
            Alert.alert(t('add.templateSavedTitle'), t('add.templateSavedBody'));
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  block: { gap: 10 },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratioCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 12,
  },
  ratioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  ratioName: { width: 72, fontWeight: '700', color: colors.ink },
  ratioInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    backgroundColor: colors.bg,
    textAlign: 'right',
  },
  pct: { width: 20, color: colors.muted, fontWeight: '700' },
  totalHint: { fontSize: 13, fontWeight: '700', color: colors.brand },
  totalBad: { color: colors.accent },
  preview: {
    backgroundColor: colors.brandSoft,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  previewLine: { color: colors.ink, fontWeight: '600' },
  receipt: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
  },
});
