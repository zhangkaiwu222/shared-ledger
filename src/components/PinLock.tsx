import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n/I18nContext';
import { Button } from './ui';

export function PinLock() {
  const { locked, unlockWithPin } = useApp();
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!locked) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.brand}>{t('appName')}</Text>
      <Text style={styles.title}>{t('security.unlockTitle')}</Text>
      <Text style={styles.desc}>{t('security.unlockDesc')}</Text>
      <TextInput
        value={pin}
        onChangeText={(v) => {
          setError(false);
          setPin(v.replace(/\D/g, '').slice(0, 6));
        }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        style={styles.input}
        placeholder="••••"
        placeholderTextColor={colors.muted}
        autoFocus
      />
      {error ? <Text style={styles.error}>{t('security.wrongPin')}</Text> : null}
      <View style={{ height: 12 }} />
      <Button
        label={t('security.unlock')}
        onPress={async () => {
          const ok = await unlockWithPin(pin);
          if (!ok) {
            setError(true);
            setPin('');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: colors.bg,
    padding: 28,
    justifyContent: 'center',
  },
  brand: { color: colors.brand, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  desc: { marginTop: 8, color: colors.muted, lineHeight: 20, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  error: { marginTop: 8, color: colors.accent, fontWeight: '700' },
});
