import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/ecoColors';

type Props = {
  label: string; // ej. "plantar 2 árboles"
  TreeIcon?: React.ReactNode;
};

export default function EquivalenceCard({ label, TreeIcon }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Equivalencia</Text>
      <View style={styles.pill}>
        <View style={styles.iconCircle}>{TreeIcon}</View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.black, marginBottom: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayLight,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.gray, alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 15, fontWeight: '600', color: colors.black },
});