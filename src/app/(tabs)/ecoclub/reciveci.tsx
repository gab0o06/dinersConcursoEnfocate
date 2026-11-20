import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EcoHeader from "../../../components/EcoHeader";
import { ECOCLUB } from "../../../config/ecoclub.config";
import { useTourHighlight } from "../../../hooks/useTourHighlight";
import { useTourScroll } from "../../../hooks/useTourScroll";
import { useEcoStore } from "../../../store/useEcoStore";

interface MaterialType {
  id: string;
  name: string;
  shortName: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
  tip: string;
}

const MATERIALS: MaterialType[] = [
  {
    id: "plastico",
    name: "Plásticos y PET",
    shortName: "Plástico",
    icon: "bottle-soda-outline",
    color: "#0284C7",
    bgColor: "#E0F2FE",
    tip: "Botellas y envases limpios",
  },
  {
    id: "papel",
    name: "Cartón y Papel",
    shortName: "Papel/Cartón",
    icon: "package-variant-closed",
    color: "#D97706",
    bgColor: "#FEF3C7",
    tip: "Cajas desarmadas y secas",
  },
  {
    id: "vidrio",
    name: "Envases de Vidrio",
    shortName: "Vidrio",
    icon: "glass-fragile",
    color: "#059669",
    bgColor: "#DCFCE7",
    tip: "Frascos y botellas sin tapa",
  },
  {
    id: "metal",
    name: "Latas y Metal",
    shortName: "Metales",
    icon: "recycle",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    tip: "Aluminio y conservas",
  },
];

