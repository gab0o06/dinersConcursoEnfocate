import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import rawSeasons from "../data/mock/temporadas.json";
import { getActiveSeason, parseSeasonConfig, type Season } from "../lib/seasons";

interface SeasonBannerProps {
  /** Fecha de referencia para evaluar si hay una temporada activa (default: hoy) */
  referenceDate?: Date;
  /** Estilo o variante visual */
  variant?: "default" | "compact";
  /** Si se presiona un botón secundario */
  onPressRetos?: () => void;
}

export default function SeasonBanner({
  referenceDate = new Date(),
  variant = "default",
  onPressRetos,
}: SeasonBannerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const activeSeason = useMemo<Season | null>(() => {
    const parsedList: Season[] = [];
    if (Array.isArray(rawSeasons)) {
      for (const item of rawSeasons) {
        const parsed = parseSeasonConfig(item);
        if (parsed) parsedList.push(parsed);
      }
    }
    return getActiveSeason(parsedList, referenceDate);
  }, [referenceDate]);

  if (!activeSeason) {
    return null;
  }

  const { banner, multiplicadoresMcc, retosEspeciales, inicio, fin, rankingGrupal } =
    activeSeason;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <View style={styles.badgePulse}>
              <View style={styles.pulseDot} />
              <Text style={styles.badgePulseText}>CAMPAÑA ACTIVA</Text>
            </View>
            <Text style={styles.title}>{banner.titulo}</Text>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={20} color="#277855" />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>{banner.descripcion}</Text>

        {/* Multiplicadores MCC Activos */}
        <View style={styles.multipliersRow}>
          {multiplicadoresMcc[4111] && (
            <View style={styles.multiplierPill}>
              <Ionicons name="train" size={13} color="#277855" />
              <Text style={styles.multiplierPillText}>
                Metro {multiplicadoresMcc[4111]}×
              </Text>
            </View>
          )}

          {multiplicadoresMcc[5999] && (
            <View style={styles.multiplierPill}>
              <Ionicons name="storefront" size={13} color="#277855" />
              <Text style={styles.multiplierPillText}>
                Eco-Aliados {multiplicadoresMcc[5999]}×
              </Text>
            </View>
          )}

          {retosEspeciales.length > 0 && (
            <View style={[styles.multiplierPill, styles.specialPill]}>
              <MaterialCommunityIcons name="flag-checkered" size={13} color="#D97706" />
              <Text style={[styles.multiplierPillText, { color: "#B45309" }]}>
                {retosEspeciales[0].nombre}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.ctaRow}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Ver multiplicadores y condiciones</Text>
          <Ionicons name="chevron-forward" size={14} color="#277855" />
        </TouchableOpacity>
      </View>

      {/* Modal explicativo de la temporada */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#666" />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="sparkles" size={24} color="#277855" />
              </View>
              <Text style={styles.modalTitle}>{activeSeason.nombre}</Text>
              <Text style={styles.modalDates}>
                Vigencia: {inicio} al {fin}
              </Text>
            </View>

            <Text style={styles.modalSectionTitle}>Multiplicadores Automáticos</Text>
            <View style={styles.benefitList}>
              <View style={styles.benefitItem}>
                <Ionicons name="train-outline" size={18} color="#277855" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitItemTitle}>
                    Metro de Quito (MCC 4111) · 2× EcoPoints
                  </Text>
                  <Text style={styles.benefitItemDesc}>
                    Duplica tus puntos en cada recarga automática con Diners Club.
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="storefront-outline" size={18} color="#277855" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitItemTitle}>
                    Comercios Eco-Aliados (MCC 5999) · 1.5× extra
                  </Text>
                  <Text style={styles.benefitItemDesc}>
                    Multiplicador estacional aplicado en tus compras sostenibles.
                  </Text>
                </View>
              </View>

              {retosEspeciales.length > 0 && (
                <View style={styles.benefitItem}>
                  <Ionicons name="bicycle-outline" size={18} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.benefitItemTitle}>
                      Reto: {retosEspeciales[0].nombre} (+{retosEspeciales[0].ptsMeta} pts)
                    </Text>
                    <Text style={styles.benefitItemDesc}>
                      Completa trayectos en bicicleta o a pie durante la temporada.
                    </Text>
                  </View>
                </View>
              )}

              {rankingGrupal && (
                <View style={styles.benefitItem}>
                  <Ionicons name="people-outline" size={18} color="#2563EB" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.benefitItemTitle}>
                      Ranking Grupal de Temporada
                    </Text>
                    <Text style={styles.benefitItemDesc}>
                      Tus puntos se suman automáticamente al tablero de tu empresa o universidad.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    shadowColor: "#277855",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleRow: {
    flex: 1,
  },
  badgePulse: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#277855",
  },
  badgePulseText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#14532D",
  },
  infoButton: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 10,
  },
  multipliersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  multiplierPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
    gap: 5,
  },
  multiplierPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  specialPill: {
    borderColor: "#FCD34D",
    backgroundColor: "#FEF3C7",
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#DCFCE7",
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#277855",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    width: "100%",
    maxWidth: 380,
    position: "relative",
  },
  modalClose: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 6,
    zIndex: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalDates: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  benefitList: {
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  benefitItemTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },
  benefitItemDesc: {
    fontSize: 11,
    color: "#4B5563",
    marginTop: 2,
  },
  modalButton: {
    backgroundColor: "#277855",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
