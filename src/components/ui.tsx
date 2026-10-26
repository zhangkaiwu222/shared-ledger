import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors } from '../constants/theme';

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'secondary' && styles.btnSecondary,
        variant === 'ghost' && styles.btnGhost,
        variant === 'accent' && styles.btnAccent,
        (pressed || disabled) && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          styles.btnText,
          (variant === 'secondary' || variant === 'ghost') && styles.btnTextDark,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

export function Chip({
  label,
  selected,
  color,
  onPress,
}: {
  label: string;
  selected?: boolean;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && {
          backgroundColor: color ?? colors.brand,
          borderColor: color ?? colors.brand,
        },
      ]}
    >
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: colors.brand },
  btnSecondary: {
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnGhost: { backgroundColor: 'transparent' },
  btnAccent: { backgroundColor: colors.accent },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextDark: { color: colors.ink },
  field: { gap: 8 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  chipText: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: 14,
  },
});
