import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

interface ChallengesCarouselProps {
  metroPoints: number;
  metaMetroPts: number;
  stravaKm: number;
  metaStravaKm: number;
  reciVeciKg: number;
  metaReciKg: number;
  onPressMetro: () => void;
  onPressStrava: () => void;
  onPressReciVeci: () => void;
}

const GAP = 12;

export default function ChallengesCarousel({
  metroPoints,
  metaMetroPts,
  stravaKm,
  metaStravaKm,
  reciVeciKg,
  metaReciKg,
  onPressMetro,
  onPressStrava,
  onPressReciVeci,
}: ChallengesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();

  // Soporte de arrastre con mouse en Web
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);

  // Calcula el ancho de tarjeta adaptado al contenedor exacto
  const fallbackWidth = Math.max(260, Math.min(windowWidth - 80, 330));
  const cardWidth = containerWidth > 0 ? containerWidth : fallbackWidth;

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
    }
  };

  const challenges = [
    {
      id: "metro",
      title: "Metro Diners",
      subtitle: "Transporte Cero Emisiones",
      icon: <Ionicons name="train" size={20} color="#0A467A" />,
      iconBg: "#E0F2FE",
      current: metroPoints,
      meta: metaMetroPts,
      unit: "pts",
      pct: metaMetroPts > 0 ? Math.min((metroPoints / metaMetroPts) * 100, 100) : 0,
      tag: "2 pts/$1 + 50 pts bonus",
      actionText: "Ver tarjeta Metro",
      onPress: onPressMetro,
      accentColor: "#0A467A",
    },
    {
      id: "strava",
      title: "Km Verdes",
      subtitle: "Strava Sincronizado",
      icon: <MaterialCommunityIcons name="run" size={22} color="#D97706" />,
      iconBg: "#FEF3C7",
      current: stravaKm,
      meta: metaStravaKm,
      unit: "km",
      pct: metaStravaKm > 0 ? Math.min((stravaKm / metaStravaKm) * 100, 100) : 0,
      tag: "5 pts por cada km a pie o bici",
      actionText: "Ver actividad Strava",
      onPress: onPressStrava,
      accentColor: "#D97706",
    },
    {
      id: "reciveci",
      title: "ReciVeci Aliado",
      subtitle: "Reciclaje Inclusivo",
      icon: <MaterialCommunityIcons name="recycle" size={22} color="#15803D" />,
      iconBg: "#DCFCE7",
      current: reciVeciKg,
      meta: metaReciKg,
      unit: "kg",
      pct: metaReciKg > 0 ? Math.min((reciVeciKg / metaReciKg) * 100, 100) : 0,
      tag: "20 pts por kg entregado",
      actionText: "Registrar entrega",
      onPress: onPressReciVeci,
      accentColor: "#15803D",
    },
  ];

  const scrollToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(challenges.length - 1, index));
    setActiveIndex(clampedIndex);
    scrollRef.current?.scrollTo({
      x: clampedIndex * (cardWidth + GAP),
      animated: true,
    });
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < challenges.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const itemTotal = cardWidth + GAP;
    if (itemTotal > 0) {
      const index = Math.round(scrollOffset / itemTotal);
      if (index !== activeIndex && index >= 0 && index < challenges.length) {
        setActiveIndex(index);
      }
    }
  };

  // Detección de arrastre con mouse para navegadores desktop
  const handlePointerDown = (e: any) => {
    if (Platform.OS !== "web") return;
    const clientX = e.clientX ?? e.nativeEvent?.clientX;
    const clientY = e.clientY ?? e.nativeEvent?.clientY;
    if (typeof clientX === "number") {
      dragStartX.current = clientX;
      dragStartY.current = clientY ?? 0;
    }
  };

  const handlePointerUp = (e: any) => {
    if (Platform.OS !== "web" || dragStartX.current === null) return;
    const clientX = e.clientX ?? e.nativeEvent?.clientX;
    const clientY = e.clientY ?? e.nativeEvent?.clientY;
    if (typeof clientX === "number") {
      const diffX = clientX - dragStartX.current;
      const diffY = (clientY ?? 0) - (dragStartY.current ?? 0);
      dragStartX.current = null;
      dragStartY.current = null;

      // Arrastre horizontal significativo (>35px)
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
  };

  return (
    <View
      style={styles.container}
      onLayout={onContainerLayout}
      {...(Platform.OS === "web"
        ? {
            onPointerDown: handlePointerDown,
            onPointerUp: handlePointerUp,
          }
        : {})}
    >
      {/* Cabecera con título y controles interactivos Prev / Next */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <MaterialCommunityIcons name="target" size={16} color="#277855" />
          <Text style={styles.title}>Retos Semanales Activos</Text>
        </View>

        <View style={styles.navControls}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              activeIndex === 0 && styles.navBtnDisabled,
            ]}
            onPress={handlePrev}
            disabled={activeIndex === 0}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Reto anterior"
          >
            <Ionicons
              name="chevron-back"
              size={14}
              color={activeIndex === 0 ? "#CBD5E1" : "#0B2046"}
            />
          </TouchableOpacity>

          <Text style={styles.badgeIndicator}>
            {activeIndex + 1} de {challenges.length}
          </Text>

          <TouchableOpacity
            style={[
              styles.navBtn,
              activeIndex === challenges.length - 1 && styles.navBtnDisabled,
            ]}
            onPress={handleNext}
            disabled={activeIndex === challenges.length - 1}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Siguiente reto"
          >
            <Ionicons
              name="chevron-forward"
              size={14}
              color={
                activeIndex === challenges.length - 1 ? "#CBD5E1" : "#0B2046"
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenedor deslizable horizontal */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        nestedScrollEnabled={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {challenges.map((ch) => (
          <TouchableOpacity
            key={ch.id}
            activeOpacity={0.92}
            onPress={ch.onPress}
            style={[styles.card, { width: cardWidth }]}
          >
            <View style={styles.cardTop}>
              <View style={[styles.iconWrap, { backgroundColor: ch.iconBg }]}>
                {ch.icon}
              </View>
              <View style={styles.cardTitles}>
                <Text style={styles.cardTitle}>{ch.title}</Text>
                <Text style={styles.cardSubtitle}>{ch.subtitle}</Text>
              </View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{ch.tag}</Text>
              </View>
            </View>

            {/* Barra de progreso */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressStatusText}>
                  Progreso actual:{" "}
                  <Text style={{ fontWeight: "700", color: "#111827" }}>
                    {ch.current} / {ch.meta} {ch.unit}
                  </Text>
                </Text>
                <Text style={styles.progressPctText}>{Math.round(ch.pct)}%</Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${ch.pct}%`,
                      backgroundColor: ch.accentColor,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Botón de acción */}
            <View style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>{ch.actionText}</Text>
              <Ionicons name="arrow-forward" size={14} color="#0B2046" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Paginación con puntos clickeables */}
      <View style={styles.paginationRow}>
        {challenges.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => scrollToIndex(idx)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={[
              styles.dot,
              idx === activeIndex && styles.dotActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Ir al reto ${idx + 1}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 6,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.2,
  },
  navControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#F1F5F9",
  },
  badgeIndicator: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    paddingHorizontal: 2,
  },
  scrollContent: {
    paddingRight: 4,
    gap: GAP,
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitles: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  tagBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#4B5563",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressStatusText: {
    fontSize: 12,
    color: "#4B5563",
  },
  progressPctText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0B2046",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 20,
    backgroundColor: "#277855",
  },
});

