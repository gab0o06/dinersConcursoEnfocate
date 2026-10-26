import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EcoHeader from "../../../components/EcoHeader";
import { ECOCLUB } from "../../../config/ecoclub.config";
import { useEcoStore } from "../../../store/useEcoStore";

export default function MetroDinersScreen() {
  const router = useRouter();
  const [autoRecharge, setAutoRecharge] = useState(true);

  // — Store: transacciones del Metro (MCC 4111) —
  const scoredTransactions = useEcoStore((s) => s.scoredTransactions);

  const metroTransactions = scoredTransactions
    .filter((tx) => tx.category === "metro")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalMetroPoints = metroTransactions.reduce(
    (acc, tx) => acc + tx.ecoPoints,
    0,
  );

  // Nivel basado en cantidad de recargas
  const rechargeCount = metroTransactions.length;
  const maxRecargasBonificadas = ECOCLUB.retos.metroMaxRecargasMes;
  const recargasBonificadas = Math.min(rechargeCount, maxRecargasBonificadas);
  const bonusMetroPts = recargasBonificadas * ECOCLUB.retos.metroPtsPorRecarga;

  const getLevel = () => {
    if (rechargeCount >= 15) return { name: "Guardián", next: null, progress: 1 };
    if (rechargeCount >= 10) return { name: "Explorador", next: "Guardián", progress: rechargeCount / 15 };
    return { name: "Pasajero", next: "Explorador", progress: rechargeCount / 10 };
  };
  const level = getLevel();

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <SafeAreaView style={styles.container}>
      <EcoHeader
        BellIcon={
          <Ionicons name="notifications-outline" size={24} color="#0A1C40" />
        }
        UserIcon={<Ionicons name="person-outline" size={24} color="#0A1C40" />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Cabecera y Puntos */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.title}>Metro Diners</Text>
          </TouchableOpacity>

          <View style={styles.pointsEarned}>
            <MaterialCommunityIcons
              name="leaf"
              size={20}
              color="#111"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <View>
              <Text style={styles.pointsValue}>
                {totalMetroPoints}{" "}
                <Text style={{ fontWeight: "400", fontSize: 12 }}>EcoPoints</Text>
              </Text>
              <Text style={styles.pointsLabel}>ganados</Text>
            </View>
          </View>
        </View>

        {/* Sección de la Tarjeta */}
        <View style={styles.cardSection}>
          <View style={styles.cardVisual}>
            <View style={styles.cardVisualHeader}>
              <View style={styles.metroBadge}>
                <Ionicons name="train" size={20} color="#FFFFFF" />
                <Text style={styles.metroBadgeText}>Metro de Quito</Text>
              </View>
              <Text style={styles.dinersLogoMini}>Diners Club</Text>
            </View>
            <View style={styles.cardVisualMiddle}>
              <Text style={styles.cardChipText}>•••• 8820</Text>
              <Text style={styles.cardVisualSubtitle}>Tarjeta Ciudad Integrada</Text>
            </View>
            <View style={styles.cardVisualFooter}>
              <Text style={styles.cardBalanceLabel}>Saldo recargado</Text>
              <Text style={styles.cardBalanceValue}>$4.50</Text>
            </View>
          </View>

          <View style={styles.cardInfoRow}>
            <Text style={styles.cardTitle}>Tarjeta Ciudad</Text>
            <Text style={styles.cardBalance}>Saldo Actual: $4.50</Text>
          </View>

          {/* Sugerencia contextual — Escenario B */}
          {!autoRecharge && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={16} color="#92400E" />
              <Text style={styles.warningText}>
                Tu próxima recarga en efectivo{" "}
                <Text style={{ fontWeight: "800" }}>no suma EcoPoints</Text>.
                Activa la recarga automática.
              </Text>
            </View>
          )}

          <View style={styles.autoRechargeRow}>
            <Text style={styles.autoRechargeText}>Recarga Automática:</Text>
            <Switch
              value={autoRecharge}
              onValueChange={setAutoRecharge}
              trackColor={{ false: "#D3D3D3", true: "#277855" }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* Sección de Nivel y Progreso */}
        <View style={styles.levelSection}>
          <Text style={styles.levelText}>
            <Text style={{ fontWeight: "800" }}>Nivel:</Text> {level.name}
          </Text>
          <Text style={styles.rechargesText}>
            Recargas este mes: {rechargeCount}{level.next ? `/${level.name === "Pasajero" ? 10 : 15}` : " (máximo)"}
          </Text>

          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${level.progress * 100}%` }]}
            />
          </View>

          {/* Bonus recargas con tope mensual */}
          <View style={styles.bonusBanner}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={16} color="#277855" />
            <Text style={styles.bonusBannerText}>
              Bonus recargas: {recargasBonificadas}/{maxRecargasBonificadas} al mes (+{bonusMetroPts} pts ganados)
            </Text>
          </View>

          {level.next && (
            <Text style={styles.unlockText}>
              Desbloquear siguiente nivel: {level.next}
            </Text>
          )}
        </View>

        {/* Historial de Recargas — datos reales del store */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Historial de Recargas</Text>

          <View style={styles.historyList}>
            {metroTransactions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No hay recargas con Diners este mes.{"\n"}
                  Activa la recarga automática para ganar EcoPoints 🚇
                </Text>
              </View>
            ) : (
              metroTransactions.map((tx, index) => (
                <View key={tx.transactionId ?? index} style={styles.historyCard}>
                  <View style={styles.historyTimeCol}>
                    <Text style={styles.historyTime}>{formatTime(tx.date)}</Text>
                    <Text style={styles.historyDate}>{formatDate(tx.date)}</Text>
                  </View>
                  <Text style={styles.historyAction}>{tx.label}</Text>
                  <Ionicons name="train" size={20} color="#111" />
                  <Text style={styles.historyPoints}>+{tx.ecoPoints} pts</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Espaciador inferior para el Tab Bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { paddingBottom: 20 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800", color: "#000", marginLeft: 4 },
  pointsEarned: { flexDirection: "row", alignItems: "center", gap: 6 },
  pointsValue: { fontSize: 14, fontWeight: "800", color: "#000" },
  pointsLabel: { fontSize: 12, color: "#333", textAlign: "right", marginTop: -4 },

  cardSection: { marginHorizontal: 20 },
  cardVisual: {
    width: "100%",
    height: 190,
    borderRadius: 18,
    backgroundColor: "#0A3A60",
    padding: 20,
    justifyContent: "space-between",
    marginBottom: 15,
    shadowColor: "#0A1C40",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardVisualHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metroBadgeText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  dinersLogoMini: { fontSize: 12, fontWeight: "bold", color: "#A2C7B4", letterSpacing: 1 },
  cardVisualMiddle: { marginVertical: 10 },
  cardChipText: { fontSize: 18, color: "#FFFFFF", letterSpacing: 4, fontWeight: "600" },
  cardVisualSubtitle: { fontSize: 11, color: "#CCE0F5", marginTop: 4 },
  cardVisualFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardBalanceLabel: { fontSize: 11, color: "#CCE0F5" },
  cardBalanceValue: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#000" },
  cardBalance: { fontSize: 14, color: "#333" },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: { fontSize: 13, color: "#92400E", flex: 1, lineHeight: 18 },
  autoRechargeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  autoRechargeText: { fontSize: 14, color: "#333", fontWeight: "500" },

  levelSection: { marginHorizontal: 20, marginTop: 25 },
  levelText: { fontSize: 14, color: "#000", marginBottom: 4 },
  rechargesText: { fontSize: 14, color: "#000", textAlign: "right", marginBottom: 8 },
  progressBarBackground: {
    width: "100%",
    height: 18,
    backgroundColor: "#A2C7B4",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: { height: "100%", backgroundColor: "#277855", borderRadius: 10 },
  bonusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F3ED",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  bonusBannerText: { fontSize: 12, fontWeight: "600", color: "#277855" },
  unlockText: { fontSize: 10, color: "#555" },

  historySection: { marginHorizontal: 20, marginTop: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "400", color: "#000", marginBottom: 15 },
  historyList: { gap: 12 },
  emptyCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  emptyText: { fontSize: 13, color: "#666", textAlign: "center", lineHeight: 20 },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  historyTimeCol: { width: 70 },
  historyTime: { fontSize: 12, fontWeight: "800", color: "#000" },
  historyDate: { fontSize: 10, color: "#555" },
  historyAction: { flex: 1, fontSize: 14, color: "#333", paddingHorizontal: 10 },
  historyPoints: {
    fontSize: 14,
    fontWeight: "800",
    color: "#277855",
    minWidth: 70,
    textAlign: "right",
  },
});
