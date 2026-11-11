import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import Head from "expo-router/head";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";

import "../global.css";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import WebPresentationContainer from "@/components/WebPresentationContainer";
import { useEcoStore } from "@/store/useEcoStore";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

const ICON_FONTS_CSS = `
@font-face {
  font-family: 'ionicons';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Ionicons';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'material-community';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'MaterialCommunityIcons';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Material Design Icons';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5Free-Solid';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5Free-Regular';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5Free-Brand';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Brands.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf') format('truetype');
  font-display: swap;
}
`;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialize = useEcoStore((s) => s.initialize);

  // Asegura la carga de las fuentes vectoriales de Expo tanto en móvil como en web
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome5.font,
  });

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
        <style type="text/css">{ICON_FONTS_CSS}</style>
      </Head>
      <AnimatedSplashOverlay />
      <WebPresentationContainer>
        {/* El Stack navega directo a los Tabs, sin pantalla de login */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </WebPresentationContainer>
    </ThemeProvider>
  );
}
