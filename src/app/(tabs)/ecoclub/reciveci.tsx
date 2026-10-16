import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import EcoHeader from "../../../components/EcoHeader";
import { useEcoStore } from "../../../store/useEcoStore";

// --- Componente del Medidor de Medio Arco ---
const HalfGauge = ({ current, max }: { current: number; max: number }) => {
  const size = 220;
  const strokeWidth = 35;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;

  const progressRatio = Math.min(current / max, 1);
  const strokeDashoffset =
    halfCircumference - halfCircumference * progressRatio;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size / 2 + strokeWidth / 2}>
        {/* Pista de fondo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          strokeDasharray={`${halfCircumference} ${circumference}`}
          rotation={180}
          origin={`${size / 2}, ${size / 2}`}
          fill="transparent"
        />
        {/* Borde sutil */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius + strokeWidth / 2}
          stroke="#EAEAEA"
          strokeWidth={1}
          strokeDasharray={`${halfCircumference + 3} ${circumference}`}
          rotation={180}
          origin={`${size / 2}, ${size / 2}`}
          fill="transparent"
        />
        {/* Progreso (Verde) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#277855"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={`${halfCircumference} ${circumference}`}
          strokeDashoffset={halfCircumference - strokeDashoffset}
          rotation={180}
          origin={`${size / 2}, ${size / 2}`}
          fill="transparent"
        />
      </Svg>
      {/* Texto Central */}
      <View style={styles.gaugeTextContainer}>
        <Text style={styles.gaugeValueText}>
          {current}/{max} kg
        </Text>
      </View>

      {/* Hojitas decorativas flotantes */}
      <Ionicons
        name="leaf-outline"
        size={20}
        color="#277855"
        style={[styles.floatingLeaf, { top: 10, left: 20, transform: [{ rotate: "-30deg" }] }]}
      />
      <Ionicons
        name="leaf-outline"
        size={16}
        color="#277855"
        style={[styles.floatingLeaf, { top: 40, right: 30, transform: [{ rotate: "45deg" }] }]}
      />
      <Ionicons
        name="leaf-outline"
        size={24}
        color="#277855"
        style={[styles.floatingLeaf, { bottom: -20, left: 10, transform: [{ rotate: "-70deg" }] }]}
      />
      <Ionicons
        name="leaf-outline"
        size={20}
        color="#277855"
        style={[styles.floatingLeaf, { bottom: -10, right: 10, transform: [{ rotate: "30deg" }] }]}
      />
    </View>
  );
};

