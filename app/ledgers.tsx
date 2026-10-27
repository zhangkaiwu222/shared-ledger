import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';

export default function LedgersScreen() {
  const { data, activeLedger, createLedger, switchLedger, canCreateLedger } = useApp();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const onCreate = () => {
    if (!canCreateLedger) {
      Alert.alert(t('ledgers.limitTitle'), t('ledgers.limitBody'));
      router.push('/paywall');
      return;
    }
    const res = createLedger(name || t('ledgers.namePlaceholder'), [a, b]);
    if (!res.ok) {
      if (res.reason === 'need_members') {
        Alert.alert(t('onboarding.needTwoTitle'), t('onboarding.needTwoBody'));
      } else {
        Alert.alert(t('ledgers.limitTitle'), t('ledgers.limitBody'));
        router.push('/paywall');
      }
      return;
    }
    setName('');
    setA('');
    setB('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      {data.ledgers.map((ledger) => (
        <Card key={ledger.id} style={{ marginBottom: 12 }}>
          <Text style={styles.name}>
            {ledger.name}
            {ledger.id === activeLedger?.id ? ` · ${t('ledgers.active')}` : ''}
          </Text>
          <Text style={styles.meta}>
            {ledger.members.map((m) => m.name).join('、')} · {ledger.expenses.length}
          </Text>
          {ledger.id !== activeLedger?.id ? (
            <>
              <View style={{ height: 10 }} />
              <Button label={t('ledgers.switch')} onPress={() => switchLedger(ledger.id)} />
            </>
          ) : null}
        </Card>
      ))}

      <Card>
        <Text style={styles.section}>
          {canCreateLedger ? t('ledgers.create') : t('ledgers.createPro')}
        </Text>
        <View style={{ height: 10 }} />
        <Field
          label={t('onboarding.ledgerName')}
          value={name}
          onChangeText={setName}
          placeholder={t('ledgers.namePlaceholder')}
        />
        <View style={{ height: 10 }} />
        <Field label={t('onboarding.member1')} value={a} onChangeText={setA} />
        <View style={{ height: 10 }} />
        <Field label={t('onboarding.member2')} value={b} onChangeText={setB} />
        <View style={{ height: 12 }} />
        <Button label={t('common.add')} onPress={onCreate} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  name: { fontSize: 18, fontWeight: '800', color: colors.ink },
  meta: { marginTop: 6, color: colors.muted },
  section: { fontSize: 16, fontWeight: '800', color: colors.ink },
});
