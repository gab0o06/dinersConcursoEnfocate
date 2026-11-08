import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Capa0DescubiertoCardProps {
  totalCo2Saved: number;
  potentialEcoPoints: number;
  potentialDollars: number;
  onRegister: () => void;
  onToggleDemoMode?: () => void;
  isRegistered?: boolean;
}

export default function Capa0DescubiertoCard({
  totalCo2Saved,
  potentialEcoPoints,
  potentialDollars,
  onRegister,
  onToggleDemoMode,
  isRegistered = false,
}: Capa0DescubiertoCardProps) {
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleActivate = () => {
    onRegister();
    setSuccessModalVisible(true);
  };

  return (
    <>
      <View style={styles.card}>
        {/* Cabecera Nivel Descubierto */}
        <View style={styles.headerRow}>
          <View style={styles.tagDescubierto}>
            <Ionicons name="search" size={12} color="#0B2046" />
            <Text style={styles.tagDescubiertoText}>
              CAPA 0 · NIVEL DESCUBIERTO
            </Text>
          </View>
          {onToggleDemoMode && (
            <TouchableOpacity
              onPress={onToggleDemoMode}
              style={styles.demoToggle}
              activeOpacity={0.7}
            >
              <Text style={styles.demoToggleText}>
                {isRegistered ? "Ver como no registrado" : "Demo: Capa 0 activa"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title}>
          Medición pasiva de tu huella Diners
        </Text>
        <Text style={styles.subtitle}>
          Calculamos automáticamente el CO₂ evitado en tus compras habituales con tarjeta.
        </Text>

        {/* Métricas destacadas */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <View style={styles.metricIconWrap}>
              <MaterialCommunityIcons name="leaf" size={20} color="#277855" />
            </View>
            <Text style={styles.metricValue}>
              {totalCo2Saved > 0 ? totalCo2Saved.toFixed(1) : "1.2"} kg
            </Text>
            <Text style={styles.metricLabel}>CO₂ evitado este mes</Text>
          </View>

          <View style={[styles.metricBox, styles.metricBoxPoints]}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="cash-outline" size={20} color="#1D4ED8" />
            </View>
            <Text style={[styles.metricValue, { color: "#1D4ED8" }]}>
              ${potentialDollars > 0 ? potentialDollars.toFixed(2) : "3.20"}
            </Text>
            <Text style={styles.metricLabel}>
              {potentialEcoPoints > 0 ? potentialEcoPoints : 320} pts listos para canje
            </Text>
          </View>
        </View>

        {/* Mensaje por arquetipo */}
        <View style={styles.messageBox}>
          <Ionicons
            name="sparkles"
            size={16}
            color="#277855"
            style={{ marginTop: 2 }}
          />
          <Text style={styles.messageText}>
            Tus compras en Metro de Quito y comercios aliados ya acumularon puntos retroactivos.{" "}
            <Text style={{ fontWeight: "700" }}>
              Activa EcoClub gratis para convertirlos en descuentos directos en tu factura Diners.
            </Text>
          </Text>
        </View>

        {/* Botón CTA de activación en 1 clic */}
        <TouchableOpacity
          style={styles.activateButton}
          onPress={handleActivate}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="shield-check" size={20} color="#FFFFFF" />
          <Text style={styles.activateButtonText}>
            Activar EcoClub sin costo (1 clic)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación de activación */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCelebrationIcon}>
              <MaterialCommunityIcons name="party-popper" size={32} color="#277855" />
            </View>
            <Text style={styles.modalTitle}>¡Bienvenido a EcoClub Diners!</Text>
            <Text style={styles.modalBody}>
              Has activado tu membresía en el nivel <Text style={{ fontWeight: "700" }}>🌱 Activado</Text>.
              Tus puntos retroactivos del mes han sido desbloqueados para canje en tu próxima factura y los 3 retos semanales están activos.
            </Text>

            <TouchableOpacity
              style={styles.modalOkButton}
              onPress={() => setSuccessModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalOkButtonText}>Comenzar a disfrutar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tagDescubierto: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagDescubiertoText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0B2046",
    letterSpacing: 0.5,
  },
  demoToggle: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  demoToggleText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0B2046",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 14,
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
  },
  metricBoxPoints: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },
  metricLabel: {
    fontSize: 10,
    color: "#4B5563",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  messageBox: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  messageText: {
    flex: 1,
    fontSize: 11,
    color: "#334155",
    lineHeight: 16,
  },
  activateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#277855",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    shadowColor: "#277855",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  activateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  modalCelebrationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2046",
    textAlign: "center",
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  modalOkButton: {
    backgroundColor: "#277855",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  modalOkButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
