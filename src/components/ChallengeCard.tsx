import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/ecoColors';

type Props = {
  icon?: React.ReactNode;
  headerLabel: string;      // "Metro Diners"
  title: string;             // "Recarga Tarjeta ciudad"
  description: string;       // "Cashback Automático"
  buttonLabel: string;       // "ACTIVO" | "ACTIVAR"
  active: boolean;
  variant?: 'green' | 'gray';
  onPress?: () => void;
};

export default function ChallengeCard({
  icon, headerLabel, title, description, buttonLabel, active, variant = 'green', onPress,
}: Props) {
  const headerColor = variant === 'green' ? colors.green : colors.gray;

  return (
    <View style={styles.card}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        {icon}
        <Text style={styles.headerLabel}>{headerLabel}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: active ? colors.navy : colors.green }]}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  header: { alignItems: 'center', paddingVertical: 14, gap: 6 },
  headerLabel: { color: colors.white, fontWeight: '700', fontSize: 12, textAlign: 'center' },
  body: { padding: 10, alignItems: 'center', gap: 6 },
  title: { fontSize: 13, fontWeight: '700', textAlign: 'center', color: colors.black },
  description: { fontSize: 11, color: colors.gray, textAlign: 'center' },
  button: { marginTop: 6, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 11 },
});