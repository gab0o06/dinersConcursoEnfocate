import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Asumo que tienes navy, green, white, gray, black en tu ecoColors

type Props = {
  icon?: React.ReactNode;
  headerLabel: string;
  title: string;
  description: string;
  buttonLabel: string;
  active: boolean;
  variant?: "green" | "gray";
  onPress?: () => void;
};

export default function ChallengeCard({
  icon,
  headerLabel,
  title,
  description,
  buttonLabel,
  active,
  variant = "green",
  onPress,
}: Props) {
  const headerColor = variant === "green" ? "#277855" : "#7D7D7D"; // Colores exactos del diseño
  const buttonColor = active ? "#0A1C40" : "#146E3A"; // Navy para ACTIVO, Verde para ACTIVAR

  return (
    <View style={styles.card}>
      {/* Cabecera de color (Verde o Gris) */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        {icon}
        <Text style={styles.headerLabel}>{headerLabel}</Text>
      </View>

      {/* Cuerpo gris claro */}
      <View style={styles.body}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EAEAEA", // Fondo gris de la parte inferior según el diseño
  },
  header: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 4,
  },
  headerLabel: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 11,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  body: {
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1, // Para que los botones queden alineados abajo si los textos varían
  },
  textContainer: {
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    color: "#000",
    lineHeight: 14,
  },
  description: {
    fontSize: 9,
    color: "#555",
    textAlign: "center",
    lineHeight: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 11,
  },
});
