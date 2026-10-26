import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";
import { MOCK_USUARIO } from "../../data/mock/usuario";
import { getLevelLabel } from "../../lib/levels";
import { selectValidPoints, useEcoStore } from "../../store/useEcoStore";

interface MenuItem {
  icon: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MenuScreen() {
  const router = useRouter();
  const validPoints = useEcoStore(selectValidPoints);
  const nivelActual = useEcoStore((s) => s.nivelActual);
  const levelLabel = getLevelLabel(nivelActual);

  const menuSections: MenuSection[] = [
    {
      title: "EcoClub Sostenible",
      items: [
        {
          icon: "leaf-outline",
          iconColor: "#277855",
          label: "Canje de EcoPoints",
          sublabel: `${validPoints} pts disponibles para canje`,
          onPress: () => router.push("/(tabs)/ecoclub/recompensas"),
        },
        {
          icon: "cart-outline",
          iconColor: "#277855",
          label: "Pagar con BLU",
          sublabel: "Aplica tus EcoPoints directo en compras",
          onPress: () => router.push("/(tabs)/ecoclub/pago-blu"),
        },
        {
          icon: "train-outline",
          iconColor: "#0A467A",
          label: "Metro Diners",
          sublabel: "Recargas automáticas y cashback",
          onPress: () => router.push("/(tabs)/ecoclub/metro"),
        },
      ],
    },
    {
      title: "Mis Productos Diners",
      items: [
        {
          icon: "card-outline",
          iconColor: COLORS.dinersBlue,
          label: "Tarjetas de Crédito",
          sublabel: `${MOCK_USUARIO.tipoTarjeta} •••• ${MOCK_USUARIO.numeroTarjeta}`,
        },
        {
          icon: "document-text-outline",
          iconColor: COLORS.dinersBlue,
          label: "Estados de Cuenta",
          sublabel: "Consulta y descarga tus cortes mensuales",
        },
        {
          icon: "swap-horizontal-outline",
          iconColor: COLORS.dinersBlue,
          label: "Diferir Consumos",
          sublabel: "Paga tus compras en cuotas cómodas",
        },
      ],
    },
    {
      title: "Seguridad y Preferencias",
      items: [
        {
          icon: "shield-checkmark-outline",
          iconColor: "#555",
          label: "Seguridad y Biometría",
          sublabel: "Face ID / Huella digital activada",
        },
        {
          icon: "notifications-outline",
          iconColor: "#555",
          label: "Notificaciones Push",
          sublabel: "Alertas de consumo y retos EcoClub",
        },
        {
          icon: "help-circle-outline",
          iconColor: "#555",
          label: "Centro de Ayuda",
          sublabel: "Preguntas frecuentes y atención 24/7",
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header con Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarInitials}>
              {MOCK_USUARIO.nombre[0]}
              {MOCK_USUARIO.apellido[0]}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {MOCK_USUARIO.nombre} {MOCK_USUARIO.apellido}
            </Text>
            <Text style={styles.profileEmail}>{MOCK_USUARIO.email}</Text>
            <View style={styles.profileBadge}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#277855" />
              <Text style={styles.profileBadgeText}>
                EcoClub {levelLabel} • {validPoints} pts
              </Text>
            </View>
          </View>
        </View>

        {/* Secciones del Menú */}
        {menuSections.map((sec, secIdx) => (
          <View key={secIdx} style={styles.sectionWrap}>
            <Text style={styles.sectionHeader}>{sec.title}</Text>
            <View style={styles.itemsCard}>
              {sec.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.menuRow,
                    itemIdx < sec.items.length - 1 && styles.menuRowBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.7 : 1}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: `${item.iconColor}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={item.iconColor}
                    />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.sublabel && (
                      <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>BLU Diners Club • Versión 5.0 EcoClub</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.dinersBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "#E8F3ED",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#277855",
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  itemsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  menuSublabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF1F0",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFCCC7",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D32F2F",
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "#AAAAAA",
  },
});
