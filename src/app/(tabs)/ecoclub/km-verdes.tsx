import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
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

const STRAVA_CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET;

const stravaEndpoints = {
  authorizationEndpoint: "https://www.strava.com/oauth/mobile/authorize",
  tokenEndpoint: "https://www.strava.com/oauth/token",
  revocationEndpoint: "https://www.strava.com/oauth/deauthorize",
};

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
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Configuración de la sesión OAuth2
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "ecoclub",
  });

  console.log("Tu Redirect URI es:", redirectUri);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: STRAVA_CLIENT_ID as string,
      scopes: ["activity:read_all"],
      redirectUri,
    },
    stravaEndpoints,
  );

  // 1. Verificar si el usuario ya inició sesión previamente
  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(
          "strava_access_token",
        );
        if (storedToken) {
          setAccessToken(storedToken);
          fetchStravaActivities(storedToken);
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        setIsLoading(false);
      }
    };
    checkStoredToken();
  }, []);

  // 2. Escuchar la respuesta de inicio de sesión de Strava
  useEffect(() => {
    if (response?.type === "success" && response.params.code) {
      exchangeCodeForToken(response.params.code);
    }
  }, [response]);

  // Intercambiar el código recibido por los tokens del usuario
  const exchangeCodeForToken = async (code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(stravaEndpoints.tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
        }),
      });
      const data = await res.json();

      if (data.access_token) {
        await SecureStore.setItemAsync(
          "strava_access_token",
          data.access_token,
        );
        if (data.refresh_token) {
          await SecureStore.setItemAsync(
            "strava_refresh_token",
            data.refresh_token,
          );
        }
        setAccessToken(data.access_token);
        fetchStravaActivities(data.access_token);
      }
    } catch (error) {
      console.error("Error intercambiando token:", error);
      setIsLoading(false);
    }
  };

  // Consultar las actividades usando el token del usuario activo
  const fetchStravaActivities = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "https://www.strava.com/api/v3/athlete/activities?per_page=30",
        {
          headers: { Authorization: `Bearer ${token}` },
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

        setTotalKm(Number((totalMeters / 1000).toFixed(1)));
        setActivities(filtered);
      }
    } catch (error) {
      console.error("Error obteniendo actividades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar sesión de Strava
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("strava_access_token");
    await SecureStore.deleteItemAsync("strava_refresh_token");
    setAccessToken(null);
    setActivities([]);
    setTotalKm(0);
  };

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
    return `${mins}m ${seconds % 60}s`;
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

          {accessToken && (
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#D9534F" />
            </TouchableOpacity>
          )}
        </View>

        {/* Estado desconectado: Mostrar botón de Login */}
        {!accessToken ? (
          <View style={styles.loginContainer}>
            <Ionicons
              name="fitness-outline"
              size={60}
              color="#FC4C02"
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.loginTitle}>Sincroniza tus Km Verdes</Text>
            <Text style={styles.loginSub}>
              Conecta tu cuenta de Strava para registrar tus entrenamientos.
            </Text>

            <TouchableOpacity
              style={styles.connectButton}
              disabled={!request}
              onPress={() => promptAsync()}
            >
              <Text style={styles.connectButtonText}>Conectar con Strava</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Estado conectado: Mostrar estadísticas e historial */
          <>
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
                        name={
                          item.type === "Ride"
                            ? "bicycle-outline"
                            : "walk-outline"
                        }
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
          </>
        )}
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
  loginContainer: { alignItems: "center", padding: 30, marginTop: 40 },
  loginTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0A1C40",
    marginBottom: 8,
  },
  loginSub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  connectButton: {
    backgroundColor: "#FC4C02",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  connectButtonText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
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
  historySection: { marginTop: 30, paddingHorizontal: 20 },
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
  activityDetails: { flex: 1 },
  activityName: { fontSize: 15, fontWeight: "700", color: "#000" },
  activityDate: { fontSize: 12, color: "#666", marginTop: 2 },
  distanceBadge: {
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  distanceText: { fontSize: 14, fontWeight: "800", color: "#1E754C" },
});
