import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, this would trigger FaceID/Biometrics auth
    // For this mockup, we just navigate to the main tabs
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Image Container */}
      <View style={styles.imageContainer}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop",
          }} // Placeholder for the actual background image
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Overlay to ensure text readability if needed (optional) */}
          <View style={styles.overlay} />

          {/* Top Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/dinerslogo.svg")}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>
        </ImageBackground>
      </View>

      {/* Bottom Login Card */}
      <View style={styles.bottomCard}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hola Diners,</Text>
          <TouchableOpacity>
            <Text style={styles.switchAccountText}>
              Ingresa con otra cuenta
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.shortcutsTitle}>Mis atajos principales</Text>

        <View style={styles.shortcutsContainer}>
          {/* Shortcut 1 */}
          <View style={styles.shortcutItem}>
            <View style={styles.shortcutIconCircle}>
              <Ionicons
                name="swap-horizontal"
                size={24}
                color={COLORS.dinersBlue}
              />
            </View>
            <Text style={styles.shortcutLabel}>Pagar con{"\n"}transfer</Text>
          </View>

          {/* Shortcut 2 */}
          <View style={styles.shortcutItem}>
            <View style={styles.shortcutIconCircle}>
              {/* Using card outline as approximation for the specific icon */}
              <Ionicons
                name="card-outline"
                size={24}
                color={COLORS.dinersBlue}
              />
            </View>
            <Text style={styles.shortcutLabel}>Datos de{"\n"}tarjeta</Text>
          </View>

          {/* Shortcut 3 */}
          <View style={styles.shortcutItem}>
            <View style={styles.shortcutIconCircle}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={COLORS.dinersBlue}
              />
            </View>
            <Text style={styles.shortcutLabel}>Retirar sin{"\n"}tarjeta</Text>
          </View>

          {/* Shortcut 4 */}
          <View style={styles.shortcutItem}>
            <View style={styles.shortcutIconCircle}>
              <Text style={styles.deunaText}>d!</Text>
            </View>
            <Text style={styles.shortcutLabel}>Pagar con{"\n"}Deuna</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Ionicons
            name="scan-outline"
            size={20}
            color={COLORS.background}
            style={styles.loginButtonIcon}
          />
          <Text style={styles.loginButtonText}>Ingresar con FaceID</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dinersBlue, // Fallback background
  },
  imageContainer: {
    flex: 1,
    width: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: height * 0.65, // Takes up about 65% of the screen height
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 60, // Space for status bar
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.1)", // Very light overlay to help logo stand out
  },

  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  logoInnerLine: {
    width: 8,
    height: 30,
    backgroundColor: COLORS.dinersBlue,
    borderRadius: 4,
  },
  bottomCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    marginTop: -30, // Overlaps the image slightly
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  greetingContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dinersBlue,
    marginBottom: 4,
  },
  switchAccountText: {
    fontSize: 14,
    color: COLORS.dinersBlueLight,
    textDecorationLine: "underline",
  },
  shortcutsTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  shortcutsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  shortcutItem: {
    alignItems: "center",
    width: (width - 48) / 4, // Divide available width evenly
  },
  shortcutIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deunaText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8A2BE2", // Purple color for the d! logo
    fontStyle: "italic",
  },
  shortcutLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 16,
  },
  loginButton: {
    backgroundColor: COLORS.dinersBlue,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loginButtonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
  logoContainer: {
    marginTop: 20,
    zIndex: 10,
    alignItems: "center", // Centra el logo horizontalmente
  },
  logoImage: {
    width: 60, // Ajusta el tamaño según necesites
    height: 60,
  },
});
