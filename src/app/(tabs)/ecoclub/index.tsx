import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ChallengeCard from "../../../components/ChallengeCard";
import EcoHeader from "../../../components/EcoHeader";
import EquivalenceCard from "../../../components/EquivalenceCard";
import ValidationCard from "../../../components/ValidationCard";
import { ECOCLUB } from "../../../config/ecoclub.config";
import { MOCK_USUARIO } from "../../../data/mock/usuario";
import { getLevelLabel } from "../../../lib/levels";
import {
  selectAmountToMultiplier,
  selectMultiplierActive,
  selectValidPoints,
  useEcoStore,
} from "../../../store/useEcoStore";

/** Convierte kg de CO₂ evitado a una equivalencia comprensible para el usuario */
function co2ToEquivalence(co2Kg: number): string {
  if (co2Kg >= 6) return `plantar ${Math.round(co2Kg / 3)} árboles`;
  if (co2Kg >= 2) return `ahorrar ${Math.round(co2Kg * 0.5)} litros de gasolina`;
  return `evitar ${Math.round(co2Kg * 1000)}g de CO₂`;
}

export default function EcoScreen() {
  const router = useRouter();

  // — Datos del store (reemplazan todos los mocks hardcodeados) —
  const validPoints      = useEcoStore(selectValidPoints);
  const multiplierActive = useEcoStore(selectMultiplierActive);
  const amountLeft       = useEcoStore(selectAmountToMultiplier);
  const totalCo2Saved    = useEcoStore((s) => s.totalCo2Saved);
  const financials       = useEcoStore((s) => s.financials);
  const stravaKm         = useEcoStore((s) => s.strava.totalKm);
  const reciVeciKg       = useEcoStore((s) => s.reciVeciKgTotal);
  const nivelActual      = useEcoStore((s) => s.nivelActual);

  const co2Max        = ECOCLUB.co2Max; // referencia calibrada para normalizar el gauge
  const billingCurrent = financials?.totalSpent ?? 0;
  const levelLabel     = getLevelLabel(nivelActual);

  return (
    <View style={styles.screen}>
      <EcoHeader />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>¡Hola, {MOCK_USUARIO.nombre}!</Text>
            <View style={styles.levelBadge}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#277855" />
              <Text style={styles.levelBadgeText}>Nivel {levelLabel}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.points}
            onPress={() => router.push("/(tabs)/ecoclub/recompensas")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="leaf"
              size={18}
              color="#111"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.pointsText}>{validPoints} EcoPoints</Text>
            <Ionicons name="chevron-forward" size={18} color="#111" />
          </TouchableOpacity>
        </View>

        <ValidationCard
          co2Value={totalCo2Saved}
          co2Max={co2Max}
          multiplierActive={multiplierActive}
          billingCurrent={billingCurrent}
          billingMin={ECOCLUB.topOfWalletThreshold}
        />

        <EquivalenceCard label={co2ToEquivalence(totalCo2Saved)} />

        {/* Indicador de activación del multiplicador (Escenario B) */}
        {!multiplierActive && amountLeft > 0 && (
          <View style={styles.activationBanner}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#D97706" />
            <Text style={styles.activationText}>
              <Text style={{ fontWeight: "800" }}>${amountLeft.toFixed(0)}</Text>
              {" "}más para activar tu multiplicador
            </Text>
          </View>
        )}

        {/* Banner de acceso a Recompensas */}
        <TouchableOpacity
          style={styles.rewardsCtaBanner}
          onPress={() => router.push("/(tabs)/ecoclub/recompensas")}
          activeOpacity={0.8}
        >
          <View style={styles.rewardsCtaLeft}>
            <View style={styles.rewardsCtaIconWrap}>
              <Ionicons name="gift-outline" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.rewardsCtaTitle}>Catálogo de Recompensas</Text>
              <Text style={styles.rewardsCtaSubtitle}>
                Descuentos en tu factura, cuota cero y millas
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#277855" />
        </TouchableOpacity>

        <View style={styles.challengesSection}>
          <Text style={styles.sectionTitle}>Retos Activos</Text>
          <View style={styles.challengesRow}>
            {/* Tarjeta 1: Metro */}
            <ChallengeCard
              icon={
                <MaterialCommunityIcons name="train" size={24} color="#FFF" />
              }
              headerLabel="Metro Diners"
              title="Recarga Tarjeta ciudad"
              description="Cashback Automático"
              buttonLabel="ACTIVO"
              active={true}
              variant="green"
              onPress={() => router.push("/(tabs)/ecoclub/metro")}
            />

            {/* Tarjeta 2: Km Verdes */}
            <ChallengeCard
              icon={
                <MaterialCommunityIcons name="run" size={24} color="#FFF" />
              }
              headerLabel="Km Verdes"
              title={stravaKm > 0 ? `${stravaKm} km` : "Realiza actividad deportiva"}
              description={stravaKm > 0 ? "Strava sincronizado ✓" : "Gana el ranking mensual"}
              buttonLabel={stravaKm > 0 ? "ACTIVO" : "ACTIVAR"}
              active={stravaKm > 0}
              variant={stravaKm > 0 ? "green" : "gray"}
              onPress={() => router.push("/(tabs)/ecoclub/km-verdes")}
            />

            {/* Tarjeta 3: ReciVeci */}
            <ChallengeCard
              icon={
                <MaterialCommunityIcons name="recycle" size={24} color="#FFF" />
              }
              headerLabel="ReciVeci Aliado"
              title={reciVeciKg > 0 ? `${reciVeciKg} kg` : "Reciclaje Seguro"}
              description={reciVeciKg > 0 ? `${Math.floor(reciVeciKg * ECOCLUB.retos.reciVeciPtsPorKg)} pts ganados` : "Conecta con recicladores"}
              buttonLabel={reciVeciKg > 0 ? "ACTIVO" : "ACTIVAR"}
              active={reciVeciKg > 0}
              variant={reciVeciKg > 0 ? "green" : "gray"}
              onPress={() => router.push("/(tabs)/ecoclub/reciveci")}
            />
          </View>
        </View>

        {/* Espaciador inferior para no chocar con el menú flotante */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scroll: {
    paddingBottom: 20,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "400",
    color: "#000",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#277855",
  },
  points: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
  },
  rewardsCtaBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A2C7B4",
  },
  rewardsCtaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rewardsCtaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#277855",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardsCtaTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
  rewardsCtaSubtitle: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
  },
  activationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  activationText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
  },
  challengesSection: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
    marginBottom: 12,
  },
  challengesRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
});
