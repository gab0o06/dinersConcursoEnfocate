import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EcoHeader from "../../../components/EcoHeader";

// --- Datos de Ejemplo ---
const historyData = [
  {
    id: "1",
    time: "10:23",
    date: "25/06/2026",
    action: "Recarga Metro",
    points: "+ 150 pts",
  },
  {
    id: "2",
    time: "10:23",
    date: "25/06/2026",
    action: "Recarga Metro",
    points: "+ 150 pts",
  },
  {
    id: "3",
    time: "10:23",
    date: "25/06/2026",
    action: "Recarga Metro",
    points: "+ 150 pts",
  },
  {
    id: "4",
    time: "10:23",
    date: "25/06/2026",
    action: "Recarga Metro",
    points: "+ 150 pts",
  },
];

export default function MetroDinersScreen() {
  const router = useRouter();
  const [autoRecharge, setAutoRecharge] = useState(true);

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
        {/* Cabecera y Puntos */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.title}>Metro Diners</Text>
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
                200{" "}
                <Text style={{ fontWeight: "400", fontSize: 12 }}>
                  EcoPoints
                </Text>
              </Text>
              <Text style={styles.pointsLabel}>ganados</Text>
            </View>
          </View>
        </View>

        {/* Sección de la Tarjeta */}
        <View style={styles.cardSection}>
          {/* Reemplaza la URI por tu imagen local, ej: require('../../../assets/tarjeta-ciudad.png') */}
          <Image
            source={{
              uri: "https://via.placeholder.com/600x380/0A467A/FFFFFF?text=Tarjeta+Ciudad",
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          <View style={styles.cardInfoRow}>
            <Text style={styles.cardTitle}>Tarjeta Ciudad</Text>
            <Text style={styles.cardBalance}>Saldo Actual: $4.50</Text>
          </View>

          <Text style={styles.giftBalance}>Saldo regalo Diners: + $2.00</Text>

          <View style={styles.autoRechargeRow}>
            <Text style={styles.autoRechargeText}>Recarga Automática:</Text>
            <Switch
              value={autoRecharge}
              onValueChange={setAutoRecharge}
              trackColor={{ false: "#D3D3D3", true: "#277855" }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* Sección de Nivel y Progreso */}
        <View style={styles.levelSection}>
          <Text style={styles.levelText}>
            <Text style={{ fontWeight: "800" }}>Nivel:</Text> Pasajero
          </Text>
          <Text style={styles.rechargesText}>Recargas este mes: 8/10</Text>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: "80%" }]} />
          </View>

          <Text style={styles.unlockText}>
            Desbloquear siguiente nivel: Explorador
          </Text>
        </View>

        {/* Historial de Recargas */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Historial de Recargas</Text>

          <View style={styles.historyList}>
            {historyData.map((item, index) => (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyTimeCol}>
                  <Text style={styles.historyTime}>{item.time}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <Text style={styles.historyAction}>{item.action}</Text>
                <Ionicons name="train" size={20} color="#111" />
                <Text style={styles.historyPoints}>{item.points}</Text>
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
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { paddingBottom: 20 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800", color: "#000", marginLeft: 4 },
  pointsEarned: { flexDirection: "row", alignItems: "center", gap: 6 },
  pointsValue: { fontSize: 14, fontWeight: "800", color: "#000" },
  pointsLabel: {
    fontSize: 12,
    color: "#333",
    textAlign: "right",
    marginTop: -4,
  },

  cardSection: { marginHorizontal: 20 },
  cardImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#000" },
  cardBalance: { fontSize: 14, color: "#333" },
  giftBalance: { fontSize: 14, color: "#333", marginBottom: 6 },
  autoRechargeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  autoRechargeText: { fontSize: 14, color: "#333", fontWeight: "500" },

  levelSection: { marginHorizontal: 20, marginTop: 25 },
  levelText: { fontSize: 14, color: "#000", marginBottom: 4 },
  rechargesText: {
    fontSize: 14,
    color: "#000",
    textAlign: "right",
    marginBottom: 8,
  },
  progressBarBackground: {
    width: "100%",
    height: 18,
    backgroundColor: "#A2C7B4",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#277855",
    borderRadius: 10,
  },
  unlockText: { fontSize: 10, color: "#555" },

  historySection: { marginHorizontal: 20, marginTop: 30 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: "#000",
    marginBottom: 15,
  },
  historyList: { gap: 12 },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  historyTimeCol: { width: 70 },
  historyTime: { fontSize: 12, fontWeight: "800", color: "#000" },
  historyDate: { fontSize: 10, color: "#555" },
  historyAction: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingHorizontal: 10,
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
    minWidth: 70,
    textAlign: "right",
  },
});