export default function ReciVeciScreen() {
  const router = useRouter();

  // — Store —
  const addReciVeciDelivery = useEcoStore((s) => s.addReciVeciDelivery);
  const reciVeciKgTotal     = useEcoStore((s) => s.reciVeciKgTotal);
  const deliveries          = useEcoStore((s) => s.reciVeciDeliveries);

  // Meta semanal: 20 kg
  const metaKg = 20;
  const ecoPointsEarned = Math.floor(reciVeciKgTotal * 20); // 20 pts/kg

  const materialsData = [
    { id: "1", icon: "bottle-soda-outline", current: Math.min(reciVeciKgTotal * 0.3, 10), max: 10 },
    { id: "2", icon: "file-document-outline", current: Math.min(reciVeciKgTotal * 0.5, 10), max: 10 },
    { id: "3", icon: "recycle", current: Math.min(reciVeciKgTotal * 0.2, 10), max: 10 },
  ];

  const handleSchedulePickup = () => {
    // Simula una recolección de 2 kg de Papel y Plástico
    addReciVeciDelivery(2, ["Papel", "Plástico"]);
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
            <Text style={styles.title}>
              <Text style={{ fontWeight: "800" }}>ReciVeci</Text> - Recicla
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
                {ecoPointsEarned}{" "}
                <Text style={{ fontWeight: "400", fontSize: 12 }}>EcoPoints</Text>
              </Text>
              <Text style={styles.pointsLabel}>ganados</Text>
            </View>
          </View>
        </View>

        {/* Sección del Gráfico Central */}
        <View style={styles.progressSection}>
          <HalfGauge current={Math.min(reciVeciKgTotal, metaKg)} max={metaKg} />

          <Text style={styles.progressTitle}>Tu progreso de reciclaje</Text>
          <Text style={styles.progressSubtitle}>Meta semanal</Text>

          <Text style={styles.pointsWonText}>{ecoPointsEarned} EcoPoints ganados</Text>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={handleSchedulePickup}
          >
            <Text style={styles.actionButtonText}>Programar Recolección (+40 pts)</Text>
          </TouchableOpacity>
        </View>

        {/* Resumen de Materiales */}
        <View style={styles.materialsSection}>
          <Text style={styles.sectionTitle}>Resumen de Materiales</Text>
          <View style={styles.materialsRow}>
            {materialsData.map((item) => (
              <View key={item.id} style={styles.materialItem}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={48}
                  color="#000"
                />
                <View style={styles.materialProgressContainer}>
                  <View style={styles.materialProgressBar}>
                    <View
                      style={[
                        styles.materialProgressFill,
                        { width: `${(item.current / item.max) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.materialLabel}>
                    {item.current.toFixed(1)}/{item.max}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Entregas Confirmadas — datos reales del store */}
        <View style={styles.deliveriesSection}>
          <Text style={styles.sectionTitle}>Entregas Confirmadas</Text>
          <View style={styles.deliveriesCard}>
            {deliveries.length === 0 ? (
              <View style={styles.emptyDelivery}>
                <Text style={styles.emptyText}>
                  Programa tu primera recolección para ganar EcoPoints 🌱
                </Text>
              </View>
            ) : (
              [...deliveries].reverse().map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.deliveryRow,
                    index === deliveries.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.deliveryTimeCol}>
                    <Text style={styles.deliveryTime}>{formatTime(item.date)}</Text>
                    <Text style={styles.deliveryDate}>{formatDate(item.date)}</Text>
                  </View>
                  <Text style={styles.deliveryMaterial}>
                    {item.materials.join(", ")} {item.kg} kg
                  </Text>
                  <Text style={styles.deliveryPoints}>+{item.pointsEarned} pts</Text>
                </View>
              ))
            )}
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
    marginBottom: 15,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 20, color: "#000", marginLeft: 4 },
  pointsEarned: { flexDirection: "row", alignItems: "center", gap: 6 },
  pointsValue: { fontSize: 14, fontWeight: "800", color: "#000" },
  pointsLabel: { fontSize: 12, color: "#333", textAlign: "right", marginTop: -4 },

  progressSection: { alignItems: "center", marginHorizontal: 20, marginTop: 10 },
  gaugeContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 110,
  },
  gaugeTextContainer: { position: "absolute", bottom: -5, alignItems: "center" },
  gaugeValueText: { fontSize: 22, fontWeight: "800", color: "#000" },
  floatingLeaf: { position: "absolute" },

  progressTitle: { fontSize: 18, fontWeight: "800", color: "#000", marginTop: 25 },
  progressSubtitle: { fontSize: 12, fontWeight: "800", color: "#000", marginBottom: 15 },
  pointsWonText: { fontSize: 16, fontWeight: "800", color: "#000", marginBottom: 15 },

  actionButton: {
    backgroundColor: "#0A1C40",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  actionButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

  materialsSection: { marginHorizontal: 20, marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "400", color: "#000", marginBottom: 15 },
  materialsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  materialItem: { alignItems: "center", flex: 1 },
  materialProgressContainer: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 6 },
  materialProgressBar: {
    width: 40,
    height: 10,
    backgroundColor: "#E0F0E9",
    borderRadius: 5,
    overflow: "hidden",
  },
  materialProgressFill: { height: "100%", backgroundColor: "#2E8B57", borderRadius: 5 },
  materialLabel: { fontSize: 10, fontWeight: "800", color: "#000" },

  deliveriesSection: { marginHorizontal: 20, marginTop: 30 },
  deliveriesCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A2C7B4",
    overflow: "hidden",
  },
  emptyDelivery: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#666", textAlign: "center" },
  deliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#A2C7B4",
  },
  deliveryTimeCol: { flex: 1 },
  deliveryTime: { fontSize: 12, fontWeight: "800", color: "#000" },
  deliveryDate: { fontSize: 10, color: "#555" },
  deliveryMaterial: { flex: 1.5, fontSize: 12, color: "#333", textAlign: "center" },
  deliveryPoints: { flex: 1, fontSize: 12, fontWeight: "800", color: "#277855", textAlign: "right" },
});
