import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EcoHeader from "../../../components/EcoHeader";

const { width } = Dimensions.get("window");

// Datos falsos para el gráfico
const weeklyData = [
  { day: "L", km: 35 },
  { day: "M", km: 75 },
  { day: "Mi", km: 50 },
  { day: "J", km: 90 },
  { day: "V", km: 30 },
  { day: "S", km: 45 },
  { day: "D", km: 65 },
];

const rankingData = [
  { id: 1, name: "Gabriel Alm", km: "50 Km" },
  { id: 2, name: "Jose Garces", km: "48 Km" },
  { id: 3, name: "Jose Lopez", km: "47 Km" },
  { id: 4, name: "Juan Pablo E.", km: "46 Km" },
  { id: 5, name: "Mateo Sosa", km: "46 Km" },
  { id: 6, name: "Miguel Bucheli", km: "44 Km" },
];

export default function KmVerdesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <EcoHeader
        BellIcon={
          <Ionicons name="notifications-outline" size={24} color="#0A1C40" />
        }
        UserIcon={<Ionicons name="person-outline" size={24} color="#0A1C40" />}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Título y Puntos */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.title}>
              <Text style={{ fontWeight: "800" }}>Km Verdes</Text> - Strava
            </Text>
          </TouchableOpacity>

          <View style={styles.pointsEarned}>
            <MaterialCommunityIcons
              name="leaf"
              size={20}
              color="#111"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <View>
              <Text style={styles.pointsValue}>
                700{" "}
                <Text style={{ fontWeight: "400", fontSize: 12 }}>
                  EcoPoints
                </Text>
              </Text>
              <Text style={styles.pointsLabel}>ganados</Text>
            </View>
          </View>
        </View>

        {/* Gráfico de Barras Personalizado */}
        <View style={styles.chartContainer}>
          <Text style={styles.yAxisLabel}>Km</Text>
          <View style={styles.barsRow}>
            {weeklyData.map((item, index) => (
              <View key={index} style={styles.barWrapper}>
                <View style={[styles.barFill, { height: item.km * 1.5 }]} />
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartBaseLine} />
        </View>

        {/* Estadísticas de progreso */}
        <View style={styles.statsContainer}>
          <Text style={styles.kmSummary}>27 / 35</Text>
          <Text style={styles.kmLabel}>Km recorridos</Text>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: "65%" }]} />
          </View>
        </View>

        {/* Sección de Ranking */}
        <View style={styles.rankingSection}>
          <Text style={styles.sectionTitle}>Ranking Mensual</Text>

          <View style={styles.rankingCard}>
            {rankingData.map((user, index) => (
              <View
                key={user.id}
                style={[
                  styles.rankingRow,
                  index === rankingData.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.rankNumber}>{user.id}.</Text>
                  <Ionicons
                    name="person-circle-outline"
                    size={28}
                    color="#555"
                  />
                  <Text style={styles.userName}>{user.name}</Text>
                </View>
                <Text style={styles.userKm}>{user.km}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Espaciador inferior para el Tab Bar */}
        <View style={{ height: 120 }} />
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
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: "#000",
    marginLeft: 4,
  },
  pointsEarned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
  },
  pointsLabel: {
    fontSize: 12,
    color: "#333",
    textAlign: "right",
    marginTop: -4,
  },
  chartContainer: {
    height: 220,
    marginHorizontal: 20,
    paddingTop: 20,
    position: "relative",
  },
  yAxisLabel: {
    position: "absolute",
    left: -10,
    top: 80,
    transform: [{ rotate: "-90deg" }],
    fontSize: 12,
    color: "#555",
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: "center",
    width: 30,
  },
  barFill: {
    width: 18,
    backgroundColor: "#277855",
    borderRadius: 10,
  },
  dayLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
  },
  chartBaseLine: {
    height: 1.5,
    backgroundColor: "#000",
    width: "100%",
    marginTop: 2,
  },
  statsContainer: {
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  kmSummary: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  kmLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
    marginBottom: 12,
  },
  progressBarBackground: {
    width: "100%",
    height: 18,
    backgroundColor: "#A2C7B4",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1E754C",
    borderRadius: 10,
  },
  rankingSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: "#000",
    marginBottom: 15,
  },
  rankingCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A2C7B4",
    padding: 10,
  },
  rankingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EAEAEA",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    width: 25,
  },
  userName: {
    fontSize: 14,
    color: "#333",
  },
  userKm: {
    fontSize: 14,
    color: "#333",
  },
});
