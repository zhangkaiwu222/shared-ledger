import { router } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../src/components/ui';
import { colors } from '../src/constants/theme';
import { IAP_PRODUCT_IDS, LINKS } from '../src/constants/links';
import { useApp } from '../src/context/AppContext';

const FEATURES = [
  '催款卡片无限导出、去水印',
  '完整月度分类报表与成员净额',
  '同一 Apple ID 可恢复已购订阅',
];

export default function PaywallScreen() {
  const { isPro, unlockProDemo } = useApp();

  const open = (url: string) => {
    void Linking.openURL(url);
  };

  const subscribePlaceholder = (plan: 'monthly' | 'yearly') => {
    Alert.alert(
      '即将接入 App Store 订阅',
      `产品 ID：${plan === 'monthly' ? IAP_PRODUCT_IDS.monthly : IAP_PRODUCT_IDS.yearly}\n\n按苹果审核要求，虚拟会员必须走 App 内购买。请在 Mac + 付费开发者账号下用 EAS/StoreKit 完成接入后再提交审核。`,
    );
  };

  const restorePurchases = () => {
    Alert.alert(
      '恢复购买',
      '正式版将调用 StoreKit 恢复订阅。若你已购买 Pro，登录同一 Apple ID 后点此即可恢复。',
    );
  };

  if (isPro) {
    return (
      <View style={styles.wrap}>
        <Card>
          <Text style={styles.title}>你已经是 Pro</Text>
          <Text style={styles.desc}>可无限导出催款卡并查看完整月报。</Text>
          <View style={{ height: 12 }} />
          <Button label="返回" onPress={() => router.back()} />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.wrap}>
      <Text style={styles.brand}>一起算 Pro</Text>
      <Text style={styles.headline}>算得清，才处得久</Text>
      <Text style={styles.desc}>
        自动续期订阅。订阅期内可使用下列全部 Pro 功能；可随时在系统设置中取消。
      </Text>

      <Card style={{ marginTop: 16, gap: 12 }}>
        {FEATURES.map((f) => (
          <Text key={f} style={styles.feature}>
            ✓  {f}
          </Text>
        ))}
      </Card>

      <View style={styles.prices}>
        <Card style={styles.priceCard}>
          <Text style={styles.priceLabel}>月度订阅</Text>
          <Text style={styles.price}>¥15</Text>
          <Text style={styles.priceHint}>每 1 个月自动续费</Text>
          <View style={{ height: 8 }} />
          <Button label="订阅月度" onPress={() => subscribePlaceholder('monthly')} />
        </Card>
        <Card style={[styles.priceCard, styles.priceBest]}>
          <Text style={styles.badge}>更划算</Text>
          <Text style={styles.priceLabel}>年度订阅</Text>
          <Text style={styles.price}>¥98</Text>
          <Text style={styles.priceHint}>每 1 年自动续费</Text>
          <View style={{ height: 8 }} />
          <Button label="订阅年度" onPress={() => subscribePlaceholder('yearly')} />
        </Card>
      </View>

      <Button label="恢复购买" variant="secondary" onPress={restorePurchases} />
      <Button label="先继续免费用" variant="ghost" onPress={() => router.back()} />

      {__DEV__ ? (
        <Button
          label="开发调试：演示解锁 Pro"
          variant="ghost"
          onPress={() => {
            unlockProDemo();
            Alert.alert('已解锁（仅开发包）', '正式包不会显示此入口。');
            router.back();
          }}
        />
      ) : null}

      <Text style={styles.legal}>
        付款将计入你的 Apple ID 账户。订阅会在当前周期结束前 24 小时自动续订并扣费，除非你提前关闭自动续订。管理或取消：设置 → Apple ID → 订阅。
      </Text>
      <Text style={styles.links}>
        <Text style={styles.link} onPress={() => open(LINKS.terms)}>
          使用条款（EULA）
        </Text>
        {'  ·  '}
        <Text style={styles.link} onPress={() => open(LINKS.privacy)}>
          隐私政策
        </Text>
        {'  ·  '}
        <Text style={styles.link} onPress={() => open(LINKS.support)}>
          技术支持
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 20,
    gap: 10,
    paddingBottom: 40,
  },
  brand: {
    color: colors.brand,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  desc: { color: colors.muted, lineHeight: 22, fontSize: 15 },
  feature: { color: colors.ink, fontWeight: '600', fontSize: 15 },
  prices: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  priceCard: { flex: 1, alignItems: 'center', gap: 4 },
  priceBest: {
    borderColor: colors.brand,
    borderWidth: 2,
    backgroundColor: colors.brandSoft,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 10,
    fontWeight: '800',
    color: colors.brand,
  },
  priceLabel: { color: colors.muted, fontWeight: '700' },
  price: { fontSize: 28, fontWeight: '800', color: colors.ink },
  priceHint: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  legal: {
    marginTop: 8,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    textAlign: 'center',
  },
  links: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  link: {
    color: colors.brand,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
