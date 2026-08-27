import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/ecoColors';
import EcoGauge from './EcoGauge';

type Props = {
  co2Value: number;
  co2Max: number;
  multiplierActive: boolean;
  billingCurrent: number;
  billingMin: number;
  FireIcon?: React.ReactNode;
};

export default function ValidationCard({
  co2Value,
  co2Max,
  multiplierActive,
  billingCurrent,
  billingMin,
  FireIcon,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Validación Ambiental</Text>
      <Text style={styles.subtitle}>Contaminación reducida este mes</Text>

      <View style={styles.gaugeWrap}>
        <EcoGauge value={co2Value} max={co2Max} />
      </View>

      <Text style={styles.footnote}>Cálculo basado en estándares IPCC</Text>

      <View style={styles.multiplierRow}>
        <Text style={styles.multiplierText}>
          Multiplicador {multiplierActive ? 'activado' : 'desactivado'}
        </Text>
        {FireIcon}
      </View>
      <Text style={styles.billingText}>
        Facturación este mes: ${billingCurrent} / ${billingMin} mínimo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.greenLight,
    padding: 16,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.black, alignSelf: 'flex-start' },
  subtitle: { fontSize: 12, color: colors.gray, alignSelf: 'flex-start', marginTop: 2, marginBottom: 8 },
  gaugeWrap: { marginVertical: 8 },
  footnote: { fontSize: 11, color: colors.gray, marginTop: 4 },
  multiplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  multiplierText: { fontSize: 13, fontWeight: '600', color: colors.black },
  billingText: { fontSize: 12, color: colors.gray, alignSelf: 'flex-start', marginTop: 4 },
});