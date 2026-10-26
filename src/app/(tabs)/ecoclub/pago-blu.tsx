import { Ionicons } from "@expo/vector-icons";
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
import { COLORS } from "../../../constants/theme";
import {
  getValidPoints,
  MIN_REDEEM_POINTS,
  POINTS_TO_DOLLARS_RATE,
} from "../../../services/ecoPointsEngine";
import { useEcoStore } from "../../../store/useEcoStore";

// ---------------------------------------------------------------------------
// Constantes mock
// ---------------------------------------------------------------------------

const MOCK_PURCHASE_AMOUNT = 45.0;
const MOCK_MERCHANT = "Supermaxi Las Orquídeas";
const MOCK_MERCHANT_CATEGORY = "Supermercado • Eco-Aliado";

// ---------------------------------------------------------------------------
// Pantalla principal
// ---------------------------------------------------------------------------

export default function PagoBluScreen() {
  const router = useRouter();

  // Store
  const pointsBatches = useEcoStore((s) => s.pointsBatches);
  const financials = useEcoStore((s) => s.financials);

  const validPoints = getValidPoints(pointsBatches);
  const redeemCap = financials?.redeemCap ?? 0;
  const redeemCapInPoints = Math.floor(redeemCap / POINTS_TO_DOLLARS_RATE);

  // Puntos realmente aplicables: mínimo 200, máximo min(validPoints, capInPoints)
  const maxApplicablePoints = Math.min(validPoints, redeemCapInPoints);
  const canApplyPoints = maxApplicablePoints >= MIN_REDEEM_POINTS;

  // Descuento máximo posible
  const maxDiscountPoints = Math.min(
    maxApplicablePoints,
    Math.floor(MOCK_PURCHASE_AMOUNT / POINTS_TO_DOLLARS_RATE), // no puede superar el monto de compra
  );
  const maxDiscount = parseFloat((maxDiscountPoints * POINTS_TO_DOLLARS_RATE).toFixed(2));

  // Estado local
  const [applyPoints, setApplyPoints] = useState(false);
  const [paid, setPaid] = useState(false);

  const discount = applyPoints && canApplyPoints ? maxDiscount : 0;
  const pointsUsed = applyPoints && canApplyPoints ? maxDiscountPoints : 0;
  const total = parseFloat((MOCK_PURCHASE_AMOUNT - discount).toFixed(2));

  const handlePay = () => {
    setPaid(true);
  };

  if (paid) {
    return <PaymentSuccess router={router} total={total} pointsUsed={pointsUsed} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dinersBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago BLU</Text>
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>Demo</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Comercio ── */}
        <View style={styles.merchantCard}>
          <View style={styles.merchantIconWrap}>
            <Ionicons name="storefront-outline" size={28} color={COLORS.dinersBlue} />
          </View>
          <View>
            <Text style={styles.merchantName}>{MOCK_MERCHANT}</Text>
            <Text style={styles.merchantCategory}>{MOCK_MERCHANT_CATEGORY}</Text>
          </View>
        </View>

        {/* ── Monto de compra ── */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Monto de compra</Text>
          <Text style={styles.amountValue}>${MOCK_PURCHASE_AMOUNT.toFixed(2)}</Text>
          <Text style={styles.amountNote}>Simulación — valor de ejemplo</Text>
        </View>

        {/* ── Toggle EcoPoints ── */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <Ionicons name="leaf" size={22} color="#277855" />
            <View style={styles.toggleTexts}>
              <Text style={styles.toggleTitle}>Aplicar EcoPoints</Text>
              <Text style={styles.toggleSub}>
                {canApplyPoints
                  ? `Tienes ${validPoints.toLocaleString()} pts disponibles`
                  : `Mínimo ${MIN_REDEEM_POINTS} pts para canjear (tienes ${validPoints})`}
              </Text>
            </View>
          </View>
          <Switch
            value={applyPoints}
            onValueChange={(v) => {
              if (!canApplyPoints && v) return;
              setApplyPoints(v);
            }}
            trackColor={{ false: "#EAEAEA", true: "#A2C7B4" }}
            thumbColor={applyPoints ? "#277855" : "#CCCCCC"}
            disabled={!canApplyPoints}
          />
        </View>

        {/* ── Desglose de descuento ── */}
        {applyPoints && canApplyPoints && (
          <View style={styles.discountCard}>
            <Text style={styles.discountTitle}>Desglose del descuento</Text>

            <View style={styles.discountRow}>
              <Text style={styles.discountKey}>Puntos a usar</Text>
              <View style={styles.discountRight}>
                <Ionicons name="leaf" size={13} color="#277855" />
                <Text style={[styles.discountValue, { color: "#277855" }]}>
                  {" "}{pointsUsed.toLocaleString()} pts
                </Text>
              </View>
            </View>

            <View style={styles.discountRow}>
              <Text style={styles.discountKey}>Descuento en $</Text>
              <Text style={[styles.discountValue, { color: "#277855" }]}>
                − ${discount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.discountRow}>
              <Text style={styles.discountKey}>Tope mensual restante</Text>
              <Text style={styles.discountValue}>${redeemCap.toFixed(2)}</Text>
            </View>

            <View style={[styles.discountRow, styles.discountRowLast]}>
              <Text style={styles.discountKey}>Tasa de conversión</Text>
              <Text style={styles.discountValue}>100 pts = $0.50</Text>
            </View>

            <View style={styles.capNote}>
              <Ionicons name="information-circle-outline" size={14} color={COLORS.dinersBlue} />
              <Text style={styles.capNoteText}>
                El descuento respeta el tope mensual del 40% de tu comisión Diners.
              </Text>
            </View>
          </View>
        )}

        {/* ── Resumen final ── */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${MOCK_PURCHASE_AMOUNT.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: "#277855" }]}>
                Descuento EcoPoints
              </Text>
              <Text style={[styles.totalValue, { color: "#277855" }]}>
                − ${discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.totalFinalRow]}>
            <Text style={styles.totalFinalLabel}>Total a pagar</Text>
            <Text style={styles.totalFinalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* ── Saldo restante ── */}
        {applyPoints && canApplyPoints && (
          <View style={styles.remainingRow}>
            <Ionicons name="leaf-outline" size={14} color="#277855" />
            <Text style={styles.remainingText}>
              Saldo restante: {(validPoints - pointsUsed).toLocaleString()} EcoPoints
            </Text>
          </View>
        )}

        {/* ── Botón de pago ── */}
        <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
          <Ionicons name="card" size={20} color="#FFFFFF" />
          <Text style={styles.payBtnText}>Pagar ${total.toFixed(2)} con Diners</Text>
        </TouchableOpacity>

        {/* ── Nota demo ── */}
        <View style={styles.demoNote}>
          <Ionicons name="flask-outline" size={14} color={COLORS.dinersBlue} />
          <Text style={styles.demoNoteText}>
            Esta es una simulación. En producción, el pago BLU se procesa con tu tarjeta Diners Club.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-pantalla: éxito de pago
// ---------------------------------------------------------------------------

function PaymentSuccess({
  router,
  total,
  pointsUsed,
}: {
  router: ReturnType<typeof useRouter>;
  total: number;
  pointsUsed: number;
}) {
  return (
    <SafeAreaView style={[styles.container, styles.successContainer]}>
      <View style={styles.successContent}>
        <View style={styles.successIconWrap}>
          <Ionicons name="checkmark-circle" size={72} color="#277855" />
        </View>
        <Text style={styles.successTitle}>¡Pago Exitoso!</Text>
        <Text style={styles.successAmount}>${total.toFixed(2)}</Text>
        <Text style={styles.successMerchant}>{MOCK_MERCHANT}</Text>

        {pointsUsed > 0 && (
          <View style={styles.successPointsRow}>
            <Ionicons name="leaf" size={16} color="#277855" />
            <Text style={styles.successPointsText}>
              {pointsUsed.toLocaleString()} EcoPoints aplicados
            </Text>
          </View>
        )}

        <View style={styles.successDemoBadge}>
          <Text style={styles.successDemoText}>Transacción simulada — Demo</Text>
        </View>

        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.successBtnText}>Volver a EcoClub</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  demoBadge: {
    backgroundColor: COLORS.dinersBlue + "18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  demoBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.dinersBlue,
  },

  scroll: { padding: 16, paddingBottom: 40 },

  // Merchant
  merchantCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  merchantIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.dinersBlue + "18",
    justifyContent: "center",
    alignItems: "center",
  },
  merchantName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  merchantCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Amount
  amountCard: {
    backgroundColor: COLORS.dinersBlue,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  amountNote: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
  },

  // Toggle
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleTexts: { flex: 1 },
  toggleTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Discount breakdown
  discountCard: {
    backgroundColor: "#F0FFF6",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A2C7B4",
  },
  discountTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E754C",
    marginBottom: 12,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#D4EDE1",
  },
  discountRowLast: {
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  discountRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountKey: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  discountValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  capNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 4,
  },
  capNoteText: {
    fontSize: 11,
    color: COLORS.dinersBlue,
    flex: 1,
    lineHeight: 16,
  },

  // Total
  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalFinalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 6,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  totalFinalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  totalFinalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.dinersBlue,
  },

  // Remaining
  remainingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    marginBottom: 16,
  },
  remainingText: {
    fontSize: 13,
    color: "#277855",
    fontWeight: "600",
  },

  // Pay button
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.dinersBlue,
    borderRadius: 14,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: COLORS.dinersBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // Demo note
  demoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.dinersBlue + "0E",
    borderRadius: 10,
    padding: 12,
  },
  demoNoteText: {
    fontSize: 12,
    color: COLORS.dinersBlue,
    flex: 1,
    lineHeight: 18,
  },

  // Success screen
  successContainer: {
    justifyContent: "center",
  },
  successContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  successIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.dinersBlue,
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 48,
    fontWeight: "900",
    color: "#277855",
    letterSpacing: -1,
    marginBottom: 8,
  },
  successMerchant: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  successPointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  successPointsText: {
    fontSize: 14,
    color: "#277855",
    fontWeight: "700",
  },
  successDemoBadge: {
    backgroundColor: COLORS.dinersBlue + "18",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 32,
  },
  successDemoText: {
    fontSize: 12,
    color: COLORS.dinersBlue,
    fontWeight: "600",
  },
  successBtn: {
    backgroundColor: COLORS.dinersBlue,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  successBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
