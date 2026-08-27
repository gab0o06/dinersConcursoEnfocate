import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text>Wallet (Home)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
