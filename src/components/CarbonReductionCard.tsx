/**
 * CarbonReductionCard — Indicador de CO₂ evitado por MCC (Merchant Category Code).
 *
 * Fuente única de UI y lógica, compartida por Home, Menú y la pestaña EcoClub.
 * El cálculo reutiliza calculateMonthlyCOIScore() de services/mccScoring.ts,
 * el mismo que usa el store, por lo que el total coincide con totalCo2Saved.
 *
 * No define márgenes horizontales: se adapta al padding del contenedor.
 * Las pantallas sin padding (EcoClub) le pasan `style` con su margen.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ECOCLUB } from "../config/ecoclub.config";
import { COLORS } from "../constants/theme";
import { co2ToEquivalence } from "../lib/co2";
import {
  calculateMonthlyCOIScore,
  MCC_RULES,
  type McCategory,
} from "../services/mccScoring";
import { useEcoStore } from "../store/useEcoStore";

// ---------------------------------------------------------------------------
// Paleta (solo tokens ya usados en la app)
// ---------------------------------------------------------------------------

const GREEN = "#277855"; // verde EcoClub de acentos (badges, iconos)
const GREEN_SOFT = COLORS.ecoGreenLight; // #A2C7B4 — bordes verdes
const GREEN_BG = "#E8F3ED"; // fondo de badges verdes
const TRACK = "#F2F2F2"; // pistas y divisores

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const CATEGORY_ICON: Record<McCategory, IconName> = {
  metro: "train",
  gimnasio: "dumbbell",
  eco_aliado: "storefront-outline",
  supermercado: "cart-outline",
  restaurante: "silverware-fork-knife",
  gasolinera: "gas-station",
  otros: "dots-horizontal-circle-outline",
};

const CATEGORY_LABEL: Record<McCategory, string> = {
  ...(Object.fromEntries(MCC_RULES.map((r) => [r.category, r.label])) as Record<
    McCategory,
    string
  >),
  otros: "Otros",
};

interface CategoryImpact {
  category: McCategory;
  label: string;
  kg: number;
  share: number;
  purchases: number;
  mccs: number[];
}

// ---------------------------------------------------------------------------
// Lógica
// ---------------------------------------------------------------------------

function useCarbonReduction() {
  const scoredTransactions = useEcoStore((s) => s.scoredTransactions);

  return useMemo(() => {
    const { totalCo2Saved, coiScore, breakdown } =
      calculateMonthlyCOIScore(scoredTransactions);

    const categories: CategoryImpact[] = (
      Object.keys(breakdown) as McCategory[]
    )
      .filter((cat) => breakdown[cat] > 0)
      .map((cat) => {
        const txs = scoredTransactions.filter((tx) => tx.category === cat);
        return {
          category: cat,
          label: CATEGORY_LABEL[cat],
          kg: breakdown[cat],
          share: totalCo2Saved > 0 ? breakdown[cat] / totalCo2Saved : 0,
          purchases: txs.length,
          mccs: [...new Set(txs.map((tx) => tx.mcc))].slice(0, 2),
        };
      })
      .sort((a, b) => b.kg - a.kg);

    const goalKg = ECOCLUB.co2Max;
    const goalProgress = Math.min(totalCo2Saved / goalKg, 1);

    return { totalCo2Saved, coiScore, categories, goalKg, goalProgress };
  }, [scoredTransactions]);
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default function CarbonReductionCard({ style }: Props) {
  const { totalCo2Saved, coiScore, categories, goalKg, goalProgress } =
    useCarbonReduction();

  const pct = Math.round(goalProgress * 100);

  return (
    <View style={[styles.card, style]}>
      {/* ── Encabezado ── */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="molecule-co2" size={22} color={GREEN} />
        </View>
        <View style={styles.headerTexts}>
          <Text style={styles.title}>Reducción de CO₂</Text>
          <Text style={styles.subtitle}>Calculado por MCC de tus compras</Text>
        </View>
        <View style={styles.coiBadge}>
          <Text style={styles.coiBadgeLabel}>COI</Text>
          <Text style={styles.coiBadgeValue}>{coiScore.toFixed(1)}</Text>
        </View>
      </View>

      {/* ── Dato principal ── */}
      <View style={styles.hero}>
        <Text
          style={styles.heroValue}
          accessibilityLabel={`${totalCo2Saved.toFixed(2)} kilogramos de CO2 evitados este mes`}
        >
          {totalCo2Saved.toFixed(2)}
        </Text>
        <View style={styles.heroUnitWrap}>
          <Text style={styles.heroUnit}>kg CO₂</Text>
          <Text style={styles.heroPeriod}>evitados este mes</Text>
        </View>
      </View>

      <View style={styles.equivalence}>
        <MaterialCommunityIcons name="tree-outline" size={16} color={GREEN} />
        <Text style={styles.equivalenceText}>
          Equivale a {co2ToEquivalence(totalCo2Saved)}
        </Text>
      </View>

      {/* ── Progreso hacia la meta mensual ── */}
      <View
        style={styles.goalTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: pct }}
      >
        <View style={[styles.goalFill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.goalLabels}>
        <Text style={styles.goalLabel}>Meta mensual: {goalKg} kg</Text>
        <Text style={styles.goalPct}>{pct}%</Text>
      </View>

      <View style={styles.divider} />

      {/* ── Desglose por categoría MCC ── */}
      <Text style={styles.sectionLabel}>Impacto por categoría MCC</Text>

      {categories.length === 0 ? (
        <Text style={styles.emptyText}>
          Aún no hay compras con impacto verde este mes. Usa tu Diners en Metro,
          gimnasios o Eco-Aliados para empezar a sumar.
        </Text>
      ) : (
        <View style={styles.categoryList}>
          {categories.map((c, i) => (
            <View key={c.category} style={styles.categoryRow}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons
                  name={CATEGORY_ICON[c.category]}
                  size={18}
                  color={GREEN}
                />
              </View>

              <View style={styles.categoryBody}>
                <View style={styles.categoryTop}>
                  <Text style={styles.categoryLabel} numberOfLines={1}>
                    {c.label}
                  </Text>
                  <Text style={styles.categoryKg}>{c.kg.toFixed(2)} kg</Text>
                </View>

                <View style={styles.categoryBarTrack}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${Math.max(c.share * 100, 4)}%`,
                        backgroundColor: i === 0 ? GREEN : GREEN_SOFT,
                      },
                    ]}
                  />
                </View>

                <View style={styles.categoryMeta}>
                  {c.mccs.map((mcc) => (
                    <View key={mcc} style={styles.mccBadge}>
                      <Text style={styles.mccBadgeText}>MCC {mcc}</Text>
                    </View>
                  ))}
                  <Text style={styles.categoryMetaText}>
                    {c.purchases} {c.purchases === 1 ? "compra" : "compras"} ·{" "}
                    {Math.round(c.share * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footnote}>
        <MaterialCommunityIcons
          name="information-outline"
          size={12}
          color={COLORS.textSecondary}
        />
        <Text style={styles.footnoteText}>
          Factores IPCC calibrados a Quito
        </Text>
      </View>
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

  // Encabezado
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTexts: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.dinersBlue,
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  coiBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    backgroundColor: GREEN_BG,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coiBadgeLabel: { fontSize: 10, fontWeight: "700", color: GREEN },
  coiBadgeValue: { fontSize: 14, fontWeight: "800", color: GREEN },

  // Dato principal
  hero: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  heroValue: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "800",
    color: COLORS.dinersBlue,
    letterSpacing: -1.5,
    fontVariant: ["tabular-nums"],
  },
  heroUnitWrap: { paddingBottom: 6 },
  heroUnit: { fontSize: 16, fontWeight: "800", color: GREEN },
  heroPeriod: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },

  equivalence: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  equivalenceText: { fontSize: 13, color: COLORS.textSecondary },

  // Meta mensual
  goalTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: TRACK,
    overflow: "hidden",
    marginTop: 16,
  },
  goalFill: { height: "100%", borderRadius: 4, backgroundColor: GREEN },
  goalLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  goalLabel: { fontSize: 11, color: COLORS.textSecondary },
  goalPct: { fontSize: 11, fontWeight: "700", color: GREEN },

  divider: { height: 1, backgroundColor: TRACK, marginVertical: 18 },

  // Desglose
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyText: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
  categoryList: { gap: 14 },
  categoryRow: { flexDirection: "row", gap: 12 },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBody: { flex: 1, minWidth: 0 },
  categoryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  categoryKg: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.dinersBlue,
    fontVariant: ["tabular-nums"],
  },
  categoryBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: TRACK,
    overflow: "hidden",
    marginTop: 6,
  },
  categoryBarFill: { height: "100%", borderRadius: 3 },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  mccBadge: {
    backgroundColor: GREEN_BG,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mccBadgeText: { fontSize: 10, fontWeight: "700", color: GREEN },
  categoryMetaText: { fontSize: 11, color: COLORS.textSecondary },

  footnote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 18,
  },
  footnoteText: { fontSize: 10, color: COLORS.textSecondary },
});
