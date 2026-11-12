import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../constants/theme";
import EcoGauge from "./EcoGauge";

type Props = {
  co2Value: number;
  co2Max: number;
  multiplierActive: boolean;
  billingCurrent: number;
  billingMin: number;
  FireIcon?: React.ReactNode;
};

const GREEN = "#277855";
const GREEN_BG = "#E8F3ED";
const TRACK = "#F2F2F2";

export default function ValidationCard({
  co2Value,
  co2Max,
  multiplierActive,
  billingCurrent,
  billingMin,
  FireIcon,
}: Props) {
  const billingProgress =
    billingMin > 0 ? Math.min(billingCurrent / billingMin, 1) : 0;

  return (
    <View style={styles.card}>
      {/* Encabezado */}
      <Text style={styles.title}>Validación Ambiental</Text>
      <Text style={styles.subtitle}>Contaminación reducida este mes</Text>

      {/* Medidor */}
      <View style={styles.gaugeWrap}>
        <EcoGauge value={co2Value} max={co2Max} />
      </View>

      <View style={styles.footnote}>
        <Ionicons
          name="information-circle-outline"
          size={12}
          color={COLORS.textSecondary}
        />
        <Text style={styles.footnoteText}>
          Cálculo basado en estándares IPCC
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Multiplicador */}
      <View style={styles.multiplierRow}>
        <Text style={styles.rowLabel}>Multiplicador</Text>
        <View
          style={[
            styles.statusPill,
            multiplierActive ? styles.statusPillOn : styles.statusPillOff,
          ]}
        >
          {FireIcon || (
            <MaterialCommunityIcons
              name="fire"
              size={14}
              color={multiplierActive ? COLORS.warningRed : "#B0B0B0"}
            />
          )}
          <Text
            style={[
              styles.statusText,
              { color: multiplierActive ? GREEN : COLORS.textSecondary },
            ]}
          >
            {multiplierActive ? "Activo" : "Desactivado"}
          </Text>
        </View>
      </View>

      {/* Facturación vs. mínimo */}
      <View style={styles.billingRow}>
        <Text style={styles.rowLabel}>Facturación este mes</Text>
        <Text style={styles.billingValue}>
          ${billingCurrent.toFixed(2)}
          <Text style={styles.billingMin}> / ${billingMin} mínimo</Text>
        </Text>
      </View>
      <View
        style={styles.billingTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(billingProgress * 100),
        }}
      >
        <View
          style={[styles.billingFill, { width: `${billingProgress * 100}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.ecoGreenLight, // Borde verde claro
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.dinersBlue,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gaugeWrap: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: "center",
    width: "100%",
  },
  footnote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  footnoteText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: TRACK,
    marginVertical: 16,
  },
  multiplierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillOn: { backgroundColor: GREEN_BG },
  statusPillOff: { backgroundColor: TRACK },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 14,
  },
  billingValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.dinersBlue,
    fontVariant: ["tabular-nums"],
  },
  billingMin: {
    fontWeight: "400",
    color: COLORS.textSecondary,
  },
  billingTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: TRACK,
    overflow: "hidden",
    marginTop: 8,
  },
  billingFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: GREEN,
  },
});
