import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { type PointsBatch } from "../services/ecoPointsEngine";

interface PointsHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  batches: PointsBatch[];
  totalValidPoints: number;
  pointsAsDollars: number;
}

function getSourceInfo(source: PointsBatch["source"]): {
  icon: string;
  family: "Ionicons" | "MaterialCommunityIcons";
  color: string;
  bg: string;
  name: string;
} {
  switch (source) {
    case "mcc":
      return {
        icon: "card-outline",
        family: "Ionicons",
        color: "#0A467A",
        bg: "#E0F2FE",
        name: "Consumos Diners (MCC)",
      };
    case "strava":
      return {
        icon: "run",
        family: "MaterialCommunityIcons",
        color: "#D97706",
        bg: "#FEF3C7",
        name: "Km Verdes (Strava)",
      };
    case "reciveci":
      return {
        icon: "recycle",
        family: "MaterialCommunityIcons",
        color: "#15803D",
        bg: "#DCFCE7",
        name: "ReciVeci Aliado",
      };
    case "monthly_bonus":
      return {
        icon: "leaf",
        family: "MaterialCommunityIcons",
        color: "#277855",
        bg: "#D1FAE5",
        name: "Bonus Bajo Carbono",
      };
    default:
      return {
        icon: "leaf-outline",
        family: "Ionicons",
        color: "#277855",
        bg: "#D1FAE5",
        name: "EcoPoints",
      };
  }
}

export default function PointsHistoryModal({
  visible,
  onClose,
  batches,
  totalValidPoints,
  pointsAsDollars,
}: PointsHistoryModalProps) {
  const now = new Date();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header del Sheet */}
          <View style={styles.dragBar} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Historial y Caducidad FIFO</Text>
              <Text style={styles.subtitle}>
                Tus lotes de EcoPoints y vencimiento a 90 días
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tarjeta Resumen */}
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>SALDO TOTAL VIGENTE</Text>
              <Text style={styles.summaryPoints}>{totalValidPoints} EcoPoints</Text>
              <Text style={styles.summaryDollars}>
                ≈ ${pointsAsDollars.toFixed(2)} de saldo para tu factura
              </Text>
            </View>
            <View style={styles.fifoBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#277855" />
              <Text style={styles.fifoBadgeText}>Regla FIFO</Text>
            </View>
          </View>

          <Text style={styles.noteText}>
            💡 Al canjear, se descuentan automáticamente los puntos más antiguos
            primero para maximizar la vigencia de tu saldo.
          </Text>

          {/* Lista de Batches */}
          <FlatList
            data={batches}
            keyExtractor={(_, index) => `batch-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={36} color="#9CA3AF" />
                <Text style={styles.emptyText}>No hay lotes acumulados aún.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const info = getSourceInfo(item.source);
              const earnedDate = new Date(item.earnedAt);
              const expireDate = new Date(item.expiresAt);

              const daysRemaining = Math.max(
                0,
                Math.ceil(
                  (expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                ),
              );

              const isExpiringSoon = daysRemaining <= 15;

              return (
                <View style={styles.batchCard}>
                  <View style={[styles.iconCircle, { backgroundColor: info.bg }]}>
                    {info.family === "Ionicons" ? (
                      <Ionicons name={info.icon as any} size={20} color={info.color} />
                    ) : (
                      <MaterialCommunityIcons
                        name={info.icon as any}
                        size={20}
                        color={info.color}
                      />
                    )}
                  </View>

                  <View style={styles.batchDetails}>
                    <View style={styles.batchTopRow}>
                      <Text style={styles.batchSourceName}>{info.name}</Text>
                      <Text style={styles.batchPoints}>+{item.points} pts</Text>
                    </View>

                    <Text style={styles.batchDescription}>
                      {item.description}
                    </Text>

                    <View style={styles.datesRow}>
                      <Text style={styles.dateText}>
                        Ganado: {earnedDate.toLocaleDateString("es-EC", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </Text>
                      <View
                        style={[
                          styles.expiryPill,
                          isExpiringSoon && styles.expiryPillWarning,
                        ]}
                      >
                        <Ionicons
                          name="hourglass-outline"
                          size={11}
                          color={isExpiringSoon ? "#B45309" : "#4B5563"}
                        />
                        <Text
                          style={[
                            styles.expiryText,
                            isExpiringSoon && styles.expiryTextWarning,
                          ]}
                        >
                          Vence en {daysRemaining} días
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />

          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.5,
  },
  summaryPoints: {
    fontSize: 20,
    fontWeight: "800",
    color: "#14532D",
    marginTop: 2,
  },
  summaryDollars: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 1,
  },
  fifoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  fifoBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  noteText: {
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 15,
    marginBottom: 12,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
  batchCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  batchDetails: {
    flex: 1,
  },
  batchTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  batchSourceName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  batchPoints: {
    fontSize: 14,
    fontWeight: "800",
    color: "#277855",
  },
  batchDescription: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 2,
    marginBottom: 6,
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 11,
    color: "#6B7280",
  },
  expiryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  expiryPillWarning: {
    backgroundColor: "#FEF3C7",
  },
  expiryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4B5563",
  },
  expiryTextWarning: {
    color: "#B45309",
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
  },
  doneButton: {
    backgroundColor: "#0B2046",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
