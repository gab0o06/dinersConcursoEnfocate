export interface TourStep {
  id: string;
  targetId: string;
  screen: "Home" | "EcoClub" | "RetoMetro" | "Menu" | "PagarBLU";
  title: string;
  description: string;
  tooltipPosition?: "top" | "bottom" | "center";
}

export const mvpTourSteps: TourStep[] = [
  {
    id: "step-home-logros",
    targetId: "home-weekly-achievement",
    screen: "Home",
    title: "Tu Logro de la Semana",
    description:
      "Visualiza tus EcoPoints acumulados y explora los retos semanales activos en el carrusel.",
    tooltipPosition: "bottom",
  },
  {
    id: "step-ecoclub-validacion",
    targetId: "ecoclub-environmental-validation",
    screen: "EcoClub",
    title: "Validación Ambiental",
    description:
      "Conecta e integra tus hábitos sostenibles mediante Strava, ReciVeci y Metro de Quito.",
    tooltipPosition: "top",
  },
  {
    id: "step-metro-recargas",
    targetId: "metro-auto-recharge-section",
    screen: "RetoMetro",
    title: "Reto Metro & Recargas",
    description:
      "Gestiona tu recarga automática del Metro de Quito y revisa tu historial de viajes sostenibles.",
    tooltipPosition: "top",
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
  },
];
