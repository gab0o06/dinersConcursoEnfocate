import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ChallengeCard from "../../../components/ChallengeCard";
import EcoHeader from "../../../components/EcoHeader";
import EquivalenceCard from "../../../components/EquivalenceCard";
import ValidationCard from "../../../components/ValidationCard";

export default function EcoScreen() {
  const router = useRouter();

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
            {/* Ícono de hoja invertida en negro */}
            <MaterialCommunityIcons
              name="leaf"
              size={18}
              color="#111"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.pointsText}>3000 EcoPoints</Text>
            <Ionicons name="chevron-forward" size={18} color="#111" />
          </View>
        </View>

        <ValidationCard
          co2Value={5.2}
          co2Max={8}
          multiplierActive={false}
          billingCurrent={150}
          billingMin={200}
        />

        <EquivalenceCard label="plantar 2 árboles" />

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
              title="Realiza actividad deportiva"
              description="Gana el ranking mensual"
              buttonLabel="ACTIVAR"
              active={false}
              variant="gray"
              onPress={() => router.push("/(tabs)/ecoclub/km-verdes")}
            />

            {/* Tarjeta 3: ReciVeci */}
            <ChallengeCard
              icon={
                <MaterialCommunityIcons name="recycle" size={24} color="#FFF" />
              }
              headerLabel="ReciVeci Aliado"
              title="Reciclaje Seguro"
              description="Conecta con recicladores y recompensas"
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
    backgroundColor: "#F8F9FA", // Un fondo casi blanco/gris muy claro
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
