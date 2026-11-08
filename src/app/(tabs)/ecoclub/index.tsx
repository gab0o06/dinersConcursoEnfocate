import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Capa0DescubiertoCard from "../../../components/Capa0DescubiertoCard";
import ChallengeCard from "../../../components/ChallengeCard";
import EcoHeader from "../../../components/EcoHeader";
import EquivalenceCard from "../../../components/EquivalenceCard";
import PointsHistoryModal from "../../../components/PointsHistoryModal";
import SeasonBanner from "../../../components/SeasonBanner";
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
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // — Datos del store —
  const validPoints      = useEcoStore(selectValidPoints);
  const pointsBatches    = useEcoStore((s) => s.pointsBatches);
  const multiplierActive = useEcoStore(selectMultiplierActive);
  const amountLeft       = useEcoStore(selectAmountToMultiplier);
  const totalCo2Saved    = useEcoStore((s) => s.totalCo2Saved);
  const financials       = useEcoStore((s) => s.financials);
  const stravaKm         = useEcoStore((s) => s.strava.totalKm);
  const reciVeciKg       = useEcoStore((s) => s.reciVeciKgTotal);
  const nivelActual      = useEcoStore((s) => s.nivelActual);
  const isRegistered     = useEcoStore((s) => s.isRegistered);
  const registerEcoClub  = useEcoStore((s) => s.registerEcoClub);
  const setRegistered    = useEcoStore((s) => s.setRegistered);

  const co2Max         = ECOCLUB.co2Max; // referencia calibrada para normalizar el gauge
  const billingCurrent = financials?.totalSpent ?? 0;
  const levelLabel     = isRegistered ? getLevelLabel(nivelActual) : "Descubierto";

  return (
    <View style={styles.screen}>
      <EcoHeader />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera y Saludo */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>¡Hola, {MOCK_USUARIO.nombre}!</Text>
            <View style={styles.levelBadge}>
              <MaterialCommunityIcons
                name={isRegistered ? "shield-check" : "magnify"}
                size={14}
                color={isRegistered ? "#277855" : "#0B2046"}
              />
              <Text
                style={[
                  styles.levelBadgeText,
                  !isRegistered && { color: "#0B2046" },
                ]}
              >
                Nivel {levelLabel}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.points}
            onPress={() => setHistoryModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="leaf"
              size={18}
              color="#111"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.pointsText}>{validPoints} EcoPoints</Text>
            <Ionicons name="time-outline" size={16} color="#666" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        {/* Switch de demostración de Capa 0 (No registrado vs Registrado) */}
        <View style={styles.demoBar}>
          <Text style={styles.demoBarLabel}>Estado membresía:</Text>
          <TouchableOpacity
            style={[styles.demoPill, !isRegistered && styles.demoPillActive]}
            onPress={() => setRegistered(false)}
          >
            <Text
              style={[
                styles.demoPillText,
                !isRegistered && styles.demoPillTextActive,
              ]}
            >
              Capa 0 (Descubierto)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.demoPill, isRegistered && styles.demoPillActive]}
            onPress={() => setRegistered(true)}
          >
            <Text
              style={[
                styles.demoPillText,
                isRegistered && styles.demoPillTextActive,
              ]}
            >
              Registrado ({levelLabel})
            </Text>
          </TouchableOpacity>
        </View>

        {/* SI EL USUARIO NO ESTÁ REGISTRADO: Capa 0 — Anzuelo de Adquisición */}
        {!isRegistered ? (
          <Capa0DescubiertoCard
            totalCo2Saved={totalCo2Saved}
            potentialEcoPoints={validPoints > 0 ? validPoints : 320}
            potentialDollars={
              validPoints > 0 ? validPoints * ECOCLUB.valorPuntoUSD : 3.2
            }
            onRegister={registerEcoClub}
            isRegistered={false}
          />
        ) : null}

        {/* Banner de Temporada Activa (Verano Verde 2026) */}
        <SeasonBanner />

        {/* Gauge de CO2 y Validación Diners */}
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

        {/* Banner de Directorio de Eco-Aliados B2B (Nuevo Elemento Implementado) */}
        <TouchableOpacity
          style={styles.aliadosBanner}
          onPress={() => router.push("/(tabs)/ecoclub/eco-aliados")}
          activeOpacity={0.8}
        >
          <View style={styles.aliadosBannerLeft}>
            <View style={styles.aliadosIconWrap}>
              <FontAwesome5 name="store" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.aliadosTitleRow}>
                <Text style={styles.aliadosTitle}>Directorio Eco-Aliados B2B</Text>
                <View style={styles.aliadosBadge}>
                  <Text style={styles.aliadosBadgeText}>3× PUNTOS</Text>
                </View>
              </View>
              <Text style={styles.aliadosSubtitle}>
                Comercios sostenibles en Quito · Cupones y beneficios QR en caja
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#277855" />
        </TouchableOpacity>

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
                Descuentos en tu factura, cuota cero y millas Diners
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#277855" />
        </TouchableOpacity>

        {/* Retos Semanales */}
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

      {/* Modal Desplegable de Historial de Puntos con Expiración FIFO */}
      <PointsHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        batches={pointsBatches}
        totalValidPoints={validPoints}
        pointsAsDollars={validPoints * ECOCLUB.valorPuntoUSD}
      />
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
    marginTop: 16,
    marginBottom: 8,
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
  demoBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  demoBarLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  demoPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  demoPillActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  demoPillText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  demoPillTextActive: {
    color: "#0B2046",
    fontWeight: "700",
  },
  aliadosBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    shadowColor: "#277855",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  aliadosBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  aliadosIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  aliadosTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aliadosTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
  aliadosBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  aliadosBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#166534",
  },
  aliadosSubtitle: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
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
