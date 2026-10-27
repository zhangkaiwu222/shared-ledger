import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field, Title } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';

export default function Onboarding() {
  const { createLedger } = useApp();
  const { t } = useI18n();
  const [ledgerName, setLedgerName] = useState(t('onboarding.defaultLedgerName'));
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [nameC, setNameC] = useState('');

  const onStart = () => {
    const names = [nameA, nameB, nameC].map((n) => n.trim()).filter(Boolean);
    if (names.length < 2) {
      Alert.alert(t('onboarding.needTwoTitle'), t('onboarding.needTwoBody'));
      return;
    }
    const res = createLedger(ledgerName || t('onboarding.defaultLedgerName'), names);
    if (!res.ok) {
      Alert.alert(t('ledgers.limitTitle'), t('ledgers.limitBody'));
      return;
    }
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.brand}>{t('appName')}</Text>
            <Title>{t('onboarding.title')}</Title>
            <Text style={styles.desc}>{t('onboarding.desc')}</Text>
          </View>

          <View style={styles.form}>
            <Field
              label={t('onboarding.ledgerName')}
              value={ledgerName}
              onChangeText={setLedgerName}
              placeholder={t('onboarding.ledgerPlaceholder')}
            />
            <Field
              label={t('onboarding.member1')}
              value={nameA}
              onChangeText={setNameA}
              placeholder={t('onboarding.member1Placeholder')}
              autoFocus
            />
            <Field
              label={t('onboarding.member2')}
              value={nameB}
              onChangeText={setNameB}
              placeholder={t('onboarding.member2Placeholder')}
            />
            <Field
              label={t('onboarding.member3')}
              value={nameC}
              onChangeText={setNameC}
              placeholder={t('onboarding.member3Placeholder')}
            />
          </View>

          <Button label={t('onboarding.start')} onPress={onStart} />
          <Text style={styles.tip}>{t('onboarding.tip')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40, gap: 28 },
  hero: { gap: 10, paddingTop: 24 },
  brand: {
    color: colors.brand,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  desc: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
  },
  form: { gap: 16 },
  tip: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
