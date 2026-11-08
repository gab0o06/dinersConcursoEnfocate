import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  const scrollRef = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();
  const effectiveWidth = Math.min(windowWidth, 430);
  const cardWidth = Math.max(effectiveWidth - 64, 280);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (cardWidth + 12));
    if (index !== activeIndex && index >= 0 && index < 3) {
      setActiveIndex(index);
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
      pct: Math.min((metroPoints / metaMetroPts) * 100, 100),
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
      pct: Math.min((stravaKm / metaStravaKm) * 100, 100),
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
      pct: Math.min((reciVeciKg / metaReciKg) * 100, 100),
      tag: "20 pts por kg entregado",
      actionText: "Registrar entrega",
      onPress: onPressReciVeci,
      accentColor: "#15803D",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Retos Semanales Activos</Text>
        <Text style={styles.badgeIndicator}>
          {activeIndex + 1} de {challenges.length}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {challenges.map((ch) => (
          <View key={ch.id} style={[styles.card, { width: cardWidth }]}>
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

            {/* Progreso */}
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

            {/* Acción */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={ch.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>{ch.actionText}</Text>
              <Ionicons name="arrow-forward" size={14} color="#0B2046" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Paginación con puntitos */}
      <View style={styles.paginationRow}>
        {challenges.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeIndex && styles.dotActive,
            ]}
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
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.2,
  },
  badgeIndicator: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  scrollContent: {
    paddingRight: 10,
    gap: 12,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#277855",
  },
});
