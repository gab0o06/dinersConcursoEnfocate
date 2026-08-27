import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/ecoColors';

type Props = {
  BellIcon?: React.ReactNode;
  UserIcon?: React.ReactNode;
  onPressBell?: () => void;
  onPressUser?: () => void;
};

export default function EcoHeader({ BellIcon, UserIcon, onPressBell, onPressUser }: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.logoEco}>Eco</Text>
        <Text style={styles.logoClub}>Club</Text>
        <Text style={styles.logoBy}>by blu</Text>
      </View>
      <View style={styles.icons}>
        <TouchableOpacity onPress={onPressBell} style={styles.iconBtn}>
          {BellIcon}
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressUser} style={styles.iconBtn}>
          {UserIcon}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 2,
    borderBottomColor: colors.green,
  },
  logoEco: { fontSize: 20, fontWeight: '800', color: colors.green, lineHeight: 22 },
  logoClub: { fontSize: 20, fontWeight: '800', color: colors.black, lineHeight: 22 },
  logoBy: { fontSize: 10, color: colors.gray, marginTop: 2 },
  icons: { flexDirection: 'row', gap: 16, marginTop: 6 },
  iconBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});