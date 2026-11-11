/**
 * tourSteps.ts — Configuración de los 5 pasos del tour guiado de EcoClub
 *
 * Cada paso define:
 *  - targetId: nativeID del View a resaltar
 *  - navigate: callback (recibe router) que lleva al usuario a la pantalla correcta
 *  - title / description: texto del tooltip
 *  - padding: espacio extra alrededor del spotlight (default 8px)
 */

import { type Router } from "expo-router";

export interface TourStep {
  id: number;
  targetId: string;
  title: string;
  description: string;
  /** Padding en px alrededor del elemento resaltado */
  padding?: number;
  /** Función que navega/cambia pestaña antes de mostrar el spotlight */
  navigate: (router: Router) => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    targetId: "home-weekly-achievement",
    title: "🌿 Tus Logros de la Semana",
    description:
      "Aquí ves tus EcoPoints acumulados y los retos activos del mes. ¡Cada compra sostenible suma!",
    padding: 10,
    navigate: (router) => router.replace("/(tabs)/home"),
  },
  {
    id: 2,
    targetId: "ecoclub-environmental-validation",
    title: "🏅 Validación Ambiental",
    description:
      "Conecta Strava, ReciVeci y Metro para validar tu impacto verde con datos reales.",
    padding: 8,
    navigate: (router) => router.replace("/(tabs)/ecoclub"),
  },
  {
    id: 3,
    targetId: "metro-auto-recharge-section",
    title: "🚇 Recarga Automática Metro",
    description:
      "Activa la recarga automática y gana hasta 50 EcoPoints por cada recarga con tu tarjeta Diners.",
    padding: 10,
    navigate: (router) => router.push("/(tabs)/ecoclub/metro"),
  },
  {
    id: 4,
    targetId: "menu-pay-with-blu-option",
    title: "💳 Pagar con BLU",
    description:
      "Desde el menú accedes directo a aplicar tus EcoPoints en tu próxima compra.",
    padding: 8,
    navigate: (router) => router.replace("/(tabs)/menu"),
  },
  {
    id: 5,
    targetId: "blu-ecopoints-discount-card",
    title: "🎁 Descuento en Factura",
    description:
      "Aquí ves cuánto ahorras en tu próximo estado de cuenta usando tus EcoPoints Diners.",
    padding: 12,
    navigate: (router) => router.push("/(tabs)/ecoclub/pago-blu"),
  },
];
