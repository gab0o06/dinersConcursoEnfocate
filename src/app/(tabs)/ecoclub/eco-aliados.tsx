import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import rawEcoAliados from "../../../data/mock/ecoAliados.json";

export interface EcoAliado {
  id: string;
  nombre: string;
  categoria: string;
  plan: "Premium" | "Destacado" | "Básico";
  descripcion: string;
  direccion: string;
  coordenadas: { lat: number; lng: number };
  mcc: number;
  logoColor: string;
  beneficio?: string;
  puntosMultiplicador?: string;
  horario?: string;
}

// Ubicación de referencia en Quito (Mariscal / La Carolina) para cálculo de distancias
const USER_LAT = -0.1807;
const USER_LNG = -78.4840;

function calculateDistanceKm(lat: number, lng: number): string {
  // Fórmula haversine simplificada
  const dLat = (lat - USER_LAT) * 111;
  const dLng = (lng - USER_LNG) * 111 * Math.cos((USER_LAT * Math.PI) / 180);
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
}

function getCategoryIcon(categoria: string): { name: any; family: "Ionicons" | "MaterialCommunityIcons" } {
  const cat = categoria.toLowerCase();
  if (cat.includes("supermercado")) return { name: "cart", family: "Ionicons" };
  if (cat.includes("movilidad")) return { name: "bicycle", family: "Ionicons" };
  if (cat.includes("alimento")) return { name: "food-apple-outline", family: "MaterialCommunityIcons" };
  if (cat.includes("hogar")) return { name: "home-outline", family: "Ionicons" };
  if (cat.includes("energía") || cat.includes("energia")) return { name: "solar-panel", family: "MaterialCommunityIcons" };
  return { name: "leaf-outline", family: "Ionicons" };
}

