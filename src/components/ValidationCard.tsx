import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import EcoGauge from "./EcoGauge";

type Props = {
  co2Value: number;
  co2Max: number;
  multiplierActive: boolean;
  billingCurrent: number;
  billingMin: number;
  FireIcon?: React.ReactNode;
};

export default function ValidationCard({
  co2Value,
  co2Max,
  multiplierActive,
  billingCurrent,
  billingMin,
  FireIcon,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Validación Ambiental</Text>
      <Text style={styles.subtitle}>Contaminación reducida este mes</Text>

      <View style={styles.gaugeWrap}>
        <EcoGauge value={co2Value} max={co2Max} />
      </View>

      <Text style={styles.footnote}>Cálculo basado en estándares IPCC</Text>

      <View style={styles.multiplierRow}>
        <Text style={styles.multiplierText}>
          Multiplicador {multiplierActive ? "activo" : "desactivado"}
        </Text>
        {FireIcon || (
          <MaterialCommunityIcons
            name="fire"
            size={18}
            color={multiplierActive ? "#D32F2F" : "#B0B0B0"}
          />
        )}
      </View>
      <Text style={styles.billingText}>
        Facturación este mes:{" "}
        <Text style={styles.billingBold}>
          ${billingCurrent} / ${billingMin} mínimo
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A2C7B4", // Borde verde claro
    padding: 16,
    alignItems: "center",
    marginHorizontal: 20, // Alineado con el contenedor del EcoScreen
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    alignSelf: "flex-start",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: "#555",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  gaugeWrap: {
    marginVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  footnote: {
    fontSize: 10,
    color: "#555",
    marginTop: 4,
    marginBottom: 16,
  },
  multiplierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  multiplierText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
  },
  billingText: {
    fontSize: 11,
    color: "#333",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  billingBold: {
    fontWeight: "800",
    color: "#000",
  },
});
