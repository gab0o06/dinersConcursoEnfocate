import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/ecoColors";

type Props = {
  BellIcon?: React.ReactNode;
  UserIcon?: React.ReactNode;
  onPressBell?: () => void;
  onPressUser?: () => void;
};

export default function EcoHeader({
  BellIcon,
  UserIcon,
  onPressBell,
  onPressUser,
}: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("@/assets/images/LogoEcoClub.svg")}
          style={styles.logo}
          contentFit="contain"
        />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  logo: {
    width: 80,
    height: 50,
  },
  icons: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  iconBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
