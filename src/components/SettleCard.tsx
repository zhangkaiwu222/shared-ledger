import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { formatYuan } from '../lib/split';

type Props = {
  ledgerName: string;
  fromName: string;
  toName: string;
  amount: number;
  watermark?: boolean;
};

export const SettleCard = forwardRef<View, Props>(function SettleCard(
  { ledgerName, fromName, toName, amount, watermark },
  ref,
) {
  return (
    <View ref={ref} style={styles.card} collapsable={false}>
      <Text style={styles.brand}>一起算</Text>
      <Text style={styles.ledger}>{ledgerName}</Text>
      <Text style={styles.hint}>该转账啦</Text>
      <Text style={styles.amount}>{formatYuan(amount)}</Text>
      <View style={styles.row}>
        <View style={styles.person}>
          <Text style={styles.role}>付款</Text>
          <Text style={styles.name}>{fromName}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.person}>
          <Text style={styles.role}>收款</Text>
          <Text style={styles.name}>{toName}</Text>
        </View>
      </View>
      {watermark ? <Text style={styles.wm}>免费版 · 一起算 Pro 可去水印</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: colors.brand,
    borderRadius: 24,
    padding: 24,
    gap: 8,
  },
  brand: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ledger: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  amount: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  row: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  person: { flex: 1 },
  role: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  arrow: {
    color: '#fff',
    fontSize: 22,
    marginHorizontal: 8,
  },
  wm: {
    marginTop: 18,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
  },
});
