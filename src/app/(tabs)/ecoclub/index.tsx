import { ScrollView, StyleSheet, Text, View } from "react-native";
import ChallengeCard from "../../../components/ChallengeCard";
import EcoHeader from "../../../components/EcoHeader";
import EquivalenceCard from "../../../components/EquivalenceCard";
import ValidationCard from "../../../components/ValidationCard";
import { colors } from "../../../constants/ecoColors";

export default function EcoScreen() {
  return (
    <View style={styles.screen}>
      <EcoHeader />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>¡Hola, Diners!</Text>
          <View style={styles.points}>
            <Text style={styles.pointsText}>3000 EcoPoints</Text>
            <Text style={styles.chevron}>›</Text>
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
            <ChallengeCard
              headerLabel="Metro Diners"
              title="Recarga Tarjeta ciudad"
              description="Cashback Automático"
              buttonLabel="ACTIVO"
              active
              variant="green"
            />
            <ChallengeCard
              headerLabel="Km Verdes"
              title="Realiza actividad deportiva"
              description="Gana el ranking mensual"
              buttonLabel="ACTIVAR"
              active={false}
              variant="gray"
            />
            <ChallengeCard
              headerLabel="ReciVeci Aliado"
              title="Reciclaje Seguro"
              description="Conecta con recicladores y recompenzas"
              buttonLabel="ACTIVO"
              active
              variant="green"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.grayLight },
  scroll: { paddingBottom: 20 },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  greeting: { fontSize: 20, fontWeight: "800", color: colors.black },
  points: { flexDirection: "row", alignItems: "center", gap: 4 },
  pointsText: { fontSize: 14, fontWeight: "700", color: colors.black },
  chevron: { fontSize: 18, color: colors.gray },
  challengesSection: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.black,
    marginBottom: 8,
  },
  challengesRow: { flexDirection: "row", gap: 8 },
});
