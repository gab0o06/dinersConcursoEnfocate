import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>blu</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={COLORS.dinersBlue}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="person-outline"
                size={24}
                color={COLORS.dinersBlue}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección: Tus productos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus productos</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>+ Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productCard}>
          <View style={styles.productCardTop}>
            {/* Simulación de la miniatura de la tarjeta */}
            <View style={styles.miniCardImage}>
              <Text style={styles.miniCardLogo}>Diners</Text>
            </View>
            <View>
              <Text style={styles.productName}>DINERS CLUB MILES</Text>
              <Text style={styles.productNumber}>**** 2560</Text>
            </View>
          </View>

          <View style={styles.productCardBottom}>
            <Text style={styles.productDate}>
              Saldo a pagar hasta 01/jul/2026
            </Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceAmount}>$190.89</Text>
              <TouchableOpacity>
                <Ionicons
                  name="eye-outline"
                  size={20}
                  color={COLORS.dinersBlue}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sección: Atajos principales */}
        <Text style={styles.sectionTitleOnly}>Atajos principales</Text>
        <View style={styles.shortcutsContainer}>
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
          <View style={styles.shortcutItem}>
            <View style={styles.shortcutIconCircle}>
              <Ionicons
                name="card-outline"
                size={24}
                color={COLORS.dinersBlue}
              />
            </View>
            <Text style={styles.shortcutLabel}>Datos de{"\n"}tarjeta</Text>
          </View>
          <View style={styles.shortcutItem}>
            <View style={styles.shortcutIconCircle}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={COLORS.dinersBlue}
              />
            </View>
            <Text style={styles.shortcutLabel}>Estado de{"\n"}cuenta</Text>
          </View>
          <View style={styles.shortcutItem}>
            <View style={styles.shortcutIconCircle}>
              <Text style={styles.deunaText}>d!</Text>
            </View>
            <Text style={styles.shortcutLabel}>Pagar con{"\n"}Deuna</Text>
          </View>
        </View>

        {/* Sección: Tus logros de la semana (ReciVeci por defecto) */}
        <Text style={styles.sectionTitleOnly}>Tus logros de la semana</Text>
        <View style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <View style={styles.achievementTitleContainer}>
              <MaterialCommunityIcons
                name="recycle"
                size={20}
                color={COLORS.textPrimary}
              />
              <Text style={styles.achievementTitle}>ReciVeci</Text>
            </View>
            <Text style={styles.achievementPercentage}>46%</Text>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>23/50 kg</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: "46%" }]} />
            </View>
          </View>

          <Text style={styles.ecoPointsText}>130 EcoPoints</Text>

          {/* Paginación */}
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Sección: Tus accesos directos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus accesos directos</Text>
          <TouchableOpacity>
            <Text style={[styles.linkText, { color: COLORS.dinersBlue }]}>
              Editar
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.shortcutSectionSubtitle}>Cupo de tus tarjetas</Text>

        {/* Espaciador para que el TabBar flotante no tape el contenido */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Espacio vital para el TabBar flotante
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.dinersBlue,
    letterSpacing: -1,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  sectionTitleOnly: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF", // Azul tipo enlace
  },
  productCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Sombra sutil
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  miniCardImage: {
    width: 40,
    height: 28,
    backgroundColor: COLORS.dinersBlue,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  miniCardLogo: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  productNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  productCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  productDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.dinersBlue,
    marginRight: 8,
  },
  eyeIcon: {
    paddingBottom: 4,
  },
  shortcutsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  shortcutItem: {
    alignItems: "center",
    width: "22%",
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
  },
  deunaText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8A2BE2",
    fontStyle: "italic",
  },
  shortcutLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 16,
  },
  achievementCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1.5,
    borderColor: "#E8F5E9", // Borde verde muy claro
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  achievementPercentage: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 12,
    width: 60,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4A9F76", // Verde progreso
    borderRadius: 4,
  },
  ecoPointsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dinersBlue,
    textAlign: "center",
    marginBottom: 16,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D1D1",
  },
  dotActive: {
    backgroundColor: "#4A9F76",
    width: 16, // Punto activo más ancho
  },
  shortcutSectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  bottomSpacer: {
    height: 40,
  },
});
