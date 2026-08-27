import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../../constants/theme";

export default function EcoClubScreen() {
  return (
    <View style={styles.container}>
      <Text>EcoClub (Home)</Text>
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
