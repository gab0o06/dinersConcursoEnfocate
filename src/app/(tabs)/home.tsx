import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/theme";
import { ECOCLUB } from "../../config/ecoclub.config";
import Capa0DescubiertoCard from "../../components/Capa0DescubiertoCard";
import ChallengesCarousel from "../../components/ChallengesCarousel";
import CarbonReductionCard from "../../components/CarbonReductionCard";
import { useTour } from "../../contexts/TourContext";
import { useTourHighlight } from "../../hooks/useTourHighlight";
import {
  selectAmountToMultiplier,
  selectMultiplierActive,
  selectValidPoints,
  useEcoStore,
} from "../../store/useEcoStore";

export default function HomeScreen() {
  const router            = useRouter();
  const validPoints       = useEcoStore(selectValidPoints);
  const multiplierActive  = useEcoStore(selectMultiplierActive);
  const amountLeft        = useEcoStore(selectAmountToMultiplier);
  const financials        = useEcoStore((s) => s.financials);
  const reciVeciKgTotal   = useEcoStore((s) => s.reciVeciKgTotal);
  const stravaKm          = useEcoStore((s) => s.strava.totalKm);
  const scoredTransactions = useEcoStore((s) => s.scoredTransactions);
  const totalCo2Saved     = useEcoStore((s) => s.totalCo2Saved);
  const isRegistered      = useEcoStore((s) => s.isRegistered);
  const registerEcoClub   = useEcoStore((s) => s.registerEcoClub);
  const setRegistered     = useEcoStore((s) => s.setRegistered);
  const { startTour }     = useTour();
  const weeklyAchievementTarget = useTourHighlight("home-weekly-achievement");

  const metroPoints = scoredTransactions
    .filter((tx) => tx.category === "metro")
    .reduce((acc, tx) => acc + tx.ecoPoints, 0);

  const META_RECI_KG   = ECOCLUB.retos.reciVeciMetaKg;
  const META_STRAVA_KM = ECOCLUB.retos.stravaMetaKm;
  const META_METRO_PTS = ECOCLUB.retos.metroMetaPts;

  // Fecha de corte calculada dinámicamente (primer día del mes siguiente)
  const fechaCorte = new Date();
  fechaCorte.setMonth(fechaCorte.getMonth() + 1);
  fechaCorte.setDate(1);
  const fechaCorteStr = fechaCorte.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });

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
            <TouchableOpacity
              style={styles.iconButton}
              onPress={startTour}
              accessibilityRole="button"
              accessibilityLabel="Iniciar tour guiado"
            >
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={COLORS.dinersBlue}
              />
            </TouchableOpacity>
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
              Saldo a pagar hasta {fechaCorteStr}
            </Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceAmount}>
                ${financials?.totalSpent.toFixed(2) ?? "0.00"}
              </Text>
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

        {/* Sección: Tus logros de la semana (target paso 1 del tour) */}
        <View {...weeklyAchievementTarget}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleOnly}>Tus logros de la semana</Text>
          <TouchableOpacity
            style={styles.demoBadge}
            onPress={() => setRegistered(!isRegistered)}
            activeOpacity={0.7}
          >
            <Text style={styles.demoBadgeText}>
              {isRegistered ? "Ver Capa 0" : "Ver Registrado"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Si el usuario está en Capa 0 (no registrado): Anzuelo de Adquisición */}
        {!isRegistered ? (
          <Capa0DescubiertoCard
            totalCo2Saved={totalCo2Saved}
            potentialEcoPoints={validPoints > 0 ? validPoints : 320}
            potentialDollars={
              validPoints > 0 ? validPoints * ECOCLUB.valorPuntoUSD : 3.2
            }
            onRegister={registerEcoClub}
            onToggleDemoMode={() => setRegistered(true)}
            isRegistered={false}
          />
        ) : (
            /* — Tarjeta EcoClub con datos reales — */
            <View style={styles.ecoCard}>
              {/* Fila 1: EcoPoints totales + multiplicador */}
              <View style={styles.ecoCardHeader}>
                <View style={styles.ecoCardTitleRow}>
                  <MaterialCommunityIcons name="leaf" size={18} color="#277855" />
                  <Text style={styles.ecoCardTitle}>EcoClub</Text>
                </View>
                {multiplierActive ? (
                  <View style={styles.multiplierBadge}>
                    <Ionicons name="flash" size={12} color="#FFF" />
                    <Text style={styles.multiplierBadgeText}>×2 activo</Text>
                  </View>
                ) : (
                  <Text style={styles.multiplierInactive}>
                    ${amountLeft.toFixed(0)} para ×2
                  </Text>
                )}
              </View>

              <Text style={styles.ecoPointsTotal}>{validPoints} EcoPoints</Text>
              <Text style={styles.ecoPointsDollarValue}>
                = ${(validPoints * ECOCLUB.valorPuntoUSD).toFixed(2)} disponibles para tu factura
              </Text>

              {/* Carrusel Deslizable Horizontal de Retos */}
              <ChallengesCarousel
                metroPoints={metroPoints}
                metaMetroPts={META_METRO_PTS}
                stravaKm={stravaKm}
                metaStravaKm={META_STRAVA_KM}
                reciVeciKg={reciVeciKgTotal}
                metaReciKg={META_RECI_KG}
                onPressMetro={() => router.push("/(tabs)/ecoclub/metro")}
                onPressStrava={() => router.push("/(tabs)/ecoclub/km-verdes")}
                onPressReciVeci={() => router.push("/(tabs)/ecoclub/reciveci")}
              />
            </View>
        )}
        </View>

        {/* Indicador de CO₂ evitado por MCC (reemplaza la campaña activa) */}
        {isRegistered && <CarbonReductionCard />}

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
    paddingBottom: 120,
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
  headerIcons: { flexDirection: "row", gap: 16 },
  iconButton: { padding: 4 },
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
    marginBottom: 0,
  },
  demoBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  demoBadgeText: {
    fontSize: 11,
    color: "#0B2046",
    fontWeight: "600",
  },
  linkText: { fontSize: 14, color: "#007AFF" },
  productCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  miniCardLogo: { color: "#FFF", fontSize: 8, fontWeight: "bold" },
  productName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  productNumber: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  productCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  productDate: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 4 },
  balanceContainer: { flexDirection: "row", alignItems: "center" },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.dinersBlue,
    marginRight: 8,
  },
  eyeIcon: { paddingBottom: 4 },
  shortcutsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  shortcutItem: { alignItems: "center", width: "22%" },
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
  deunaText: { fontSize: 22, fontWeight: "bold", color: "#8A2BE2", fontStyle: "italic" },
  shortcutLabel: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 16,
  },

  // — Tarjeta EcoClub integrada —
  ecoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1.5,
    borderColor: "#A2C7B4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ecoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ecoCardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ecoCardTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textPrimary },
  multiplierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#277855",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  multiplierBadgeText: { fontSize: 11, fontWeight: "800", color: "#FFF" },
  multiplierInactive: { fontSize: 12, color: COLORS.textSecondary },
  ecoPointsTotal: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.dinersBlue,
    marginBottom: 4,
  },
  ecoPointsDollarValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#277855",
    marginBottom: 16,
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  challengeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 46,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#277855",
    borderRadius: 4,
  },
  challengeStat: {
    fontSize: 11,
    color: COLORS.textSecondary,
    width: 60,
    textAlign: "right",
  },
  shortcutSectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  bottomSpacer: { height: 40 },
});
