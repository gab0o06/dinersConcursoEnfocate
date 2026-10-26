import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";
import { MOCK_USUARIO } from "../../data/mock/usuario";
import { pointsToDollars } from "../../services/ecoPointsEngine";
import { selectValidPoints, useEcoStore } from "../../store/useEcoStore";

export default function WalletScreen() {
  const router = useRouter();
  const [showNumbers, setShowNumbers] = useState(false);

  const validPoints = useEcoStore(selectValidPoints);
  const financials = useEcoStore((s) => s.financials);
  const scoredTransactions = useEcoStore((s) => s.scoredTransactions);

  const totalSpent = financials?.totalSpent ?? 0;
  const cupoTotal = 5000.0;
  const cupoDisponible = cupoTotal - totalSpent;
  const pointsAsCash = pointsToDollars(validPoints);

  const recentTxs = scoredTransactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Wallet BLU</Text>
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowNumbers(!showNumbers)}
          >
            <Ionicons
              name={showNumbers ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={COLORS.dinersBlue}
            />
          </TouchableOpacity>
        </View>

        {/* Tarjeta Diners visual */}
        <View style={styles.cardDiners}>
          <View style={styles.cardTop}>
            <Text style={styles.cardBrand}>Diners Club</Text>
            <Text style={styles.cardType}>{MOCK_USUARIO.tipoTarjeta}</Text>
          </View>

          <View style={styles.cardMiddle}>
            <View style={styles.chipMock} />
            <Text style={styles.cardNumber}>
              {showNumbers
                ? `3612 •••• •••• ${MOCK_USUARIO.numeroTarjeta}`
                : `•••• •••• •••• ${MOCK_USUARIO.numeroTarjeta}`}
            </Text>
          </View>

          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardHolderLabel}>TITULAR</Text>
              <Text style={styles.cardHolderName}>
                {MOCK_USUARIO.nombre} {MOCK_USUARIO.apellido}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.cardHolderLabel}>VENCE</Text>
              <Text style={styles.cardHolderName}>10/29</Text>
            </View>
          </View>
        </View>

        {/* Balance de Tarjeta */}
        <View style={styles.balancesContainer}>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Saldo a pagar</Text>
            <Text style={styles.balanceValue}>
              ${totalSpent.toFixed(2)}
            </Text>
            <Text style={styles.balanceSub}>Corte: 01/dic/2026</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Cupo disponible</Text>
            <Text style={[styles.balanceValue, { color: "#277855" }]}>
              ${cupoDisponible.toFixed(2)}
            </Text>
            <Text style={styles.balanceSub}>De ${cupoTotal.toFixed(0)}</Text>
          </View>
        </View>

        {/* Card Saldo EcoClub */}
        <View style={styles.ecoWalletCard}>
          <View style={styles.ecoWalletHeader}>
            <View style={styles.ecoWalletTitleRow}>
              <MaterialCommunityIcons name="leaf" size={20} color="#277855" />
              <Text style={styles.ecoWalletTitle}>Saldo EcoClub</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/ecoclub/recompensas")}
              style={styles.redeemBtn}
            >
              <Text style={styles.redeemBtnText}>Canjear</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.ecoPointsRow}>
            <Text style={styles.ecoPointsValue}>{validPoints}</Text>
            <Text style={styles.ecoPointsLabel}>EcoPoints disponibles</Text>
          </View>

          <Text style={styles.ecoCashValue}>
            ≈ ${pointsAsCash.toFixed(2)} USD aplicables a tu factura Diners
          </Text>

          <TouchableOpacity
            style={styles.payWithBluBtn}
            onPress={() => router.push("/(tabs)/ecoclub/pago-blu")}
          >
            <Ionicons name="cart-outline" size={18} color="#277855" />
            <Text style={styles.payWithBluText}>Pagar compra y aplicar EcoPoints</Text>
          </TouchableOpacity>
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/ecoclub/pago-blu")}
          >
            <View style={styles.quickIconCircle}>
              <Ionicons name="qr-code-outline" size={22} color={COLORS.dinersBlue} />
            </View>
            <Text style={styles.quickActionText}>Pagar con QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/ecoclub/metro")}
          >
            <View style={styles.quickIconCircle}>
              <Ionicons name="train-outline" size={22} color="#0A467A" />
            </View>
            <Text style={styles.quickActionText}>Recarga Metro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/ecoclub/recompensas")}
          >
            <View style={styles.quickIconCircle}>
              <Ionicons name="gift-outline" size={22} color="#277855" />
            </View>
            <Text style={styles.quickActionText}>Recompensas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickIconCircle}>
              <Ionicons name="swap-horizontal" size={22} color={COLORS.dinersBlue} />
            </View>
            <Text style={styles.quickActionText}>Transferir</Text>
          </TouchableOpacity>
        </View>

        {/* Últimos Movimientos con EcoPoints */}
        <Text style={styles.sectionTitle}>Últimos movimientos</Text>
        <View style={styles.txListCard}>
          {recentTxs.map((tx, idx) => (
            <View
              key={tx.transactionId || idx}
              style={[
                styles.txRow,
                idx < recentTxs.length - 1 && styles.txRowBorder,
              ]}
            >
              <View style={styles.txIconWrap}>
                <Ionicons
                  name={
                    tx.category === "metro"
                      ? "train-outline"
                      : tx.category === "gimnasio"
                        ? "fitness-outline"
                        : tx.category === "supermercado"
                          ? "cart-outline"
                          : "card-outline"
                  }
                  size={18}
                  color={COLORS.dinersBlue}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txDate}>
                  {new Date(tx.date).toLocaleDateString("es-EC", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.txAmount}>-${tx.amount.toFixed(2)}</Text>
                {tx.ecoPoints > 0 && (
                  <Text style={styles.txEco}>+{tx.ecoPoints} pts</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dinersBlue,
  },
  eyeBtn: {
    padding: 6,
  },
  cardDiners: {
    backgroundColor: "#0A1C40",
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: "#0A1C40",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  cardType: {
    fontSize: 11,
    color: "#A2C7B4",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardMiddle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  chipMock: {
    width: 36,
    height: 26,
    borderRadius: 4,
    backgroundColor: "#E2B857",
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardHolderLabel: {
    fontSize: 9,
    color: "#8DA4C4",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardHolderName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
  balancesContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  balanceBox: {
    flex: 1,
    alignItems: "center",
  },
  balanceDivider: {
    width: 1,
    backgroundColor: "#EAEAEA",
    marginHorizontal: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  balanceSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ecoWalletCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#A2C7B4",
  },
  ecoWalletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ecoWalletTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ecoWalletTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  redeemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#277855",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  redeemBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ecoPointsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 4,
  },
  ecoPointsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.dinersBlue,
  },
  ecoPointsLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  ecoCashValue: {
    fontSize: 12,
    color: "#277855",
    fontWeight: "600",
    marginBottom: 14,
  },
  payWithBluBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E8F3ED",
    borderRadius: 12,
    paddingVertical: 10,
  },
  payWithBluText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#277855",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickAction: {
    width: "22%",
    alignItems: "center",
  },
  quickIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  quickActionText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    textAlign: "center",
    fontWeight: "500",
  },
  txListCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    overflow: "hidden",
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  txDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  txEco: {
    fontSize: 11,
    fontWeight: "700",
    color: "#277855",
    marginTop: 2,
  },
});
