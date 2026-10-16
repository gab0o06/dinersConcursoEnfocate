import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ChallengeCard from "../../../components/ChallengeCard";
import EcoHeader from "../../../components/EcoHeader";
import EquivalenceCard from "../../../components/EquivalenceCard";
import ValidationCard from "../../../components/ValidationCard";
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

  const co2Max        = 8; // referencia IPCC para normalizar el gauge
  const billingCurrent = financials?.totalSpent ?? 0;

  return (
    <View style={styles.screen}>
      <EcoHeader />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>¡Hola, Diners!</Text>
          <View style={styles.points}>
            <MaterialCommunityIcons
              name="leaf"
              size={18}
              color="#111"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.pointsText}>{validPoints} EcoPoints</Text>
            <Ionicons name="chevron-forward" size={18} color="#111" />
          </View>
        </View>

        <ValidationCard
          co2Value={totalCo2Saved}
          co2Max={co2Max}
          multiplierActive={multiplierActive}
          billingCurrent={billingCurrent}
          billingMin={200}
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
              description={reciVeciKg > 0 ? `${Math.floor(reciVeciKg * 20)} pts ganados` : "Conecta con recicladores"}
              buttonLabel="ACTIVO"
              active={true}
              variant="green"
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
  points: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
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
