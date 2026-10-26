import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../constants/theme";
import {
  getValidPoints,
  MIN_REDEEM_POINTS,
  POINTS_TO_DOLLARS_RATE,
} from "../../../services/ecoPointsEngine";
import { useEcoStore } from "../../../store/useEcoStore";

// ---------------------------------------------------------------------------
// Tipos adicionales de opciones extendidas
// ---------------------------------------------------------------------------

interface ExtendedRedeemOption {
  id: string;
  label: string;
  pointsCost: number;
  benefit: string;
  dollarValue: number;
  available: boolean;
  reason?: string;
  icon: keyof typeof Ionicons.glyphMap;
  levelRequired: string;
  levelColor: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildExtendedOptions(
  redeemOptions: ReturnType<typeof useEcoStore.getState>["redeemOptions"],
  validPoints: number,
  redeemCap: number,
  totalHistoricalCommission: number,
): ExtendedRedeemOption[] {
  // Opción base del motor (basico, verde, guardian)
  const engineMap = Object.fromEntries(redeemOptions.map((o) => [o.id, o]));

  // 1. Eco-Cashback (Nivel Activado+) — viene del engine como "basico"
  const basico = engineMap["basico"];

  // 2. Cuota Cero (Nivel Verde+) — viene del engine como "verde"
  const verde = engineMap["verde"];

  // 3. 1 Milla Diners (Nivel Guardián) — viene del engine como "guardian"
  const guardian = engineMap["guardian"];

  // 4. Bono Predial (Nivel Activado+): solo si comisión histórica >= $100, hasta $50
  const bonoPredialCost = 10000; // 10 000 pts = $50
  const bonoPredialAvailable =
    validPoints >= MIN_REDEEM_POINTS &&
    totalHistoricalCommission >= 100 &&
    redeemCap >= 50;
  const bonoPredialReason = !bonoPredialAvailable
    ? totalHistoricalCommission < 100
      ? `Necesitas $${(100 - totalHistoricalCommission).toFixed(2)} más en comisiones históricas`
      : validPoints < bonoPredialCost
        ? `Te faltan ${bonoPredialCost - validPoints} pts`
        : "Tu comisión mensual no respalda este canje"
    : undefined;

  // 5. Eco-Aliado QR (Nivel Activado+): pago con descuento en comercios aliados
  const ecoAliado = engineMap["basico"]; // misma lógica que basico (mínimo 200 pts)
  const ecoAliadoAvailable = validPoints >= MIN_REDEEM_POINTS && redeemCap >= basico?.dollarValue;

  return [
    {
      id: "basico",
      label: "Eco-Cashback",
      pointsCost: basico?.pointsCost ?? MIN_REDEEM_POINTS,
      benefit: basico?.benefit ?? `$${(MIN_REDEEM_POINTS * POINTS_TO_DOLLARS_RATE).toFixed(2)} de descuento en factura`,
      dollarValue: basico?.dollarValue ?? MIN_REDEEM_POINTS * POINTS_TO_DOLLARS_RATE,
      available: basico?.available ?? false,
      reason: basico?.reason,
      icon: "receipt-outline",
      levelRequired: "Nivel Activado+",
      levelColor: "#277855",
    },
    {
      id: "verde",
      label: "Cuota Cero",
      pointsCost: verde?.pointsCost ?? 2000,
      benefit: verde?.benefit ?? "Cuota de manejo mensual cubierta ($8)",
      dollarValue: verde?.dollarValue ?? 10,
      available: verde?.available ?? false,
      reason: verde?.reason,
      icon: "card-outline",
      levelRequired: "Nivel Verde+",
      levelColor: "#1E754C",
    },
    {
      id: "guardian",
      label: "1 Milla Diners",
      pointsCost: guardian?.pointsCost ?? 300,
      benefit: guardian?.benefit ?? "1 milla del programa premium Diners",
      dollarValue: 0,
      available: guardian?.available ?? false,
      reason: guardian?.reason,
      icon: "airplane-outline",
      levelRequired: "Nivel Guardián",
      levelColor: "#0A1C40",
    },
    {
      id: "bono-predial",
      label: "Bono Predial",
      pointsCost: bonoPredialCost,
      benefit: "Hasta $50 de descuento en impuesto predial",
      dollarValue: 50,
      available: bonoPredialAvailable,
      reason: bonoPredialReason,
      icon: "home-outline",
      levelRequired: "Nivel Activado+",
      levelColor: "#277855",
    },
    {
      id: "eco-aliado",
      label: "Eco-Aliado QR",
      pointsCost: MIN_REDEEM_POINTS,
      benefit: "Descuento inmediato en comercios aliados vía QR",
      dollarValue: ecoAliado?.dollarValue ?? MIN_REDEEM_POINTS * POINTS_TO_DOLLARS_RATE,
      available: ecoAliadoAvailable,
      reason: ecoAliadoAvailable ? undefined : basico?.reason,
      icon: "qr-code-outline",
      levelRequired: "Nivel Activado+",
      levelColor: "#277855",
    },
  ];
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function RecompensasScreen() {
  const router = useRouter();

  // Store
  const redeemOptions = useEcoStore((s) => s.redeemOptions);
  const pointsBatches = useEcoStore((s) => s.pointsBatches);
  const financials = useEcoStore((s) => s.financials);
  const redeemPoints = useEcoStore((s) => s.redeemPoints);

  const validPoints = getValidPoints(pointsBatches);
  const redeemCap = financials?.redeemCap ?? 0;
  const redeemCapInPoints = Math.floor(redeemCap / POINTS_TO_DOLLARS_RATE);
  const availableToRedeem = Math.min(validPoints, redeemCapInPoints);

  // Comisión histórica simulada (suma de totalCommission de este mes, en prod sería acumulada)
  const historicalCommission = (financials?.totalCommission ?? 0) * 12; // estimación anual

  const extendedOptions = buildExtendedOptions(
    redeemOptions,
    validPoints,
    redeemCap,
    historicalCommission,
  );

  // Estado de confirmación
  const [confirmOption, setConfirmOption] = useState<ExtendedRedeemOption | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRedeem = (option: ExtendedRedeemOption) => {
    if (!option.available) return;
    setConfirmOption(option);
  };

  const confirmRedeem = () => {
    if (!confirmOption) return;

    // Solo las opciones del engine se delegan al store; las extras muestran modal simulado
    const engineIds = ["basico", "verde", "guardian"] as const;
    const isEngine = engineIds.includes(confirmOption.id as typeof engineIds[number]);

    if (isEngine) {
      const ok = redeemPoints(confirmOption.id as "basico" | "verde" | "guardian");
      setConfirmOption(null);
      if (ok) {
        setSuccessMessage(
          `✅ ¡Canje exitoso! ${confirmOption.label} aplicado.\n${confirmOption.dollarValue > 0 ? `Ahorraste $${confirmOption.dollarValue.toFixed(2)}` : "Tu milla ha sido acreditada."}`,
        );
      } else {
        Alert.alert("Error", "No se pudo completar el canje. Verifica tus puntos disponibles.");
      }
    } else {
      // Mock para opciones extendidas
      setConfirmOption(null);
      setSuccessMessage(`✅ ¡Canje de ${confirmOption.label} simulado correctamente!`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dinersBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recompensas</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Card resumen de saldo ── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Saldo Total</Text>
              <Text style={styles.summaryValue}>{validPoints.toLocaleString()}</Text>
              <Text style={styles.summaryUnit}>EcoPoints</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Disponible para canjear</Text>
              <Text style={[styles.summaryValue, { color: "#277855" }]}>
                {availableToRedeem.toLocaleString()}
              </Text>
              <Text style={styles.summaryUnit}>EcoPoints</Text>
            </View>
          </View>

          <View style={styles.capRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#277855" />
            <Text style={styles.capText}>
              Tope mensual: ${redeemCap.toFixed(2)} (40% de tu comisión)
            </Text>
          </View>

          {validPoints < MIN_REDEEM_POINTS && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={14} color="#D32F2F" />
              <Text style={styles.warningText}>
                Te faltan {MIN_REDEEM_POINTS - validPoints} pts para el mínimo de canje (200 pts)
              </Text>
            </View>
          )}
        </View>

        {/* ── Catálogo de canjes ── */}
        <Text style={styles.sectionTitle}>Catálogo de Canjes</Text>

        {extendedOptions.map((option) => (
          <RedeemCard
            key={option.id}
            option={option}
            onRedeem={handleRedeem}
          />
        ))}

        <Text style={styles.footerNote}>
          * Los puntos se consumen en orden FIFO (los más antiguos primero).{"\n"}
          * Los EcoPoints expiran a los 90 días de ser emitidos.
        </Text>
      </ScrollView>

      {/* ── Modal de confirmación ── */}
      <Modal
        visible={!!confirmOption}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmOption(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="leaf" size={36} color="#277855" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>¿Confirmar canje?</Text>
            <Text style={styles.modalOptionName}>{confirmOption?.label}</Text>
            <Text style={styles.modalBody}>
              Se descontarán{" "}
              <Text style={{ fontWeight: "800" }}>
                {confirmOption?.pointsCost.toLocaleString()} EcoPoints
              </Text>{" "}
              de tu saldo.
            </Text>
            {(confirmOption?.dollarValue ?? 0) > 0 && (
              <Text style={styles.modalBenefit}>
                Valor: ${confirmOption?.dollarValue.toFixed(2)}
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setConfirmOption(null)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmRedeem}>
                <Text style={styles.modalConfirmText}>Canjear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal de éxito ── */}
      <Modal
        visible={!!successMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={48} color="#277855" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>¡Listo!</Text>
            <Text style={styles.modalBody}>{successMessage}</Text>
            <TouchableOpacity
              style={[styles.modalConfirm, { width: "100%", marginTop: 16 }]}
              onPress={() => setSuccessMessage(null)}
            >
              <Text style={styles.modalConfirmText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-componente: tarjeta de canje
// ---------------------------------------------------------------------------

function RedeemCard({
  option,
  onRedeem,
}: {
  option: ExtendedRedeemOption;
  onRedeem: (o: ExtendedRedeemOption) => void;
}) {
  const isLocked = !option.available;

  return (
    <View style={[styles.redeemCard, isLocked && styles.redeemCardLocked]}>
      {/* Icono */}
      <View
        style={[
          styles.redeemIcon,
          { backgroundColor: isLocked ? "#EAEAEA" : option.levelColor + "22" },
        ]}
      >
        <Ionicons
          name={option.icon}
          size={26}
          color={isLocked ? "#AAAAAA" : option.levelColor}
        />
      </View>

      {/* Contenido */}
      <View style={styles.redeemContent}>
        <View style={styles.redeemTopRow}>
          <Text style={[styles.redeemLabel, isLocked && styles.textMuted]}>
            {option.label}
          </Text>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: isLocked ? "#EAEAEA" : option.levelColor + "22" },
            ]}
          >
            <Text
              style={[
                styles.levelBadgeText,
                { color: isLocked ? "#AAAAAA" : option.levelColor },
              ]}
            >
              {option.levelRequired}
            </Text>
          </View>
        </View>

        <Text style={[styles.redeemBenefit, isLocked && styles.textMuted]}>
          {option.benefit}
        </Text>

        <View style={styles.redeemBottomRow}>
          <View style={styles.redeemCostRow}>
            <Ionicons
              name="leaf"
              size={13}
              color={isLocked ? "#AAAAAA" : "#277855"}
            />
            <Text
              style={[
                styles.redeemCost,
                isLocked ? styles.textMuted : { color: "#277855" },
              ]}
            >
              {option.pointsCost.toLocaleString()} pts
            </Text>
            {option.dollarValue > 0 && (
              <Text style={[styles.redeemDollar, isLocked && styles.textMuted]}>
                {" "}→ ${option.dollarValue.toFixed(2)}
              </Text>
            )}
          </View>

          {isLocked ? (
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={12} color="#999" />
              <Text style={styles.lockedText}>Bloqueado</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.redeemBtn}
              onPress={() => onRedeem(option)}
            >
              <Text style={styles.redeemBtnText}>Canjear</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLocked && option.reason && (
          <Text style={styles.lockedReason}>{option.reason}</Text>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.dinersBlue,
  },

  scroll: { padding: 16, paddingBottom: 40 },

  // Summary card
  summaryCard: {
    backgroundColor: COLORS.dinersBlue,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 14,
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  summaryUnit: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 8,
  },
  capRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  capText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    flex: 1,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    color: "#D32F2F",
    flex: 1,
    fontWeight: "600",
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.dinersBlue,
    marginBottom: 12,
  },

  // Redeem cards
  redeemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  redeemCardLocked: {
    backgroundColor: "#F7F7F7",
    borderColor: "#EAEAEA",
    borderWidth: 1,
  },
  redeemIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  redeemContent: { flex: 1 },
  redeemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  redeemLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    flex: 1,
  },
  levelBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  redeemBenefit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  redeemBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  redeemCostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  redeemCost: {
    fontSize: 13,
    fontWeight: "700",
  },
  redeemDollar: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  redeemBtn: {
    backgroundColor: "#277855",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  redeemBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EAEAEA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 12,
    color: "#999999",
    fontWeight: "700",
  },
  lockedReason: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontStyle: "italic",
  },
  textMuted: {
    color: "#AAAAAA",
  },

  // Footer
  footerNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.dinersBlue,
    marginBottom: 6,
  },
  modalOptionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#277855",
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  modalBenefit: {
    fontSize: 16,
    fontWeight: "800",
    color: "#277855",
    marginTop: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#277855",
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
