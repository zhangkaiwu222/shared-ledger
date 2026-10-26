import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useApp } from '../src/context/AppContext';
import { colors } from '../src/constants/theme';

export default function Index() {
  const { ready, data } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  if (!data.onboardingDone || !data.ledger) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
