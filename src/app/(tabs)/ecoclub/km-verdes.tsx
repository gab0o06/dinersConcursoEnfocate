import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import EcoHeader from "../../../components/EcoHeader";
import { ECOCLUB } from "../../../config/ecoclub.config";
import { useTourHighlight } from "../../../hooks/useTourHighlight";
import { useTourScroll } from "../../../hooks/useTourScroll";
import { co2ToEquivalence } from "../../../lib/co2";
import { deleteSecureItem, getSecureItem, setSecureItem } from "../../../lib/storage";
import { useEcoStore } from "../../../store/useEcoStore";

// OBLIGATORIO: Cierra el navegador al recibir la respuesta de Strava
WebBrowser.maybeCompleteAuthSession();

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

// Actividades de demostración para exploración inmediata y UX enriquecida
const DEMO_ACTIVITIES: StravaActivity[] = [
  {
    id: 101,
    name: "Ciclopaseo Chaquiñán Cumbayá",
    type: "Ride",
    distance: 16800, // 16.8 km
    moving_time: 3120, // 52m
    start_date_local: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 102,
    name: "Trote matutino Parque La Carolina",
    type: "Run",
    distance: 7400, // 7.4 km
    moving_time: 2460, // 41m
    start_date_local: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 103,
    name: "Caminata activa al trabajo",
    type: "Walk",
    distance: 4200, // 4.2 km
    moving_time: 3180, // 53m
    start_date_local: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 104,
    name: "Ruta Parque Metropolitano Guangüiltagua",
    type: "Ride",
    distance: 10600, // 10.6 km
    moving_time: 2280, // 38m
    start_date_local: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
];

type FilterType = "ALL" | "Ride" | "Run" | "Walk";

/**
 * Medidor circular de arco para los Km Verdes
 */
function CircularKmGauge({
  currentKm,
  metaKm,
}: {
  currentKm: number;
  metaKm: number;
}) {
  const size = 210;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const angle = 270;
  const arcLength = (circumference * angle) / 360;

  const progressRatio = Math.min(Math.max(currentKm / metaKm, 0), 1);
  const strokeDashoffset = arcLength - arcLength * progressRatio;
  const rotate = `rotate(135 ${size / 2} ${size / 2})`;
  const progressPct = Math.round((currentKm / metaKm) * 100);

  return (
    <View style={styles.gaugeWrapper}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="kmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#34D399" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>
        </Defs>

        {/* Pista de fondo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={rotate}
          fill="transparent"
        />

        {/* Pista de progreso animada visualmente */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#kmGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={circumference - arcLength + strokeDashoffset}
          transform={rotate}
          fill="transparent"
        />
      </Svg>

      {/* Contenido en el centro del medidor */}
      <View style={styles.gaugeCenter}>
        <View style={styles.gaugeKmRow}>
          <Text style={styles.gaugeKmNumber}>{currentKm.toFixed(1)}</Text>
          <Text style={styles.gaugeKmUnit}>km</Text>
        </View>

        <Text style={styles.gaugeGoalSub}>
          de {metaKm} km objetivo mensual
        </Text>

        <View
          style={[
            styles.gaugePctPill,
            progressPct >= 100 ? styles.gaugePctPillSuccess : null,
          ]}
        >
          <Ionicons
            name={progressPct >= 100 ? "trophy" : "flash"}
            size={12}
            color={progressPct >= 100 ? "#F59E0B" : "#34D399"}
          />
          <Text
            style={[
              styles.gaugePctText,
              progressPct >= 100 && styles.gaugePctTextSuccess,
            ]}
          >
            {progressPct >= 100
              ? "¡Meta cumplida!"
              : `${progressPct}% del reto`}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function KmVerdesScreen() {
  const router = useRouter();
  const stravaTarget = useTourHighlight("strava-connection-section");
  const tourScroll = useTourScroll();

  // — Store global —
  const addStravaPoints = useEcoStore((s) => s.addStravaPoints);
  const updateStravaState = useEcoStore((s) => s.updateStravaState);
  const disconnectStrava = useEcoStore((s) => s.disconnectStrava);
  const stravaStore = useEcoStore((s) => s.strava);

  // — Estado local de UI —
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(!stravaStore.accessToken);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(
    stravaStore.accessToken,
  );
  const [activities, setActivities] = useState<StravaActivity[]>(
    stravaStore.activities,
  );
  const [totalKm, setTotalKm] = useState<number>(stravaStore.totalKm);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "ecoclub",
    path: "ecoclub/km-verdes",
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: (STRAVA_CLIENT_ID as string) || "",
      scopes: ["activity:read_all"],
      redirectUri,
    },
    stravaEndpoints,
  );

  const fetchStravaActivities = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "https://www.strava.com/api/v3/athlete/activities?per_page=30",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        const filtered = data.filter(
          (act) => act.type === "Run" || act.type === "Walk" || act.type === "Ride",
        );
        const totalMeters = filtered.reduce((acc, curr) => acc + curr.distance, 0);
        const km = Number((totalMeters / 1000).toFixed(1));

        setTotalKm(km);
        setActivities(filtered);

        // — Actualizar el store global —
        addStravaPoints(km);
        updateStravaState({ accessToken: token, activities: filtered, totalKm: km });
      }
    } catch (error) {
      console.error("Error obteniendo actividades de Strava:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

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
        await setSecureItem("strava_access_token", data.access_token);
        if (data.refresh_token) {
          await setSecureItem("strava_refresh_token", data.refresh_token);
        }
        setAccessToken(data.access_token);
        fetchStravaActivities(data.access_token);
      }
    } catch (error) {
      console.error("Error intercambiando token:", error);
      setIsLoading(false);
    }
  };

  // 1. Verificar token almacenado al iniciar
  useEffect(() => {
    if (stravaStore.accessToken) {
      setIsLoading(false);
      return;
    }
    const checkStoredToken = async () => {
      try {
        const storedToken = await getSecureItem("strava_access_token");
        if (storedToken) {
          setAccessToken(storedToken);
          fetchStravaActivities(storedToken);
        } else {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    };
    checkStoredToken();
  }, []);

  // 2. Escuchar respuesta del OAuth de Strava
  useEffect(() => {
    if (response?.type === "success" && response.params.code) {
      exchangeCodeForToken(response.params.code);
    }
  }, [response]);

  const handleLogout = async () => {
    Alert.alert(
      "Desconectar Strava",
      "¿Deseas desvincular tu cuenta de Strava de EcoClub?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desconectar",
          style: "destructive",
          onPress: async () => {
            await deleteSecureItem("strava_access_token");
            await deleteSecureItem("strava_refresh_token");
            setAccessToken(null);
            setActivities([]);
            setTotalKm(0);
            setIsDemoMode(false);
            disconnectStrava();
          },
        },
      ],
    );
  };

  const handleManualRefresh = () => {
    if (accessToken) {
      setIsRefreshing(true);
      fetchStravaActivities(accessToken);
    }
  };

  const toggleDemoMode = () => {
    if (!isDemoMode) {
      setIsDemoMode(true);
      const demoKm = Number(
        (
          DEMO_ACTIVITIES.reduce((acc, a) => acc + a.distance, 0) / 1000
        ).toFixed(1),
      );
      setTotalKm(demoKm);
      setActivities(DEMO_ACTIVITIES);
    } else {
      setIsDemoMode(false);
      if (accessToken) {
        fetchStravaActivities(accessToken);
      } else {
        setTotalKm(0);
        setActivities([]);
      }
    }
  };

  // Datos efectivos a mostrar (demo o real)
  const isConnected = !!accessToken || isDemoMode;
  const effectiveActivities = isConnected
    ? isDemoMode
      ? DEMO_ACTIVITIES
      : activities
    : [];

  const effectiveTotalKm = isConnected
    ? isDemoMode
      ? Number(
          (
            DEMO_ACTIVITIES.reduce((acc, a) => acc + a.distance, 0) / 1000
          ).toFixed(1),
        )
      : totalKm
    : 0;

  // Filtrado de actividades
  const filteredActivities = useMemo(() => {
    if (selectedFilter === "ALL") return effectiveActivities;
    return effectiveActivities.filter((act) => act.type === selectedFilter);
  }, [effectiveActivities, selectedFilter]);

  // Contadores por tipo de deporte
  const rideCount = effectiveActivities.filter((a) => a.type === "Ride").length;
  const runCount = effectiveActivities.filter((a) => a.type === "Run").length;
  const walkCount = effectiveActivities.filter((a) => a.type === "Walk").length;

  // Cálculos de impacto ecológico y deportivo
  const metaKm = ECOCLUB.retos.stravaMetaKm;
  const ecoPointsEarned = Math.floor(
    effectiveTotalKm * ECOCLUB.retos.stravaPtsPorKm,
  );
  const co2AvoidedKg = Number((effectiveTotalKm * 0.18).toFixed(1));
  const totalSecondsMoving = effectiveActivities.reduce(
    (acc, a) => acc + a.moving_time,
    0,
  );
  const totalHours = Math.floor(totalSecondsMoving / 3600);
  const totalMins = Math.floor((totalSecondsMoving % 3600) / 60);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-EC", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    }
    return `${mins}m ${seconds % 60}s`;
  };

  const getActivityTypeDetails = (type: string) => {
    switch (type) {
      case "Ride":
        return {
          label: "Ciclismo",
          iconName: "bicycle-outline" as const,
          bgColor: "#E8F8F0",
          iconColor: "#059669",
        };
      case "Run":
        return {
          label: "Running",
          iconName: "walk-outline" as const,
          bgColor: "#FFF3E0",
          iconColor: "#EA580C",
        };
      case "Walk":
      default:
        return {
          label: "Caminata",
          iconName: "footsteps-outline" as const,
          bgColor: "#E0F2FE",
          iconColor: "#0284C7",
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <EcoHeader
        BellIcon={
          <Ionicons name="notifications-outline" size={24} color="#0A1C40" />
        }
        UserIcon={<Ionicons name="person-outline" size={24} color="#0A1C40" />}
      />

      <ScrollView
        {...tourScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Cabecera de Navegación y Estado */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/ecoclub")}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#0A1C40" />
            <Text style={styles.screenHeading}>
              <Text style={{ fontWeight: "800" }}>Km Verdes</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.topActions}>
            {isConnected && (
              <>
                <TouchableOpacity
                  onPress={handleManualRefresh}
                  style={styles.iconCircleBtn}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <Ionicons name="sync-outline" size={19} color="#0A1C40" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogout}
                  style={[styles.iconCircleBtn, { marginLeft: 8 }]}
                >
                  <Ionicons name="log-out-outline" size={19} color="#DC2626" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Barra de estado conmutador para pruebas / sincronización */}
        <View style={styles.statusBarWrapper}>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? "#10B981" : "#F59E0B" },
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected
                ? isDemoMode
                  ? "Modo demostración activo"
                  : "Sincronizado con Strava"
                : "Sin cuenta vinculada"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={toggleDemoMode}
            style={[
              styles.demoTogglePill,
              isDemoMode && styles.demoTogglePillActive,
            ]}
          >
            <Ionicons
              name={isDemoMode ? "eye" : "eye-outline"}
              size={13}
              color={isDemoMode ? "#FFFFFF" : "#4B5563"}
            />
            <Text
              style={[
                styles.demoToggleText,
                isDemoMode && styles.demoToggleTextActive,
              ]}
            >
              {isDemoMode ? "Simulación ON" : "Probar Demo"}
            </Text>
          </TouchableOpacity>
        </View>

        {!isConnected ? (
          /* ==========================================================
             ESTADO NO CONECTADO: UX Inspiradora y de Alta Conversión
             ========================================================== */
          <View style={styles.welcomeCard} {...stravaTarget}>
            {/* Cabecera con isotipos integrados */}
            <View style={styles.brandLogosRow}>
              <View style={styles.stravaLogoCircle}>
                <Ionicons name="fitness" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.connectorLine} />
              <View style={styles.ecoLogoCircle}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={32}
                  color="#FFFFFF"
                  style={{ transform: [{ scaleX: -1 }] }}
                />
              </View>
            </View>

            <Text style={styles.welcomeTitle}>
              Tus pasos y pedaleos convertidos en EcoPoints
            </Text>

            <Text style={styles.welcomeDesc}>
              Conecta tu cuenta de Strava para registrar tus actividades
              deportivas y de movilidad limpia. Cada kilómetro te acerca a nuevos
              beneficios sostenibles Diners Club.
            </Text>

            {/* Tarjetas de Beneficios */}
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={[styles.benefitIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="leaf" size={20} color="#059669" />
                </View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitle}>5 EcoPoints por cada Km</Text>
                  <Text style={styles.benefitSub}>
                    Caminar, trotar o pedalear acumula puntos directos a tu estado de cuenta.
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={[styles.benefitIconBox, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons name="globe-outline" size={20} color="#2563EB" />
                </View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitle}>Impacto de CO₂ en tiempo real</Text>
                  <Text style={styles.benefitSub}>
                    Mide cuánto dióxido de carbono ahorras frente a vehículos a combustión.
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={[styles.benefitIconBox, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="trophy-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.benefitTextBox}>
                  <Text style={styles.benefitTitle}>Reto mensual de 35 Km</Text>
                  <Text style={styles.benefitSub}>
                    Supera la meta mensual y desbloquea multiplicadores de puntos y millas.
                  </Text>
                </View>
              </View>
            </View>

            {/* Botón de Conexión Strava */}
            <TouchableOpacity
              style={styles.stravaAuthButton}
              disabled={!request}
              onPress={() => promptAsync()}
              activeOpacity={0.85}
            >
              <Ionicons name="fitness-outline" size={22} color="#FFFFFF" />
              <Text style={styles.stravaAuthButtonText}>
                Conectar con Strava
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoSampleButton}
              onPress={toggleDemoMode}
              activeOpacity={0.7}
            >
              <Text style={styles.demoSampleButtonText}>
                Ver demostración con actividades de muestra
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ==========================================================
             ESTADO CONECTADO: Centro de Movilidad y Dashboard Dinámico
             ========================================================== */
          <>
            {/* HERO CARD: Medidor Visual Principal de Kilómetros */}
            <View style={styles.heroCard} {...stravaTarget}>
              <View style={styles.heroHeader}>
                <View style={styles.heroBadge}>
                  <Ionicons name="bicycle" size={16} color="#34D399" />
                  <Text style={styles.heroBadgeText}>Movilidad Sostenible</Text>
                </View>
                <Text style={styles.heroStravaTag}>Strava Sync</Text>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#34D399" />
                  <Text style={styles.loadingText}>
                    Sincronizando tus entrenamientos...
                  </Text>
                </View>
              ) : (
                <>
                  {/* Gráfico circular con métricas integradas */}
                  <CircularKmGauge
                    currentKm={effectiveTotalKm}
                    metaKm={metaKm}
                  />

                  {/* Barra de Hitos y Recompensas del Reto */}
                  <View style={styles.milestonesSection}>
                    <View style={styles.milestoneBarTrack}>
                      <View
                        style={[
                          styles.milestoneBarFill,
                          {
                            width: `${Math.min(
                              (effectiveTotalKm / metaKm) * 100,
                              100,
                            )}%`,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.milestonesTicks}>
                      <View style={styles.milestoneTickItem}>
                        <View
                          style={[
                            styles.tickCircle,
                            effectiveTotalKm >= 10 && styles.tickCircleActive,
                          ]}
                        >
                          <Ionicons
                            name={
                              effectiveTotalKm >= 10
                                ? "checkmark"
                                : "leaf-outline"
                            }
                            size={10}
                            color={
                              effectiveTotalKm >= 10 ? "#FFFFFF" : "#6B7280"
                            }
                          />
                        </View>
                        <Text style={styles.tickLabel}>10 km</Text>
                      </View>

                      <View style={styles.milestoneTickItem}>
                        <View
                          style={[
                            styles.tickCircle,
                            effectiveTotalKm >= 20 && styles.tickCircleActive,
                          ]}
                        >
                          <Ionicons
                            name={
                              effectiveTotalKm >= 20
                                ? "checkmark"
                                : "flash-outline"
                            }
                            size={10}
                            color={
                              effectiveTotalKm >= 20 ? "#FFFFFF" : "#6B7280"
                            }
                          />
                        </View>
                        <Text style={styles.tickLabel}>20 km</Text>
                      </View>

                      <View style={styles.milestoneTickItem}>
                        <View
                          style={[
                            styles.tickCircle,
                            effectiveTotalKm >= metaKm &&
                              styles.tickCircleActiveGoal,
                          ]}
                        >
                          <Ionicons
                            name={
                              effectiveTotalKm >= metaKm
                                ? "trophy"
                                : "flag-outline"
                            }
                            size={10}
                            color={
                              effectiveTotalKm >= metaKm
                                ? "#FFFFFF"
                                : "#6B7280"
                            }
                          />
                        </View>
                        <Text
                          style={[
                            styles.tickLabel,
                            effectiveTotalKm >= metaKm &&
                              styles.tickLabelActiveGoal,
                          ]}
                        >
                          {metaKm} km 🏆
                        </Text>
                      </View>
                    </View>

                    <View style={styles.goalFeedbackRow}>
                      <Ionicons
                        name="sparkles"
                        size={14}
                        color="#FBBF24"
                      />
                      <Text style={styles.goalFeedbackText}>
                        {effectiveTotalKm >= metaKm
                          ? "¡Felicidades! Has completado el reto mensual de movilidad limpia."
                          : `Te faltan solo ${(metaKm - effectiveTotalKm).toFixed(1)} km para alcanzar la meta y bonus del mes.`}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* DASHBOARD DE IMPACTO (4 Tarjetas Clave) */}
            <View style={styles.impactGrid}>
              {/* Tarjeta 1: EcoPoints */}
              <View style={styles.impactCard}>
                <View
                  style={[
                    styles.impactIconBubble,
                    { backgroundColor: "#ECFDF5" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="leaf"
                    size={20}
                    color="#059669"
                    style={{ transform: [{ scaleX: -1 }] }}
                  />
                </View>
                <Text style={styles.impactValue}>+{ecoPointsEarned}</Text>
                <Text style={styles.impactLabel}>EcoPoints ganados</Text>
                <Text style={styles.impactEquiv}>
                  5 pts por km recorrido
                </Text>
              </View>

              {/* Tarjeta 2: CO2 Evitado */}
              <View style={styles.impactCard}>
                <View
                  style={[
                    styles.impactIconBubble,
                    { backgroundColor: "#EFF6FF" },
                  ]}
                >
                  <Ionicons name="earth" size={20} color="#2563EB" />
                </View>
                <Text style={styles.impactValue}>{co2AvoidedKg} kg</Text>
                <Text style={styles.impactLabel}>CO₂ evitado</Text>
                <Text style={styles.impactEquiv}>
                  {co2ToEquivalence(co2AvoidedKg)}
                </Text>
              </View>

              {/* Tarjeta 3: Tiempo Activo */}
              <View style={styles.impactCard}>
                <View
                  style={[
                    styles.impactIconBubble,
                    { backgroundColor: "#FFF7ED" },
                  ]}
                >
                  <Ionicons name="time" size={20} color="#EA580C" />
                </View>
                <Text style={styles.impactValue}>
                  {totalHours > 0 ? `${totalHours}h ` : ""}
                  {totalMins}m
                </Text>
                <Text style={styles.impactLabel}>Tiempo activo</Text>
                <Text style={styles.impactEquiv}>
                  {effectiveActivities.length} sesiones este mes
                </Text>
              </View>

              {/* Tarjeta 4: Valor EcoClub */}
              <View style={styles.impactCard}>
                <View
                  style={[
                    styles.impactIconBubble,
                    { backgroundColor: "#F5F3FF" },
                  ]}
                >
                  <Ionicons name="wallet-outline" size={20} color="#7C3AED" />
                </View>
                <Text style={styles.impactValue}>
                  ${(ecoPointsEarned * ECOCLUB.valorPuntoUSD).toFixed(2)}
                </Text>
                <Text style={styles.impactLabel}>Valor en canje</Text>
                <Text style={styles.impactEquiv}>
                  Diners Club rewards
                </Text>
              </View>
            </View>

            {/* SECCIÓN DE HISTORIAL Y FILTROS */}
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>
                  Actividades Registradas
                </Text>
                <Text style={styles.sectionCounter}>
                  {filteredActivities.length} de {effectiveActivities.length}
                </Text>
              </View>

              {/* Píldoras de Filtro por Deporte */}
              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilter === "ALL" && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter("ALL")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === "ALL" && styles.filterChipTextActive,
                    ]}
                  >
                    Todas ({effectiveActivities.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilter === "Ride" && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter("Ride")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="bicycle"
                    size={14}
                    color={selectedFilter === "Ride" ? "#FFFFFF" : "#4B5563"}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === "Ride" && styles.filterChipTextActive,
                    ]}
                  >
                    Bici ({rideCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilter === "Run" && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter("Run")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="walk"
                    size={14}
                    color={selectedFilter === "Run" ? "#FFFFFF" : "#4B5563"}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === "Run" && styles.filterChipTextActive,
                    ]}
                  >
                    Run ({runCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedFilter === "Walk" && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter("Walk")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="footsteps"
                    size={14}
                    color={selectedFilter === "Walk" ? "#FFFFFF" : "#4B5563"}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === "Walk" && styles.filterChipTextActive,
                    ]}
                  >
                    Caminata ({walkCount})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Listado de Actividades */}
              {isLoading ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="small" color="#059669" />
                </View>
              ) : filteredActivities.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Ionicons
                    name="trail-sign-outline"
                    size={42}
                    color="#9CA3AF"
                  />
                  <Text style={styles.emptyTitle}>
                    No hay actividades registradas en esta categoría
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Realiza un entrenamiento con Strava para sumar Km Verdes y
                    EcoPoints.
                  </Text>
                </View>
              ) : (
                filteredActivities.map((item) => {
                  const details = getActivityTypeDetails(item.type);
                  const actKm = Number((item.distance / 1000).toFixed(2));
                  const actPts = Math.floor(
                    actKm * ECOCLUB.retos.stravaPtsPorKm,
                  );
                  const actCo2 = (actKm * 0.18).toFixed(1);

                  return (
                    <View key={item.id} style={styles.activityCard}>
                      {/* Icono de Tipo */}
                      <View
                        style={[
                          styles.activityIconBox,
                          { backgroundColor: details.bgColor },
                        ]}
                      >
                        <Ionicons
                          name={details.iconName}
                          size={22}
                          color={details.iconColor}
                        />
                      </View>

                      {/* Detalles del Entrenamiento */}
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle} numberOfLines={1}>
                          {item.name}
                        </Text>

                        <Text style={styles.activityDate}>
                          {formatDate(item.start_date_local)}
                        </Text>

                        <View style={styles.activityTagsRow}>
                          <View style={styles.tagItem}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color="#6B7280"
                            />
                            <Text style={styles.tagText}>
                              {formatDuration(item.moving_time)}
                            </Text>
                          </View>

                          <View style={styles.tagItem}>
                            <Ionicons
                              name="leaf-outline"
                              size={12}
                              color="#059669"
                            />
                            <Text
                              style={[styles.tagText, { color: "#059669" }]}
                            >
                              -{actCo2} kg CO₂
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Kilómetros y Puntos */}
                      <View style={styles.activityRightBadge}>
                        <Text style={styles.activityKmText}>{actKm} km</Text>
                        <View style={styles.pointsPill}>
                          <Text style={styles.pointsPillText}>
                            +{actPts} pts
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scroll: {
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  screenHeading: {
    fontSize: 20,
    color: "#0A1C40",
    marginLeft: 6,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  statusBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  demoTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  demoTogglePillActive: {
    backgroundColor: "#059669",
  },
  demoToggleText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "700",
  },
  demoToggleTextActive: {
    color: "#FFFFFF",
  },

  /* --- Welcome / Unauthenticated Screen --- */
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  brandLogosRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  stravaLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FC4C02",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FC4C02",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  connectorLine: {
    width: 32,
    height: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  ecoLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0A1C40",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 26,
  },
  welcomeDesc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  benefitsList: {
    width: "100%",
    marginBottom: 24,
    gap: 14,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitTextBox: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A1C40",
  },
  benefitSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  stravaAuthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FC4C02",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#FC4C02",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stravaAuthButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  demoSampleButton: {
    marginTop: 14,
    paddingVertical: 8,
  },
  demoSampleButtonText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "700",
  },

  /* --- Hero Card (Dark Luxury Emerald) --- */
  heroCard: {
    backgroundColor: "#072019",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 22,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.25)",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "700",
  },
  heroStravaTag: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 10,
  },

  /* --- Gauge Styles --- */
  gaugeWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 4,
  },
  gaugeCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeKmRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  gaugeKmNumber: {
    fontSize: 44,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  gaugeKmUnit: {
    fontSize: 20,
    fontWeight: "800",
    color: "#34D399",
  },
  gaugeGoalSub: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: -2,
    marginBottom: 8,
  },
  gaugePctPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gaugePctPillSuccess: {
    backgroundColor: "rgba(245, 158, 11, 0.25)",
  },
  gaugePctText: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "800",
  },
  gaugePctTextSuccess: {
    color: "#FBBF24",
  },

  /* --- Milestones Section --- */
  milestonesSection: {
    marginTop: 12,
  },
  milestoneBarTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 4,
    overflow: "hidden",
  },
  milestoneBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  milestonesTicks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  milestoneTickItem: {
    alignItems: "center",
  },
  tickCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tickCircleActive: {
    backgroundColor: "#059669",
  },
  tickCircleActiveGoal: {
    backgroundColor: "#D97706",
  },
  tickLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  tickLabelActiveGoal: {
    color: "#FBBF24",
    fontWeight: "700",
  },
  goalFeedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 14,
  },
  goalFeedbackText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    lineHeight: 16,
  },

  /* --- Impact Grid (2x2) --- */
  impactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  impactCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  impactIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0A1C40",
  },
  impactLabel: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
    marginTop: 1,
  },
  impactEquiv: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },

  /* --- History & Filter Tabs --- */
  historySection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A1C40",
  },
  sectionCounter: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  filterPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#0A1C40",
    borderColor: "#0A1C40",
  },
  filterChipText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyStateContainer: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },

  /* --- Activity Cards --- */
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A1C40",
  },
  activityDate: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  activityTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tagText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  activityRightBadge: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  activityKmText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0A1C40",
  },
  pointsPill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  pointsPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#059669",
  },
});
