import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field, Title } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';

export default function Onboarding() {
  const { createLedger } = useApp();
  const [ledgerName, setLedgerName] = useState('我们的账本');
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [nameC, setNameC] = useState('');

  const onStart = () => {
    const names = [nameA, nameB, nameC].map((n) => n.trim()).filter(Boolean);
    if (names.length < 2) {
      Alert.alert('再加一位', '至少填写两个人的名字，才能一起分摊。');
      return;
    }
    createLedger(ledgerName, names);
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
            <Text style={styles.brand}>一起算</Text>
            <Title>共同账本，一眼算清</Title>
            <Text style={styles.desc}>
              情侣、合租、小家庭共用。记一笔、自动分摊，月底不再扯皮。
            </Text>
          </View>

          <View style={styles.form}>
            <Field
              label="账本名称"
              value={ledgerName}
              onChangeText={setLedgerName}
              placeholder="例如：同居小窝"
            />
            <Field
              label="成员 1"
              value={nameA}
              onChangeText={setNameA}
              placeholder="你的名字"
              autoFocus
            />
            <Field
              label="成员 2"
              value={nameB}
              onChangeText={setNameB}
              placeholder="另一半 / 室友"
            />
            <Field
              label="成员 3（可选）"
              value={nameC}
              onChangeText={setNameC}
              placeholder="合租第三人"
            />
          </View>

          <Button label="开始记账" onPress={onStart} />
          <Text style={styles.tip}>数据保存在本机，可先自己验证完再考虑同步。</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 28,
  },
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
