import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/ecoColors";

type Props = {
  HomeIcon?: React.ReactNode;
  WalletIcon?: React.ReactNode;
  LeafIcon?: React.ReactNode;
  GridIcon?: React.ReactNode;
  ProfileIcon?: React.ReactNode;
  activeIndex?: number;
  onPressItem?: (index: number) => void;
};

export default function BottomNav({
  HomeIcon,
  WalletIcon,
  LeafIcon,
  GridIcon,
  ProfileIcon,
  activeIndex = 2,
  onPressItem,
}: Props) {
  const items = [HomeIcon, WalletIcon, LeafIcon, GridIcon];

  return (
    <View style={styles.container}>
      <View style={styles.barGroup}>
        {items.map((icon, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onPressItem?.(i)}
            style={[styles.item, i === activeIndex && styles.itemActive]}
          >
            {icon}
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => onPressItem?.(4)}
        style={styles.profileCircle}
      >
        {ProfileIcon}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  barGroup: {
    flexDirection: "row",
    backgroundColor: "#F6E9E9",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 22,
    alignItems: "center",
  },
  item: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  itemActive: { backgroundColor: colors.green, borderRadius: 16 },
  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
