import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/constants/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 12, fontWeight: focused ? '800' : '600', color: focused ? colors.brand : colors.muted }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
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
          title: '账本',
          tabBarIcon: ({ focused }) => <TabIcon label="账" focused={focused} />,
          tabBarLabel: '明细',
        }}
      />
      <Tabs.Screen
        name="balances"
        options={{
          title: '谁欠谁',
          tabBarIcon: ({ focused }) => <TabIcon label="清" focused={focused} />,
          tabBarLabel: '清算',
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: '本月报表',
          tabBarIcon: ({ focused }) => <TabIcon label="报" focused={focused} />,
          tabBarLabel: '报表',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ focused }) => <TabIcon label="设" focused={focused} />,
          tabBarLabel: '设置',
        }}
      />
    </Tabs>
  );
}
