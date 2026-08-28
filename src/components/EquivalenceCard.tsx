import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  label: string; // ej. "plantar 2 árboles"
  TreeIcon?: React.ReactNode;
};

export default function EquivalenceCard({ label, TreeIcon }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Equivalencia</Text>

      <View style={styles.pillContainer}>
        <View style={styles.pill}>
          {TreeIcon || (
            <MaterialCommunityIcons name="tree" size={28} color="#1E754C" />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20, // Para alinear con el resto de la pantalla
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "400", // Mismo peso que "Retos Activos"
    color: "#000",
    marginBottom: 12,
  },
  pillContainer: {
    alignItems: "center", // Centra la píldora en la pantalla
    width: "100%",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E2E2", // Gris claro idéntico al diseño
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24, // Ajusta el ancho de la píldora
    minWidth: "80%", // Para que no se encoja demasiado
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
  },
});
