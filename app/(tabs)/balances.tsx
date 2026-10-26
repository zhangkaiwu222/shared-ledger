import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { SettleCard } from '../../src/components/SettleCard';
import { Button, Card } from '../../src/components/ui';
import { FREE_EXPORT_LIMIT, colors } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';
import {
  computeBalances,
  formatYuan,
  memberName,
  settleUp,
} from '../../src/lib/split';

export default function BalancesScreen() {
  const { data, isPro, canExport, exportCount, markExportUsed } = useApp();
  const ledger = data.ledger;
  const shotRef = useRef<View>(null);
  const [selected, setSelected] = useState(0);

  if (!ledger) return null;

  const balances = computeBalances(ledger);
  const settlements = settleUp(balances);
  const current = settlements[selected];

  const copyText = async () => {
    if (!current) return;
    const from = memberName(ledger.members, current.from);
    const to = memberName(ledger.members, current.to);
    const text = `【一起算·${ledger.name}】\n${from} 应转给 ${to} ${formatYuan(current.amount)}\n转完咱们就两清啦～`;
    await Clipboard.setStringAsync(text);
    Alert.alert('已复制', '可以直接粘贴到微信。');
  };

  const shareCard = async () => {
    if (!current) return;
    if (!canExport) {
      router.push('/paywall');
      return;
    }
    const ok = markExportUsed();
    if (!ok) {
      router.push('/paywall');
      return;
    }
    try {
      const uri = await captureRef(shotRef, { format: 'png', quality: 1 });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: '分享催款卡片' });
      } else {
        Alert.alert('当前环境不支持系统分享', '已生成卡片，可在真机上分享到微信。');
      }
    } catch {
      Alert.alert('分享失败', '请稍后重试，或先用「复制文字」发送。');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.title}>当前净额</Text>
          <Text style={styles.hint}>正数表示别人欠你，负数表示你欠别人。</Text>
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
          <Text style={styles.title}>最少转账次数</Text>
          {settlements.length === 0 ? (
            <Text style={styles.balanced}>已经两清，真棒。</Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {settlements.map((s, idx) => (
                <Button
                  key={`${s.from}-${s.to}-${idx}`}
                  label={`${memberName(ledger.members, s.from)} → ${memberName(ledger.members, s.to)}  ${formatYuan(s.amount)}`}
                  variant={selected === idx ? 'primary' : 'secondary'}
                  onPress={() => setSelected(idx)}
                />
              ))}
            </View>
          )}
        </Card>

        {current ? (
          <View style={styles.shareBlock}>
            <Text style={styles.title}>催款卡片</Text>
            <Text style={styles.hint}>
              免费可导出 {FREE_EXPORT_LIMIT} 次
              {!isPro ? `（已用 ${exportCount}/${FREE_EXPORT_LIMIT}）` : ' · Pro 不限次去水印'}
            </Text>
            <View style={styles.cardWrap}>
              <View ref={shotRef} collapsable={false}>
                <SettleCard
                  ledgerName={ledger.name}
                  fromName={memberName(ledger.members, current.from)}
                  toName={memberName(ledger.members, current.to)}
                  amount={current.amount}
                  watermark={!isPro}
                />
              </View>
            </View>
            <Button label="分享卡片到微信" onPress={shareCard} variant="accent" />
            <Button label="复制文字催款" onPress={copyText} variant="secondary" />
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
  shareBlock: { gap: 12 },
  cardWrap: { alignItems: 'center', paddingVertical: 8 },
});