export default function ReciVeciScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const collectionTarget = useTourHighlight("reciveci-collection-section");
  const tourScroll = useTourScroll();

  // — Store global —
  const addReciVeciDelivery = useEcoStore((s) => s.addReciVeciDelivery);
  const reciVeciKgTotal = useEcoStore((s) => s.reciVeciKgTotal);
  const deliveries = useEcoStore((s) => s.reciVeciDeliveries);

  // Modal para programar o registrar entrega
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [selectedKg, setSelectedKg] = useState(2);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([
    "plastico",
    "papel",
  ]);

  // Meta semanal / mensual y puntos
  const metaKg = ECOCLUB.retos.reciVeciMetaKg || 20;
  const ptsPorKg = ECOCLUB.retos.reciVeciPtsPorKg || 20;
  const ecoPointsEarned = Math.floor(reciVeciKgTotal * ptsPorKg);
  const co2AvoidedKg = Number((reciVeciKgTotal * 1.8).toFixed(1));
  const progressPct = Math.min(Math.round((reciVeciKgTotal / metaKg) * 100), 100);

  // Desglose de kilos por tipo de material
  const materialKgMap = useMemo(() => {
    const map: Record<string, number> = {
      plastico: 0,
      papel: 0,
      vidrio: 0,
      metal: 0,
    };

    if (deliveries.length > 0) {
      deliveries.forEach((d) => {
        const splitWeight = d.kg / Math.max(d.materials.length, 1);
        d.materials.forEach((matName) => {
          const lower = matName.toLowerCase();
          if (lower.includes("plást") || lower.includes("pet")) map.plastico += splitWeight;
          else if (lower.includes("papel") || lower.includes("cartón")) map.papel += splitWeight;
          else if (lower.includes("vidrio")) map.vidrio += splitWeight;
          else map.metal += splitWeight;
        });
      });
    } else if (reciVeciKgTotal > 0) {
      map.plastico = reciVeciKgTotal * 0.4;
      map.papel = reciVeciKgTotal * 0.35;
      map.vidrio = reciVeciKgTotal * 0.15;
      map.metal = reciVeciKgTotal * 0.1;
    }

    return map;
  }, [deliveries, reciVeciKgTotal]);

  const toggleMaterial = (id: string) => {
    if (selectedMaterialIds.includes(id)) {
      if (selectedMaterialIds.length > 1) {
        setSelectedMaterialIds(selectedMaterialIds.filter((item) => item !== id));
      }
    } else {
      setSelectedMaterialIds([...selectedMaterialIds, id]);
    }
  };

  const handleOpenModal = () => {
    setModalSuccess(false);
    setModalVisible(true);
  };

  const handleConfirmDelivery = () => {
    const materialNames = selectedMaterialIds.map(
      (id) => MATERIALS.find((m) => m.id === id)?.name || id,
    );

    addReciVeciDelivery(selectedKg, materialNames);
    setModalSuccess(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalSuccess(false);
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("es-EC", {
      day: "numeric",
      month: "short",
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
        {...tourScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Cabecera Limpia */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/ecoclub")}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#0A1C40" />
            <Text style={styles.screenTitle}>ReciVeci</Text>
          </TouchableOpacity>

          <View style={styles.ecoPointsPill}>
            <MaterialCommunityIcons
              name="leaf"
              size={16}
              color="#15803D"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text style={styles.ecoPointsText}>
              {ecoPointsEarned} <Text style={styles.ecoPointsSub}>pts</Text>
            </Text>
          </View>
        </View>

        {/* ========================================================
            HERO CARD: Concepto Claro y Luminoso (Diferente a Strava)
            ======================================================== */}
        <View style={styles.heroCard} {...collectionTarget}>
          <View style={styles.heroTopBanner}>
            <View style={styles.partnerBadge}>
              <MaterialCommunityIcons name="recycle" size={16} color="#15803D" />
              <Text style={styles.partnerBadgeText}>Reciclaje Inclusivo</Text>
            </View>
            <Text style={styles.rateBadgeText}>+20 pts por kg</Text>
          </View>

          {/* Bloque Central de Kilos */}
          <View style={styles.weightDisplayRow}>
            <View style={styles.weightBox}>
              <Text style={styles.weightNumber}>
                {reciVeciKgTotal.toFixed(1)}
              </Text>
              <Text style={styles.weightUnit}>kg</Text>
            </View>

            <View style={styles.weightDivider} />

            <View style={styles.weightSummaryBox}>
              <Text style={styles.weightGoalLabel}>
                Meta del reto: <Text style={{ fontWeight: "700" }}>{metaKg} kg</Text>
              </Text>
              <Text style={styles.progressPercentLabel}>
                {progressPct}% completado
              </Text>
            </View>
          </View>

          {/* Barra de Progreso Limpia */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPct}%` },
              ]}
            />
          </View>

          {/* Resumen de Impacto en 1 sola fila */}
          <View style={styles.impactBar}>
            <View style={styles.impactBarItem}>
              <Ionicons name="sparkles" size={14} color="#15803D" />
              <Text style={styles.impactBarText}>
                <Text style={{ fontWeight: "700" }}>+{ecoPointsEarned}</Text> EcoPoints
              </Text>
            </View>

            <View style={styles.impactDot} />

            <View style={styles.impactBarItem}>
              <Ionicons name="leaf-outline" size={14} color="#15803D" />
              <Text style={styles.impactBarText}>
                <Text style={{ fontWeight: "700" }}>{co2AvoidedKg} kg</Text> CO₂ evitado
              </Text>
            </View>
          </View>

          {/* Botón Principal de Acción Directa */}
          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.88}
            onPress={handleOpenModal}
          >
            <MaterialCommunityIcons
              name="handshake-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.primaryActionButtonText}>
              Programar o Registrar Entrega
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================
            MATERIALES: 4 Tarjetas Limpias y Fáciles de Entender
            ======================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Materiales que Reciclas</Text>

          <View style={styles.materialsGrid}>
            {MATERIALS.map((mat) => {
              const currentWeight = Number((materialKgMap[mat.id] || 0).toFixed(1));

              return (
                <View key={mat.id} style={styles.materialTile}>
                  <View
                    style={[
                      styles.materialIconCircle,
                      { backgroundColor: mat.bgColor },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={mat.icon}
                      size={22}
                      color={mat.color}
                    />
                  </View>

                  <Text style={styles.materialTileName}>{mat.shortName}</Text>
                  <Text style={styles.materialTileKg}>{currentWeight} kg</Text>
                  <Text style={styles.materialTileTip} numberOfLines={1}>
                    {mat.tip}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ========================================================
            HISTORIAL: Lista Sencilla de Entregas
            ======================================================== */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionHeaderTitle}>Últimas Entregas</Text>
            {deliveries.length > 0 && (
              <Text style={styles.deliveriesCount}>
                {deliveries.length} {deliveries.length === 1 ? "entrega" : "entregas"}
              </Text>
            )}
          </View>

          {deliveries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="recycle"
                size={38}
                color="#A1A1AA"
              />
              <Text style={styles.emptyTitle}>Sin entregas registradas</Text>
              <Text style={styles.emptySubtitle}>
                Haz una entrega a tu reciclador de base y gana +20 pts por kilo.
              </Text>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addReciVeciDelivery(2, ["Plásticos y PET"])}
                activeOpacity={0.8}
              >
                <Text style={styles.quickAddButtonText}>
                  + Simular entrega de prueba (2 kg)
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.deliveryList}>
              {[...deliveries].reverse().map((item, idx) => {
                const pts = item.pointsEarned || item.kg * ptsPorKg;

                return (
                  <View key={idx} style={styles.deliveryRow}>
                    <View style={styles.deliveryDateCol}>
                      <Text style={styles.deliveryDateText}>
                        {formatDate(item.date)}
                      </Text>
                      <Text style={styles.deliveryTimeText}>
                        {formatTime(item.date)}
                      </Text>
                    </View>

                    <View style={styles.deliveryMaterialsCol}>
                      <Text
                        style={styles.deliveryMaterialsText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.materials.join(", ")}
                      </Text>
                      <Text style={styles.deliveryWeightLabel}>
                        {item.kg} kg entregados
                      </Text>
                    </View>

                    <View style={styles.deliveryPointsBadge}>
                      <Text style={styles.deliveryPointsBadgeText}>
                        +{pts} pts
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ========================================================
          MODAL INTERACTIVO: Adaptado y Centrado (No Sobresale en PC)
          ======================================================== */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              // Asegura que en computadora nunca supere el marco de teléfono (380px)
              { maxWidth: Math.min(windowWidth - 32, 380) },
            ]}
          >
            {!modalSuccess ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Cabecera del modal */}
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalHeading}>Registrar Entrega</Text>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Selector de Kilos */}
                <Text style={styles.modalFieldLabel}>Kilos entregados:</Text>
                <View style={styles.weightButtonsRow}>
                  {[1, 2, 5, 10].map((kg) => (
                    <TouchableOpacity
                      key={kg}
                      style={[
                        styles.weightPill,
                        selectedKg === kg && styles.weightPillActive,
                      ]}
                      onPress={() => setSelectedKg(kg)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.weightPillText,
                          selectedKg === kg && styles.weightPillTextActive,
                        ]}
                      >
                        {kg} kg
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Selector de Materiales */}
                <Text style={styles.modalFieldLabel}>Materiales incluidos:</Text>
                <View style={styles.materialsSelectorRow}>
                  {MATERIALS.map((mat) => {
                    const isSelected = selectedMaterialIds.includes(mat.id);

                    return (
                      <TouchableOpacity
                        key={mat.id}
                        style={[
                          styles.matChip,
                          isSelected && styles.matChipActive,
                        ]}
                        onPress={() => toggleMaterial(mat.id)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons
                          name={mat.icon}
                          size={16}
                          color={isSelected ? "#15803D" : "#6B7280"}
                        />
                        <Text
                          style={[
                            styles.matChipText,
                            isSelected && styles.matChipTextActive,
                          ]}
                        >
                          {mat.shortName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Preview de EcoPoints */}
                <View style={styles.modalPointsPreview}>
                  <Ionicons name="sparkles" size={16} color="#15803D" />
                  <Text style={styles.modalPointsPreviewText}>
                    Ganarás{" "}
                    <Text style={{ fontWeight: "800", color: "#15803D" }}>
                      +{selectedKg * ptsPorKg} EcoPoints
                    </Text>
                  </Text>
                </View>

                {/* Botón de Confirmación */}
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleConfirmDelivery}
                  activeOpacity={0.88}
                >
                  <Text style={styles.modalConfirmButtonText}>
                    Confirmar Entrega (+{selectedKg * ptsPorKg} pts)
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              /* Vista de Éxito In-App (No dispara alertas del navegador que sobresalgan) */
              <View style={styles.modalSuccessView}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={32} color="#15803D" />
                </View>
                <Text style={styles.successTitle}>¡Entrega Registrada!</Text>
                <Text style={styles.successBody}>
                  Has sumado{" "}
                  <Text style={{ fontWeight: "800", color: "#15803D" }}>
                    {selectedKg} kg
                  </Text>{" "}
                  y ganado{" "}
                  <Text style={{ fontWeight: "800", color: "#15803D" }}>
                    +{selectedKg * ptsPorKg} EcoPoints
                  </Text>{" "}
                  apoyando el reciclaje inclusivo de ReciVeci.
                </Text>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleCloseModal}
                  activeOpacity={0.88}
                >
                  <Text style={styles.modalConfirmButtonText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  scroll: {
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 14,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0A1C40",
    marginLeft: 6,
  },
  ecoPointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ecoPointsText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#15803D",
  },
  ecoPointsSub: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* --- Hero Card (Bright & Fresh Eco Theme) --- */
  heroCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroTopBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  partnerBadgeText: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "700",
  },
  rateBadgeText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  weightDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  weightBox: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  weightNumber: {
    fontSize: 42,
    fontWeight: "900",
    color: "#0A1C40",
    letterSpacing: -1,
  },
  weightUnit: {
    fontSize: 20,
    fontWeight: "700",
    color: "#15803D",
  },
  weightDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E2E8F0",
  },
  weightSummaryBox: {
    alignItems: "flex-end",
  },
  weightGoalLabel: {
    fontSize: 13,
    color: "#475569",
  },
  progressPercentLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803D",
    marginTop: 2,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 4,
  },
  impactBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  impactBarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  impactBarText: {
    fontSize: 12,
    color: "#166534",
  },
  impactDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#86EFAC",
  },
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#15803D",
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  /* --- Section & Materials Grid --- */
  section: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0A1C40",
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  deliveriesCount: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  materialsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  materialTile: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  materialIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  materialTileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0A1C40",
  },
  materialTileKg: {
    fontSize: 16,
    fontWeight: "800",
    color: "#15803D",
    marginTop: 2,
  },
  materialTileTip: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },

  /* --- History List --- */
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
  },
  quickAddButton: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  quickAddButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },
  deliveryList: {
    gap: 8,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  deliveryDateCol: {
    width: 60,
  },
  deliveryDateText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A1C40",
  },
  deliveryTimeText: {
    fontSize: 10,
    color: "#64748B",
  },
  deliveryMaterialsCol: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  deliveryMaterialsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  deliveryWeightLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  deliveryPointsBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  deliveryPointsBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803D",
  },

  /* --- Modal Styles (Responsive y adaptado a computadora) --- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A1C40",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  weightButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  weightPill: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
  },
  weightPillActive: {
    backgroundColor: "#15803D",
  },
  weightPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  weightPillTextActive: {
    color: "#FFFFFF",
  },
  materialsSelectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  matChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  matChipActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  matChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  matChipTextActive: {
    color: "#15803D",
    fontWeight: "700",
  },
  modalPointsPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  modalPointsPreviewText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "600",
  },
  modalConfirmButton: {
    backgroundColor: "#15803D",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  /* --- Success State In-Modal --- */
  modalSuccessView: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A1C40",
    marginBottom: 8,
  },
  successBody: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
});
