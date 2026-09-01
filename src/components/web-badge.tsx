import { Image } from "expo-image";
import { StyleSheet, useColorScheme } from "react-native";

import { ThemedView } from "./themed-view";

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <Image
        source={
          scheme === "dark"
            ? require("@/assets/images/expo-badge-white.png")
            : require("@/assets/images/expo-badge.png")
        }
        style={styles.badgeImage}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  versionText: {
    textAlign: "center",
  },
  badgeImage: {
    width: 123,
    aspectRatio: 123 / 24,
  },
});
