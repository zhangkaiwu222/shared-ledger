import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Field } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { useI18n } from '../src/i18n/I18nContext';

export default function SecurityScreen() {
  const {
    data,
    canUsePin,
    canBackup,
    enablePin,
    disablePin,
    exportBackup,
    importBackup,
  } = useApp();
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [backupText, setBackupText] = useState('');

  if (!canUsePin && !canBackup) {
    return (
      <View style={styles.lock}>
        <Card>
          <Text style={styles.section}>{t('security.title')}</Text>
          <Text style={styles.empty}>{t('security.proBody')}</Text>
          <View style={{ height: 12 }} />
          <Button label={t('common.unlockPro')} onPress={() => router.push('/paywall')} />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.section}>{t('security.pinTitle')}</Text>
        <Text style={styles.meta}>
          {data.pinEnabled ? t('security.pinOn') : t('security.pinOff')}
        </Text>
        {Platform.OS === 'web' ? (
          <Text style={[styles.meta, { marginTop: 8 }]}>{t('security.pinWeb')}</Text>
        ) : (
          <>
            <View style={{ height: 10 }} />
            <Field
              label={t('security.pinLabel')}
              value={pin}
              onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="1234"
              secureTextEntry
            />
            <View style={{ height: 12 }} />
            {!data.pinEnabled ? (
              <Button
                label={t('security.enablePin')}
                onPress={async () => {
                  if (!canUsePin) {
                    router.push('/paywall');
                    return;
                  }
                  const res = await enablePin(pin);
                  if (!res.ok) {
                    Alert.alert(t('security.pinFailTitle'), t('security.pinFailBody'));
                    return;
                  }
                  setPin('');
                  Alert.alert(t('security.pinEnabledTitle'), t('security.pinEnabledBody'));
                }}
              />
            ) : (
              <Button
                label={t('security.disablePin')}
                variant="secondary"
                onPress={async () => {
                  const res = await disablePin(pin);
                  if (!res.ok) {
                    Alert.alert(t('security.wrongPin'), t('security.disableNeedPin'));
                    return;
                  }
                  setPin('');
                  Alert.alert(t('security.pinDisabledTitle'), t('security.pinDisabledBody'));
                }}
              />
            )}
          </>
        )}
      </Card>

      <Card>
        <Text style={styles.section}>{t('security.backupTitle')}</Text>
        <Text style={styles.meta}>{t('security.backupDesc')}</Text>
        <View style={{ height: 12 }} />
        <Button
          label={t('security.exportBackup')}
          onPress={async () => {
            if (!canBackup) {
              router.push('/paywall');
              return;
            }
            const json = exportBackup();
            if (!json) {
              router.push('/paywall');
              return;
            }
            await Clipboard.setStringAsync(json);
            Alert.alert(t('security.exportDone'), t('security.exportDoneBody'));
          }}
        />
        <View style={{ height: 12 }} />
        <Text style={styles.label}>{t('security.importLabel')}</Text>
        <TextInput
          value={backupText}
          onChangeText={setBackupText}
          multiline
          placeholder={t('security.importPlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.area}
        />
        <View style={{ height: 12 }} />
        <Button
          label={t('security.importBackup')}
          variant="secondary"
          onPress={() => {
            if (!canBackup) {
              router.push('/paywall');
              return;
            }
            Alert.alert(t('security.importConfirmTitle'), t('security.importConfirmBody'), [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('security.importBackup'),
                style: 'destructive',
                onPress: () => {
                  const res = importBackup(backupText);
                  if (!res.ok) {
                    Alert.alert(t('security.importFailTitle'), t('security.importFailBody'));
                    return;
                  }
                  setBackupText('');
                  Alert.alert(t('security.importDoneTitle'), t('security.importDoneBody'));
                },
              },
            ]);
          }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lock: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  section: { fontSize: 17, fontWeight: '800', color: colors.ink },
  meta: { marginTop: 8, color: colors.muted, lineHeight: 20 },
  empty: { marginTop: 8, color: colors.muted, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 8 },
  area: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 12,
    color: colors.ink,
    backgroundColor: colors.bg,
    textAlignVertical: 'top',
    fontSize: 12,
  },
});
