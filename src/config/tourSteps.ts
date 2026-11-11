/**
 * tourSteps.ts — Fuente única de verdad del tour guiado de 5 pasos de EcoClub.
 *
 * Cada paso declara:
 *  - screen:    pantalla lógica donde vive el elemento (Home, EcoClub, …)
 *  - targetId:  nativeID / clave del View a resaltar (ver useTourHighlight)
 *  - title / description / tooltipPosition: contenido del tooltip
 *
 * La navegación NO vive en cada paso: se resuelve a partir de `screen`
 * mediante TOUR_SCREEN_ROUTES, de modo que el TourContext pueda saber cuándo
 * la navegación terminó comparando el pathname actual con la ruta esperada.
 */

import { type useRouter } from "expo-router";

type Router = ReturnType<typeof useRouter>;

export type TourScreen = "Home" | "EcoClub" | "RetoMetro" | "Menu" | "PagarBLU";

export interface TourStep {
  id: string;
  targetId: string;
  screen: TourScreen;
  title: string;
  description: string;
  tooltipPosition?: "top" | "bottom" | "center";
  /** Padding en px alrededor del elemento resaltado (default 8) */
  padding?: number;
}

export interface TourScreenRoute {
  /** Pathname tal como lo devuelve usePathname() (sin grupos como (tabs)) */
  pathname: string;
  /** Href para el router */
  href: string;
  /**
   * - "tab":   cambia de pestaña (navigate → reutiliza la pantalla existente
   *            y hace pop del stack anidado si hacía falta)
   * - "push":  abre una pantalla de detalle encima del stack
   */
  kind: "tab" | "push";
}

export const TOUR_SCREEN_ROUTES: Record<TourScreen, TourScreenRoute> = {
  Home: { pathname: "/home", href: "/(tabs)/home", kind: "tab" },
  EcoClub: { pathname: "/ecoclub", href: "/(tabs)/ecoclub", kind: "tab" },
  RetoMetro: {
    pathname: "/ecoclub/metro",
    href: "/(tabs)/ecoclub/metro",
    kind: "push",
  },
  Menu: { pathname: "/menu", href: "/(tabs)/menu", kind: "tab" },
  PagarBLU: {
    pathname: "/ecoclub/pago-blu",
    href: "/(tabs)/ecoclub/pago-blu",
    kind: "push",
  },
};

/** Navegación por defecto de un paso: cambia de tab o abre la pantalla. */
export function navigateToTourStep(router: Router, step: TourStep): void {
  const route = TOUR_SCREEN_ROUTES[step.screen];
  if (route.kind === "push") {
    router.push(route.href as never);
  } else {
    router.navigate(route.href as never);
  }
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "step-home-logros",
    targetId: "home-weekly-achievement",
    screen: "Home",
    title: "Tu Logro de la Semana",
    description:
      "Visualiza tus EcoPoints acumulados y explora los retos semanales activos en el carrusel.",
    tooltipPosition: "bottom",
    padding: 10,
  },
  {
    id: "step-ecoclub-validacion",
    targetId: "ecoclub-environmental-validation",
    screen: "EcoClub",
    title: "Validación Ambiental",
    description:
      "Conecta e integra tus hábitos sostenibles mediante Strava, ReciVeci y Metro de Quito.",
    tooltipPosition: "bottom",
  },
  {
    id: "step-metro-recargas",
    targetId: "metro-auto-recharge-section",
    screen: "RetoMetro",
    title: "Reto Metro & Recargas",
    description:
      "Gestiona tu recarga automática del Metro de Quito y revisa tu historial de viajes sostenibles.",
    tooltipPosition: "bottom",
    padding: 10,
  },
  {
    id: "step-menu-pagar-blu",
    targetId: "menu-pay-with-blu-option",
    screen: "Menu",
    title: "Pagar con BLU",
    description:
      "Accede al módulo de pagos para canjear tus puntos en la facturación mensual.",
    tooltipPosition: "bottom",
  },
  {
    id: "step-pagar-ecopoints-discount",
    targetId: "blu-ecopoints-discount-card",
    screen: "PagarBLU",
    title: "Reducción de Factura",
    description:
      "Aplica tus EcoPoints para obtener un descuento directo en el total a pagar de tu tarjeta.",
    tooltipPosition: "top",
    padding: 12,
  },
];
