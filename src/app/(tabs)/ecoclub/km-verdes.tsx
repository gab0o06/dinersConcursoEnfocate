import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EcoHeader from "../../../components/EcoHeader";

// Lee el token directamente de tus variables de entorno
const STRAVA_ACCESS_TOKEN = process.env.EXPO_PUBLIC_STRAVA_ACCESS_TOKEN;

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
}
export default function KmVerdesScreen() {
  const router = useRouter();
  const [totalKm, setTotalKm] = useState(0);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStravaActivities = async () => {
      try {
        const res = await fetch(
          "https://www.strava.com/api/v3/athlete/activities?per_page=30",
          {
            headers: { Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}` },
          },
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          const filtered = data.filter(
            (act) =>
              act.type === "Run" || act.type === "Walk" || act.type === "Ride",
          );

          const totalMeters = filtered.reduce(
            (acc, curr) => acc + curr.distance,
            0,
          );

          if (isMounted) {
            setTotalKm(Number((totalMeters / 1000).toFixed(1)));
            setActivities(filtered);
          }
        }
      } catch (error) {
        console.error("Error obteniendo actividades:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStravaActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-EC", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Ride":
        return "bicycle-outline";
      case "Run":
        return "fitness-outline";
      default:
        return "walk-outline";
    }
  };

  const metaKm = 35;
  const progressPercentage = Math.min((totalKm / metaKm) * 100, 100);

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
        </View>

        <View style={styles.statsContainer}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#1E754C"
              style={{ marginVertical: 20 }}
            />
          ) : (
            <>
              <Text style={styles.kmSummary}>
                {totalKm} / {metaKm}
              </Text>
              <Text style={styles.kmLabel}>Km recorridos (Strava)</Text>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` },
                  ]}
                />
              </View>
            </>
          )}
        </View>

        {/* Sección de Historial de Actividades */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Actividades Recientes</Text>

          {isLoading ? (
            <ActivityIndicator size="small" color="#1E754C" />
          ) : activities.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay actividades registradas.
            </Text>
          ) : (
            activities.map((item) => (
              <View key={item.id} style={styles.activityCard}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={getActivityIcon(item.type)}
                    size={24}
                    color="#1E754C"
                  />
                </View>

                <View style={styles.activityDetails}>
                  <Text style={styles.activityName}>{item.name}</Text>
                  <Text style={styles.activityDate}>
                    {formatDate(item.start_date_local)} •{" "}
                    {formatDuration(item.moving_time)}
                  </Text>
                </View>

                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {(item.distance / 1000).toFixed(2)} km
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { paddingBottom: 30 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 20, color: "#000", marginLeft: 4 },
  statsContainer: {
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    minHeight: 100,
    justifyContent: "center",
  },
  kmSummary: { fontSize: 24, fontWeight: "800", color: "#000" },
  kmLabel: { fontSize: 14, fontWeight: "800", color: "#000", marginBottom: 15 },
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
  historySection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A1C40",
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E754C",
  },
});
