import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Field } from '../../src/components/ui';
import { FREE_EXPORT_LIMIT } from '../../src/constants/entitlements';
import { LINKS } from '../../src/constants/links';
import { colors } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import type { AppLocaleId } from '../../src/i18n';
import { useI18n } from '../../src/i18n/I18nContext';

export default function SettingsScreen() {
  const {
    activeLedger,
    isPro,
    addMember,
    addCustomCategory,
    resetAll,
    canAddCustomCategory,
    canAddMember,
  } = useApp();
  const { t, preference, locales, setPreference } = useI18n();
  const ledger = activeLedger;
  const [memberName, setMemberName] = useState('');
  const [catName, setCatName] = useState('');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.title}>{t('settings.ledger')}</Text>
          <Text style={styles.value}>{ledger?.name ?? '-'}</Text>
          <Text style={styles.meta}>
            {t('settings.members', {
              names: ledger?.members.map((m) => m.name).join('、') ?? '-',
            })}
          </Text>
          <View style={{ height: 12 }} />
          <Button label={t('settings.manageLedgers')} onPress={() => router.push('/ledgers')} />
          <View style={{ height: 8 }} />
          <Field
            label={t('settings.addMember')}
            value={memberName}
            onChangeText={setMemberName}
            placeholder={t('settings.addMemberPlaceholder')}
          />
          <View style={{ height: 8 }} />
          <Button
            label={canAddMember ? t('common.add') : t('common.unlockPro')}
            variant="secondary"
            onPress={() => {
              if (!canAddMember) {
                router.push('/paywall');
                return;
              }
              if (!memberName.trim()) return;
              const res = addMember(memberName);
              if (!res.ok) {
                router.push('/paywall');
                return;
              }
              setMemberName('');
            }}
          />
          {!canAddMember ? (
            <Text style={styles.meta}>{t('settings.memberLimit')}</Text>
          ) : null}
        </Card>

        <Card>
          <Text style={styles.title}>{t('settings.proTools')}</Text>
          <View style={{ height: 12 }} />
          <Button label={t('settings.recurring')} onPress={() => router.push('/recurring')} />
          <View style={{ height: 8 }} />
          <Button label={t('settings.budget')} variant="secondary" onPress={() => router.push('/budget')} />
          <View style={{ height: 8 }} />
          <Button label={t('settings.insights')} variant="secondary" onPress={() => router.push('/insights')} />
          <View style={{ height: 8 }} />
          <Button label={t('settings.templates')} variant="secondary" onPress={() => router.push('/templates')} />
          <View style={{ height: 8 }} />
          <Button label={t('settings.security')} variant="secondary" onPress={() => router.push('/security')} />
        </Card>

        <Card>
          <Text style={styles.title}>{t('settings.customCategories')}</Text>
          <View style={{ height: 8 }} />
          <Field
            label={t('settings.categoryName')}
            value={catName}
            onChangeText={setCatName}
            placeholder="☕️ Coffee"
          />
          <View style={{ height: 8 }} />
          <Button
            label={canAddCustomCategory ? t('settings.addCategory') : t('common.unlockPro')}
            variant="secondary"
            onPress={() => {
              if (!canAddCustomCategory) {
                router.push('/paywall');
                return;
              }
              if (!catName.trim()) return;
              const emojiMatch = catName.trim().match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u);
              const emoji = emojiMatch?.[1] || '📌';
              const name = catName.trim().replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u, '');
              addCustomCategory(name || catName.trim(), emoji);
              setCatName('');
            }}
          />
        </Card>

        <Card>
          <Text style={styles.title}>{t('settings.language')}</Text>
          <Text style={styles.meta}>{t('settings.languageHint')}</Text>
          <View style={styles.langWrap}>
            {locales.map((lang) => {
              const selected = preference === lang.id;
              const label =
                lang.id === 'system' ? t('settings.systemDefault') : lang.nativeLabel;
              return (
                <Pressable
                  key={lang.id}
                  onPress={() => setPreference(lang.id as AppLocaleId)}
                  style={[styles.langChip, selected && styles.langChipOn]}
                >
                  <Text style={[styles.langText, selected && styles.langTextOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.title}>{t('settings.subscription')}</Text>
          <Text style={styles.value}>{isPro ? t('settings.pro') : t('settings.free')}</Text>
          <Text style={styles.meta}>
            {t('settings.subHint', { limit: FREE_EXPORT_LIMIT })}
          </Text>
          <View style={{ height: 12 }} />
          {!isPro ? (
            <Button label={t('settings.viewPro')} onPress={() => router.push('/paywall')} />
          ) : (
            <Button
              label={t('settings.manageSub')}
              variant="secondary"
              onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
            />
          )}
        </Card>

        <Card>
          <Text style={styles.title}>{t('settings.dataPrivacy')}</Text>
          <Text style={styles.meta}>{t('settings.dataHint')}</Text>
          <View style={{ height: 12 }} />
          <Button
            label={t('settings.privacy')}
            variant="secondary"
            onPress={() => Linking.openURL(LINKS.privacy)}
          />
          <View style={{ height: 8 }} />
          <Button
            label={t('settings.support')}
            variant="secondary"
            onPress={() => Linking.openURL(LINKS.support)}
          />
          <View style={{ height: 8 }} />
          <Button
            label={t('settings.reset')}
            variant="secondary"
            onPress={() => {
              Alert.alert(t('settings.resetTitle'), t('settings.resetBody'), [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('settings.clear'),
                  style: 'destructive',
                  onPress: async () => {
                    await resetAll();
                    router.replace('/onboarding');
                  },
                },
              ]);
            }}
          />
        </Card>

        <Text style={styles.footer}>
          {t('settings.footer', { version: '1.0.0' })} · com.zhangkaiwu222.sharedledger
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  title: { fontSize: 14, fontWeight: '700', color: colors.muted },
  value: { marginTop: 8, fontSize: 20, fontWeight: '800', color: colors.ink },
  meta: { marginTop: 8, color: colors.muted, lineHeight: 20 },
  langWrap: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bg,
  },
  langChipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  langText: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  langTextOn: { color: '#fff' },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 8 },
});