export default function EcoAliadosScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedPlan, setSelectedPlan] = useState<"Todos" | "Premium" | "Destacado">("Todos");
  const [selectedAliado, setSelectedAliado] = useState<EcoAliado | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const aliados: EcoAliado[] = rawEcoAliados as EcoAliado[];

  const categories = useMemo(() => {
    const cats = Array.from(new Set(aliados.map((a) => a.categoria)));
    return ["Todos", ...cats];
  }, [aliados]);

  const filteredAliados = useMemo(() => {
    return aliados
      .filter((aliado) => {
        const matchesCategory =
          selectedCategory === "Todos" || aliado.categoria === selectedCategory;
        const matchesPlan =
          selectedPlan === "Todos" || aliado.plan === selectedPlan;
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          query === "" ||
          aliado.nombre.toLowerCase().includes(query) ||
          aliado.descripcion.toLowerCase().includes(query) ||
          aliado.direccion.toLowerCase().includes(query) ||
          aliado.categoria.toLowerCase().includes(query);

        return matchesCategory && matchesPlan && matchesQuery;
      })
      .sort((a, b) => {
        // Orden prioritario B2B: Premium primero, luego Destacado, luego Básico
        const order = { Premium: 0, Destacado: 1, Básico: 2 };
        return order[a.plan] - order[b.plan];
      });
  }, [aliados, searchQuery, selectedCategory, selectedPlan]);

  const handleOpenQR = (aliado: EcoAliado) => {
    setSelectedAliado(aliado);
    setCopiedCode(false);
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0B2046" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Eco-Aliados B2B</Text>
          <Text style={styles.headerSubtitle}>
            Comercios sostenibles · Acumula 3× EcoPoints
          </Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, categoría o calle..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categorías */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filtro rápido por Plan B2B */}
      <View style={styles.planFilterRow}>
        <Text style={styles.planFilterLabel}>Nivel de Alianza:</Text>
        <View style={styles.planChipsContainer}>
          {(["Todos", "Premium", "Destacado"] as const).map((plan) => {
            const isSelected = selectedPlan === plan;
            return (
              <TouchableOpacity
                key={plan}
                style={[
                  styles.planChip,
                  isSelected && styles.planChipActive,
                  plan === "Premium" && isSelected && { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" },
                ]}
                onPress={() => setSelectedPlan(plan)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.planChipText,
                    isSelected && styles.planChipTextActive,
                    plan === "Premium" && isSelected && { color: "#B45309" },
                  ]}
                >
                  {plan === "Premium" ? "⭐ Premium" : plan}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Banner explicativo del beneficio */}
      <View style={styles.benefitPromoBanner}>
        <View style={styles.benefitPromoIconWrap}>
          <FontAwesome5 name="store" size={18} color="#277855" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.benefitPromoTitle}>Beneficio Diners Club</Text>
          <Text style={styles.benefitPromoDescription}>
            Tus compras en eco-aliados generan 3 EcoPoints por cada $1 (MCC 5999) + descuentos exclusivos en caja con QR.
          </Text>
        </View>
      </View>

      {/* Lista de aliados */}
      <FlatList
        data={filteredAliados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No encontramos comercios</Text>
            <Text style={styles.emptySubtitle}>
              Prueba con otro término de búsqueda o cambia los filtros.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const iconInfo = getCategoryIcon(item.categoria);
          const distance = calculateDistanceKm(
            item.coordenadas.lat,
            item.coordenadas.lng,
          );

          return (
            <View style={styles.card}>
              {/* Cabecera de la tarjeta */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIconCircle,
                    { backgroundColor: `${item.logoColor}15` },
                  ]}
                >
                  {iconInfo.family === "Ionicons" ? (
                    <Ionicons
                      name={iconInfo.name}
                      size={22}
                      color={item.logoColor}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={iconInfo.name}
                      size={22}
                      color={item.logoColor}
                    />
                  )}
                </View>

                <View style={styles.cardHeaderDetails}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.nombre}</Text>
                    {item.plan === "Premium" && (
                      <View style={styles.badgePremium}>
                        <Ionicons name="star" size={10} color="#FFF" />
                        <Text style={styles.badgePremiumText}>PREMIUM</Text>
                      </View>
                    )}
                    {item.plan === "Destacado" && (
                      <View style={styles.badgeDestacado}>
                        <Text style={styles.badgeDestacadoText}>DESTACADO</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardSubRow}>
                    <Text style={styles.cardCategory}>{item.categoria}</Text>
                    <Text style={styles.bulletDot}>•</Text>
                    <View style={styles.distanceBadge}>
                      <Ionicons name="location-outline" size={12} color="#555" />
                      <Text style={styles.distanceText}>{distance}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Descripción */}
              <Text style={styles.cardDescription}>{item.descripcion}</Text>

              {/* Beneficio destacado */}
              <View style={styles.benefitContainer}>
                <View style={styles.multiplierTag}>
                  <Ionicons name="flash" size={13} color="#277855" />
                  <Text style={styles.multiplierText}>
                    {item.puntosMultiplicador || "3× EcoPoints"}
                  </Text>
                </View>
                {item.beneficio && (
                  <Text style={styles.benefitOfferText}>
                    🎁 {item.beneficio}
                  </Text>
                )}
              </View>

              {/* Dirección y Horario */}
              <View style={styles.locationContainer}>
                <Ionicons name="navigate-outline" size={14} color="#777" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.direccion}
                </Text>
              </View>
              {item.horario && (
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={14} color="#777" />
                  <Text style={styles.timeText}>{item.horario}</Text>
                </View>
              )}

              {/* Botón CTA */}
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => handleOpenQR(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
                <Text style={styles.qrButtonText}>Canjear Beneficio QR</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Modal de Cupón / QR de Descuento */}
      <Modal
        visible={selectedAliado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAliado(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedAliado(null)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconWrap,
                  { backgroundColor: `${selectedAliado?.logoColor}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name="storefront"
                  size={26}
                  color={selectedAliado?.logoColor || "#277855"}
                />
              </View>
              <Text style={styles.modalTitle}>{selectedAliado?.nombre}</Text>
              <Text style={styles.modalSubtitle}>
                {selectedAliado?.categoria} · Plan {selectedAliado?.plan}
              </Text>
            </View>

            {/* Código QR Simulado */}
            <View style={styles.qrBox}>
              <View style={styles.qrPatternSim}>
                {/* Marcadores de esquina QR */}
                <View style={[styles.qrCorner, styles.qrCornerTL]} />
                <View style={[styles.qrCorner, styles.qrCornerTR]} />
                <View style={[styles.qrCorner, styles.qrCornerBL]} />
                <View style={styles.qrCenterLogo}>
                  <Ionicons name="leaf" size={24} color="#277855" />
                </View>
                <Text style={styles.qrSimText}>•••• •••• ••••</Text>
              </View>
              <Text style={styles.qrInstruction}>
                Presenta este código en caja al pagar con tu Diners Club
              </Text>
            </View>

            {/* Cupón y beneficio */}
            <View style={styles.couponCodeRow}>
              <View>
                <Text style={styles.couponLabel}>CÓDIGO DE PROMOCIÓN</Text>
                <Text style={styles.couponCode}>
                  DINERS-ECO-{selectedAliado?.id.replace("aliado-", "")}89
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.copyButton,
                  copiedCode && styles.copyButtonSuccess,
                ]}
                onPress={handleCopyCode}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copiedCode ? "checkmark" : "copy-outline"}
                  size={16}
                  color={copiedCode ? "#FFF" : "#0B2046"}
                />
                <Text
                  style={[
                    styles.copyButtonText,
                    copiedCode && { color: "#FFF" },
                  ]}
                >
                  {copiedCode ? "¡Copiado!" : "Copiar"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Detalles de la promoción */}
            <View style={styles.modalBenefitsList}>
              <View style={styles.modalBenefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#277855" />
                <Text style={styles.modalBenefitText}>
                  {selectedAliado?.beneficio || "Descuento en compras"}
                </Text>
              </View>
              <View style={styles.modalBenefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#277855" />
                <Text style={styles.modalBenefitText}>
                  Acumula 3× EcoPoints por cada $1 consumido
                </Text>
              </View>
              <View style={styles.modalBenefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#277855" />
                <Text style={styles.modalBenefitText}>
                  {selectedAliado?.direccion}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setSelectedAliado(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDoneButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2046",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  categoriesSection: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  categoryPillActive: {
    backgroundColor: "#277855",
  },
  categoryText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  planFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  planFilterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  planChipsContainer: {
    flexDirection: "row",
    gap: 6,
  },
  planChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  planChipActive: {
    borderColor: "#277855",
    backgroundColor: "#E8F5E9",
  },
  planChipText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  planChipTextActive: {
    color: "#277855",
  },
  benefitPromoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    gap: 10,
  },
  benefitPromoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitPromoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1B5E20",
  },
  benefitPromoDescription: {
    fontSize: 11,
    color: "#2E7D32",
    lineHeight: 15,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardHeaderDetails: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  badgePremium: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D97706",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  badgePremiumText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  badgeDestacado: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeDestacadoText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  cardSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },
  cardCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  bulletDot: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginVertical: 8,
  },
  benefitContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  multiplierTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  multiplierText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#277855",
  },
  benefitOfferText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  addressText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#6B7280",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#277855",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
    gap: 6,
  },
  qrButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  // Modal styles
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
    padding: 24,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalCloseButton: {
    position: "absolute",
    top: 18,
    right: 18,
    padding: 6,
    zIndex: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  qrBox: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 12,
  },
  qrPatternSim: {
    width: 150,
    height: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  qrCorner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#111827",
    borderWidth: 6,
  },
  qrCornerTL: {
    top: 10,
    left: 10,
  },
  qrCornerTR: {
    top: 10,
    right: 10,
  },
  qrCornerBL: {
    bottom: 10,
    left: 10,
  },
  qrCenterLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  qrSimText: {
    position: "absolute",
    bottom: 12,
    fontSize: 9,
    color: "#999",
    letterSpacing: 2,
  },
  qrInstruction: {
    fontSize: 11,
    color: "#4B5563",
    textAlign: "center",
    marginTop: 10,
  },
  couponCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEF2F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  couponLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0B2046",
    marginTop: 2,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  copyButtonSuccess: {
    backgroundColor: "#277855",
    borderColor: "#277855",
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B2046",
  },
  modalBenefitsList: {
    gap: 8,
    marginBottom: 18,
  },
  modalBenefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalBenefitText: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
  },
  modalDoneButton: {
    backgroundColor: "#0B2046",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalDoneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
