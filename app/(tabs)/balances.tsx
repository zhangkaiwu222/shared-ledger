import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { SettleCard } from '../../src/components/SettleCard';
import { Button, Card } from '../../src/components/ui';
import { FREE_EXPORT_LIMIT } from '../../src/constants/entitlements';
import { colors } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import { useI18n } from '../../src/i18n/I18nContext';
import {
  computeBalances,
  formatYuan,
  memberName,
  settleUp,
} from '../../src/lib/split';

export default function BalancesScreen() {
  const {
    activeLedger,
    isPro,
    canExportCard,
    exportCount,
    markExportUsed,
    markSettlementPaid,
  } = useApp();
  const { t } = useI18n();
  const ledger = activeLedger;
  const shotRef = useRef<View>(null);
  const [selected, setSelected] = useState(0);

  if (!ledger) return null;

  const balances = computeBalances(ledger);
  const settlements = settleUp(balances);
  const current = settlements[selected];
  const unknown = t('common.unknown');

  const copyText = async () => {
    if (!current) return;
    const text = t('balances.copyTemplate', {
      app: t('appName'),
      ledger: ledger.name,
      from: memberName(ledger.members, current.from, unknown),
      to: memberName(ledger.members, current.to, unknown),
      amount: formatYuan(current.amount),
    });
    await Clipboard.setStringAsync(text);
    Alert.alert(t('balances.copiedTitle'), t('balances.copiedBody'));
  };

  const shareCard = async () => {
    if (!current) return;
    if (!canExportCard) {
      router.push('/paywall');
      return;
    }
    if (!markExportUsed()) {
      router.push('/paywall');
      return;
    }
    try {
      const uri = await captureRef(shotRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('balances.shareTitle'),
        });
      } else {
        Alert.alert(t('balances.shareUnavailableTitle'), t('balances.shareUnavailableBody'));
      }
    } catch {
      Alert.alert(t('balances.shareFailTitle'), t('balances.shareFailBody'));
    }
  };

  const onMarkPaid = () => {
    if (!current) return;
    markSettlementPaid(current.from, current.to, current.amount);
    setSelected(0);
    Alert.alert(t('balances.markedTitle'), t('balances.markedBody'));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.title}>{t('balances.netTitle')}</Text>
          <Text style={styles.hint}>{t('balances.netHint')}</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            {balances.map((b) => (
              <View key={b.memberId} style={styles.netRow}>
                <View style={[styles.dot, { backgroundColor: b.color }]} />
                <Text style={styles.name}>{b.name}</Text>
                <Text style={{ flex: 1 }} />
                <Text style={[styles.net, { color: b.net >= 0 ? colors.brand : colors.accent }]}>
                  {b.net >= 0 ? '+' : ''}
                  {formatYuan(b.net)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.title}>{t('balances.minTransfers')}</Text>
          {settlements.length === 0 ? (
            <Text style={styles.balanced}>{t('balances.settled')}</Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {settlements.map((s, idx) => (
                <Button
                  key={`${s.from}-${s.to}-${idx}`}
                  label={`${memberName(ledger.members, s.from, unknown)} → ${memberName(ledger.members, s.to, unknown)}  ${formatYuan(s.amount)}`}
                  variant={selected === idx ? 'primary' : 'secondary'}
                  onPress={() => setSelected(idx)}
                />
              ))}
              <Button label={t('balances.markPaid')} onPress={onMarkPaid} variant="accent" />
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.title}>{t('balances.history')}</Text>
          {ledger.settlements.length === 0 ? (
            <Text style={styles.hint}>{t('balances.historyEmpty')}</Text>
          ) : (
            <View style={{ marginTop: 10, gap: 8 }}>
              {ledger.settlements.slice(0, 20).map((s) => (
                <Text key={s.id} style={styles.historyLine}>
                  {s.paidAt.slice(0, 10)} · {memberName(ledger.members, s.from, unknown)} →{' '}
                  {memberName(ledger.members, s.to, unknown)} · {formatYuan(s.amount)}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {current ? (
          <View style={styles.shareBlock}>
            <Text style={styles.title}>{t('balances.settleCard')}</Text>
            <Text style={styles.hint}>
              {t('balances.freeExports', { limit: FREE_EXPORT_LIMIT })}
              {!isPro
                ? t('balances.usedExports', { used: exportCount, limit: FREE_EXPORT_LIMIT })
                : t('balances.proExports')}
            </Text>
            <View style={styles.cardWrap}>
              <View ref={shotRef} collapsable={false}>
                <SettleCard
                  ledgerName={ledger.name}
                  fromName={memberName(ledger.members, current.from, unknown)}
                  toName={memberName(ledger.members, current.to, unknown)}
                  amount={current.amount}
                  watermark={!isPro}
                />
              </View>
            </View>
            <Button label={t('balances.shareWechat')} onPress={shareCard} variant="accent" />
            <Button label={t('balances.copyText')} onPress={copyText} variant="secondary" />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  hint: { marginTop: 4, color: colors.muted, fontSize: 13, lineHeight: 18 },
  netRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontWeight: '700', color: colors.ink },
  net: { fontWeight: '800', fontSize: 16 },
  balanced: { marginTop: 12, color: colors.brand, fontWeight: '700' },
  historyLine: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  shareBlock: { gap: 12 },
  cardWrap: { alignItems: 'center', paddingVertical: 8 },
});
