import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, Field } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';
import { allCategories } from '../src/lib/categories';
import { formatYuan } from '../src/lib/split';
import type { SplitMode } from '../src/types';

export default function TemplatesScreen() {
  const {
    activeLedger,
    data,
    canUseTemplates,
    addTemplate,
    removeTemplate,
    applyTemplate,
  } = useApp();
  const { t } = useI18n();
  const ledger = activeLedger;

  const cats = allCategories(data.customCategories).filter((c) => c.id !== 'transfer');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(cats[0]?.id || 'food');
  const [paidBy, setPaidBy] = useState(ledger?.members[0]?.id || '');
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');

  if (!canUseTemplates) {
    return (
      <View style={styles.lock}>
        <Card>
          <Text style={styles.section}>{t('templates.title')}</Text>
          <Text style={styles.empty}>{t('templates.proBody')}</Text>
          <View style={{ height: 12 }} />
          <Button label={t('common.unlockPro')} onPress={() => router.push('/paywall')} />
        </Card>
      </View>
    );
  }

  if (!ledger) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.section}>{t('templates.add')}</Text>
        <View style={{ height: 8 }} />
        <Field label={t('templates.ruleTitle')} value={title} onChangeText={setTitle} placeholder={t('templates.titlePlaceholder')} />
        <View style={{ height: 8 }} />
        <Field
          label={t('add.amount')}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <View style={{ height: 10 }} />
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
        <View style={{ height: 10 }} />
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
        <View style={{ height: 10 }} />
        <Text style={styles.label}>{t('add.splitMode')}</Text>
        <View style={styles.chips}>
          <Chip label={t('add.equal')} selected={splitMode === 'equal'} onPress={() => setSplitMode('equal')} />
          <Chip
            label={t('add.byPercent')}
            selected={splitMode === 'custom'}
            onPress={() => setSplitMode('custom')}
          />
        </View>
        <View style={{ height: 12 }} />
        <Button
          label={t('templates.save')}
          onPress={() => {
            const value = Number(amount);
            if (!title.trim() || !Number.isFinite(value) || value <= 0 || !paidBy) {
              Alert.alert(t('templates.invalidTitle'), t('templates.invalidBody'));
              return;
            }
            addTemplate({
              title: title.trim(),
              amount: Math.round(value * 100) / 100,
              category,
              note: title.trim(),
              paidBy,
              splitMode,
            });
            setTitle('');
            setAmount('');
          }}
        />
      </Card>

      {data.templates.length === 0 ? (
        <Card>
          <Text style={styles.empty}>{t('templates.empty')}</Text>
        </Card>
      ) : (
        data.templates.map((tpl) => (
          <Card key={tpl.id}>
            <Text style={styles.tplTitle}>{tpl.title}</Text>
            <Text style={styles.meta}>
              {formatYuan(tpl.amount)} · {tpl.category}
            </Text>
            <View style={{ height: 10 }} />
            <Button
              label={t('templates.apply')}
              onPress={() => {
                const res = applyTemplate(tpl.id);
                if (!res.ok) {
                  router.push('/paywall');
                  return;
                }
                Alert.alert(t('templates.appliedTitle'), t('templates.appliedBody'));
              }}
            />
            <View style={{ height: 8 }} />
            <Button
              label={t('common.delete')}
              variant="secondary"
              onPress={() => removeTemplate(tpl.id)}
            />
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lock: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  section: { fontSize: 17, fontWeight: '800', color: colors.ink },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { color: colors.muted, lineHeight: 20 },
  tplTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  meta: { marginTop: 4, color: colors.muted },
});
