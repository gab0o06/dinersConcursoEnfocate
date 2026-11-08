import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import Head from "expo-router/head";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import WebPresentationContainer from "@/components/WebPresentationContainer";
import { useEcoStore } from "@/store/useEcoStore";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialize = useEcoStore((s) => s.initialize);

  // Inicializa el motor MCC + EcoPoints al arrancar la app
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Head>
        <title>EcoClub × Diners Club | BLU</title>
        <meta
          name="description"
          content="EcoClub: Módulo de sostenibilidad e incentivos Diners Club Ecuador - Pitch Final"
        />
        <meta name="theme-color" content="#07162C" />
      </Head>
      <AnimatedSplashOverlay />
      <WebPresentationContainer>
        {/* El Stack maneja la transición entre el Login y los Tabs */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </WebPresentationContainer>
    </ThemeProvider>
  );
}
