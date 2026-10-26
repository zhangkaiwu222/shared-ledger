import { router } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../src/components/ui';
import { LINKS } from '../../src/constants/links';
import { colors } from '../../src/constants/theme';
import { useApp } from '../../src/context/AppContext';

export default function SettingsScreen() {
  const { data, isPro, resetAll } = useApp();
  const ledger = data.ledger;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.title}>当前账本</Text>
          <Text style={styles.value}>{ledger?.name ?? '-'}</Text>
          <Text style={styles.meta}>
            成员：{ledger?.members.map((m) => m.name).join('、') ?? '-'}
          </Text>
        </Card>

        <Card>
          <Text style={styles.title}>订阅状态</Text>
          <Text style={styles.value}>{isPro ? '一起算 Pro' : '免费版'}</Text>
          <Text style={styles.meta}>
            免费可导出催款卡 2 次；Pro 含无限导出、去水印、完整月报。订阅请在系统设置中管理。
          </Text>
          <View style={{ height: 12 }} />
          {!isPro ? (
            <Button label="查看 Pro" onPress={() => router.push('/paywall')} />
          ) : (
            <Button
              label="管理订阅（系统设置）"
              variant="secondary"
              onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
            />
          )}
        </Card>

        <Card>
          <Text style={styles.title}>数据与隐私</Text>
          <Text style={styles.meta}>账单默认仅存本机，不强制注册登录。长按明细可删除单笔。</Text>
          <View style={{ height: 12 }} />
          <Button
            label="隐私政策"
            variant="secondary"
            onPress={() => Linking.openURL(LINKS.privacy)}
          />
          <View style={{ height: 8 }} />
          <Button
            label="技术支持"
            variant="secondary"
            onPress={() => Linking.openURL(LINKS.support)}
          />
          <View style={{ height: 8 }} />
          <Button
            label="清空并重新开始"
            variant="secondary"
            onPress={() => {
              Alert.alert('确认清空？', '所有账单将删除，并回到创建账本页。', [
                { text: '取消', style: 'cancel' },
                {
                  text: '清空',
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

        <Text style={styles.footer}>一起算 v1.0.0 · Bundle ID: com.sharedledger.app</Text>
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
  footer: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 8 },
});
