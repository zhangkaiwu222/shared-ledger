import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/constants/theme';
import { useI18n } from '../../src/i18n/I18nContext';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: focused ? '800' : '600',
        color: focused ? colors.brand : colors.muted,
      }}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: colors.ink },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.homeTitle'),
          tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.iconHome')} focused={focused} />,
          tabBarLabel: t('tabs.homeLabel'),
        }}
      />
      <Tabs.Screen
        name="balances"
        options={{
          title: t('tabs.balancesTitle'),
          tabBarIcon: ({ focused }) => (
            <TabIcon label={t('tabs.iconBalances')} focused={focused} />
          ),
          tabBarLabel: t('tabs.balancesLabel'),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: t('tabs.reportTitle'),
          tabBarIcon: ({ focused }) => <TabIcon label={t('tabs.iconReport')} focused={focused} />,
          tabBarLabel: t('tabs.reportLabel'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settingsTitle'),
          tabBarIcon: ({ focused }) => (
            <TabIcon label={t('tabs.iconSettings')} focused={focused} />
          ),
          tabBarLabel: t('tabs.settingsLabel'),
        }}
      />
    </Tabs>
  );
}
