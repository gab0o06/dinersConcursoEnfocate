import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useEcoStore } from "../store/useEcoStore";

interface Props {
  children: React.ReactNode;
}

export default function WebPresentationContainer({ children }: Props) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [useMobileFrame, setUseMobileFrame] = useState(true);

  const isRegistered = useEcoStore((s) => s.isRegistered);
  const setRegistered = useEcoStore((s) => s.setRegistered);

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && windowWidth >= 768;

  // Si no es web o es una pantalla pequeña (móvil real), renderizamos directo sin marco
  if (!isDesktop || !useMobileFrame) {
    if (isDesktop && !useMobileFrame) {
      return (
        <View style={styles.fullScreenWrapper}>
          <FloatingPitchControls
            isRegistered={isRegistered}
            onToggleRegistered={() => setRegistered(!isRegistered)}
            useMobileFrame={false}
            onToggleFrame={() => setUseMobileFrame(true)}
            onNavigate={(path) => router.push(path as any)}
          />
          <View style={styles.fullScreenContent}>{children}</View>
        </View>
      );
    }
    return <>{children}</>;
  }

  return (
    <View style={styles.backdrop}>
      {/* Barra de control superior para el pitch */}
      <View style={styles.pitchBar}>
        <View style={styles.branding}>
          <View style={styles.brandBadge}>
            <MaterialCommunityIcons name="leaf" size={16} color="#4ADE80" />
            <Text style={styles.brandTitle}>EcoClub × Diners Club</Text>
          </View>
          <Text style={styles.pitchSubtitle}>Pitch de Defensa Final</Text>
        </View>

        {/* Atajos rápidos para el expositor */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/(tabs)/home" as any)}
          >
            <Ionicons name="home" size={14} color="#E2E8F0" />
            <Text style={styles.navBtnText}>Home BLU</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/(tabs)/ecoclub" as any)}
          >
            <MaterialCommunityIcons name="leaf" size={14} color="#4ADE80" />
            <Text style={styles.navBtnText}>EcoClub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/(tabs)/ecoclub/eco-aliados" as any)}
          >
            <Ionicons name="storefront" size={14} color="#60A5FA" />
            <Text style={styles.navBtnText}>Eco-Aliados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/(tabs)/ecoclub/pago-blu" as any)}
          >
            <Ionicons name="card" size={14} color="#FBBF24" />
            <Text style={styles.navBtnText}>Pago BLU</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/(tabs)/ecoclub/recompensas" as any)}
          >
            <Ionicons name="gift" size={14} color="#F472B6" />
            <Text style={styles.navBtnText}>Canjes</Text>
          </TouchableOpacity>
        </View>

        {/* Controles de estado y vista */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[
              styles.stateToggleBtn,
              isRegistered ? styles.stateActive : styles.stateInactive,
            ]}
            onPress={() => setRegistered(!isRegistered)}
            title="Alterna entre vista de usuario nuevo (Capa 0) y registrado"
          >
            <MaterialCommunityIcons
              name={isRegistered ? "check-circle" : "compass-outline"}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.stateToggleText}>
              {isRegistered ? "Modo: Registrado" : "Modo: Capa 0 (Anzuelo)"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewModeBtn}
            onPress={() => setUseMobileFrame(false)}
            title="Expandir a pantalla completa"
          >
            <Ionicons name="expand" size={15} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenedor central simulador de Smartphone */}
      <View style={styles.centerContainer}>
        <View style={styles.phoneFrame}>
          {/* Bocina / Isla dinámica decorativa superior */}
          <View style={styles.phoneDynamicIsland}>
            <View style={styles.cameraDot} />
          </View>

          {/* Pantalla del dispositivo */}
          <View style={styles.phoneScreen}>{children}</View>

          {/* Barra de inicio inferior de iOS/Android */}
          <View style={styles.homeIndicator} />
        </View>
      </View>

      {/* Pie de página sutil con recordatorio de pitch */}
      <View style={styles.pitchFooter}>
        <Text style={styles.pitchFooterText}>
          Demostración Interactiva • Diners Club Ecuador × EcoClub MVP v4
        </Text>
      </View>
    </View>
  );
}

/** Controles flotantes en modo pantalla completa */
function FloatingPitchControls({
  isRegistered,
  onToggleRegistered,
  useMobileFrame,
  onToggleFrame,
  onNavigate,
}: {
  isRegistered: boolean;
  onToggleRegistered: () => void;
  useMobileFrame: boolean;
  onToggleFrame: () => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <View style={styles.floatingBar}>
      <TouchableOpacity
        style={styles.floatingNavBtn}
        onPress={() => onNavigate("/(tabs)/home")}
      >
        <Text style={styles.floatingNavText}>🏠 Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.floatingNavBtn}
        onPress={() => onNavigate("/(tabs)/ecoclub")}
      >
        <Text style={styles.floatingNavText}>🌿 EcoClub</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.floatingNavBtn}
        onPress={() => onNavigate("/(tabs)/ecoclub/pago-blu")}
      >
        <Text style={styles.floatingNavText}>💳 Pago</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.floatingStateBtn,
          isRegistered ? styles.stateActive : styles.stateInactive,
        ]}
        onPress={onToggleRegistered}
      >
        <Text style={styles.stateToggleText}>
          {isRegistered ? "Registrado" : "Capa 0"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.floatingNavBtn} onPress={onToggleFrame}>
        <Text style={styles.floatingNavText}>📱 Marco</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#07162C",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "100%",
  },
  pitchBar: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  branding: {
    flexDirection: "column",
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  pitchSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "500",
  },
  shortcutsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  navBtnText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stateToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stateActive: {
    backgroundColor: "#166534",
  },
  stateInactive: {
    backgroundColor: "#0369A1",
  },
  stateToggleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  viewModeBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 7,
    borderRadius: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    width: "100%",
  },
  phoneFrame: {
    width: 412,
    height: 840,
    maxHeight: "92vh" as any,
    backgroundColor: "#000000",
    borderRadius: 44,
    borderWidth: 8,
    borderColor: "#1E293B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.6,
    shadowRadius: 35,
    overflow: "hidden",
    position: "relative",
  },
  phoneDynamicIsland: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [{ translateX: -40 }],
    width: 80,
    height: 20,
    backgroundColor: "#000000",
    borderRadius: 12,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E293B",
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  homeIndicator: {
    position: "absolute",
    bottom: 6,
    left: "50%",
    transform: [{ translateX: -50 }],
    width: 100,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 2,
    zIndex: 9999,
  },
  pitchFooter: {
    paddingVertical: 10,
    alignItems: "center",
  },
  pitchFooterText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "500",
  },
  fullScreenWrapper: {
    flex: 1,
    position: "relative",
  },
  fullScreenContent: {
    flex: 1,
  },
  floatingBar: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 37, 64, 0.9)",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  floatingNavBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  floatingNavText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
  },
  floatingStateBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
