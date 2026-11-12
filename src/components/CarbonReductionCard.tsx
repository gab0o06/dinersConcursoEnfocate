/**
 * CarbonReductionCard — CO₂ evitado según el MCC (Merchant Category Code) de
 * cada compra, pensado para leerse de un vistazo: total en kg, equivalencia y
 * una barra segmentada con el reparto por categoría.
 *
 * El cálculo reutiliza calculateMonthlyCOIScore() de services/mccScoring.ts,
 * el mismo que usa el store, así que las cifras coinciden con totalCo2Saved.
 * No define márgenes horizontales: se adapta al padding del contenedor.
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { COLORS } from "../constants/theme";
import { co2ToEquivalence } from "../lib/co2";
import {
  calculateMonthlyCOIScore,
  type McCategory,
} from "../services/mccScoring";
import { useEcoStore } from "../store/useEcoStore";

// ---------------------------------------------------------------------------
// Paleta (solo tokens ya usados en la app)
// ---------------------------------------------------------------------------

const GREEN = "#277855";
const GREEN_SOFT = COLORS.ecoGreenLight; // #A2C7B4

/** Colores de los segmentos, en orden de mayor a menor impacto */
const SEGMENT_COLORS = [GREEN, GREEN_SOFT, COLORS.dinersBlue];
const SEGMENT_REST = "#D9D9D9";
const MAX_SEGMENTS = SEGMENT_COLORS.length;

const CATEGORY_LABEL: Record<McCategory, string> = {
  metro: "Metro",
  gimnasio: "Deporte",
  eco_aliado: "Eco-Aliados",
  supermercado: "Supermercado",
  restaurante: "Restaurantes",
  gasolinera: "Gasolina",
  otros: "Otros",
};

interface Segment {
  key: string;
  label: string;
  share: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Lógica
// ---------------------------------------------------------------------------

function useCarbonReduction() {
  const scoredTransactions = useEcoStore((s) => s.scoredTransactions);

  return useMemo(() => {
    const { totalCo2Saved, breakdown } =
      calculateMonthlyCOIScore(scoredTransactions);

    const shareOf = (kg: number) =>
      totalCo2Saved > 0 ? kg / totalCo2Saved : 0;

    const sorted = (Object.keys(breakdown) as McCategory[])
      .filter((cat) => breakdown[cat] > 0)
      .sort((a, b) => breakdown[b] - breakdown[a]);

    // Top 3 categorías + el resto agrupado en "Otras"
    const segments: Segment[] = sorted.slice(0, MAX_SEGMENTS).map((cat, i) => ({
      key: cat,
      label: CATEGORY_LABEL[cat],
      share: shareOf(breakdown[cat]),
      color: SEGMENT_COLORS[i],
    }));

    const rest = sorted.slice(MAX_SEGMENTS);
    if (rest.length) {
      segments.push({
        key: "rest",
        label: "Otras",
        share: shareOf(rest.reduce((acc, cat) => acc + breakdown[cat], 0)),
        color: SEGMENT_REST,
      });
    }

    return { totalCo2Saved, segments };
  }, [scoredTransactions]);
}

const pct = (share: number) => `${Math.round(share * 100)}%`;

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default function CarbonReductionCard({ style }: Props) {
  const router = useRouter();
  const { totalCo2Saved, segments } = useCarbonReduction();

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="leaf" size={16} color={GREEN} />
          <Text style={styles.eyebrow}>CO₂ evitado este mes</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.navigate("/(tabs)/ecoclub")}
          hitSlop={8}
          style={styles.link}
          accessibilityRole="link"
          accessibilityLabel="Ir a EcoClub"
        >
          <Text style={styles.linkText}>EcoClub</Text>
          <Ionicons name="chevron-forward" size={14} color={GREEN} />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroValue}>{totalCo2Saved.toFixed(1)}</Text>
        <Text style={styles.heroUnit}>kg</Text>
      </View>
      <Text style={styles.equivalence}>
        Equivale a {co2ToEquivalence(totalCo2Saved)}
      </Text>

      {segments.length > 0 ? (
        <>
          <View
            style={styles.segmentBar}
            accessibilityLabel={segments
              .map((s) => `${s.label} ${pct(s.share)}`)
              .join(", ")}
          >
            {segments.map((s) => (
              <View
                key={s.key}
                style={{ flex: s.share, backgroundColor: s.color }}
              />
            ))}
          </View>
          <View style={styles.legend}>
            {segments.map((s) => (
              <View key={s.key} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: s.color }]}
                />
                <Text style={styles.legendText}>
                  {s.label} <Text style={styles.legendPct}>{pct(s.share)}</Text>
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>
          Paga con tu Diners en Metro, deporte o Eco-Aliados para empezar a
          sumar.
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: GREEN_SOFT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eyebrow: { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary },
  link: { flexDirection: "row", alignItems: "center", gap: 2 },
  linkText: { fontSize: 13, fontWeight: "700", color: GREEN },
  hero: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 12,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.dinersBlue,
    letterSpacing: -1.2,
    fontVariant: ["tabular-nums"],
  },
  heroUnit: { fontSize: 18, fontWeight: "800", color: GREEN },
  equivalence: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  segmentBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    gap: 2,
    marginTop: 18,
    backgroundColor: COLORS.background, // separadores blancos entre segmentos
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 6,
    marginTop: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: COLORS.textSecondary },
  legendPct: { fontWeight: "700", color: COLORS.textPrimary },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginTop: 14,
  },
});
