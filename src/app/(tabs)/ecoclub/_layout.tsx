import { COLORS } from "@/constants/theme";
import { Stack } from "expo-router";

export default function EcoClubLayout() {
  return (
    <Stack
      screenOptions={{
        // Ocultamos el header nativo para maquetar el nuestro propio y clavar el diseño
        headerShown: false,
        // Un fondo por defecto para que las transiciones se vean limpias
        contentStyle: { backgroundColor: COLORS.background },
        // Animación suave al entrar a los detalles
        animation: "slide_from_right",
      }}
    >
      {/* Pantalla principal del menú EcoClub */}
      <Stack.Screen name="index" />

      {/* Pantallas de detalle */}
      <Stack.Screen name="km-verdes" />
      <Stack.Screen name="reciveci" />
      <Stack.Screen name="metro" />
    </Stack>
  );
}
