/**
 * ecoclub.config.ts — Configuración centralizada de negocio EcoClub Diners
 *
 * Fuente única de verdad para todos los parámetros financieros, de niveles,
 * bandas de usuario, retos y CO₂.
 */

export const ECOCLUB = {
  // ---------------------------------------------------------------------------
  // Financiero
  // ---------------------------------------------------------------------------

  /** Tasa de conversión: 100 pts = $0.50 */
  valorPuntoUSD: 0.005,

  /** Mínimo de puntos para realizar cualquier canje */
  minCanjePts: 200,

  /** Días antes de que expiren los EcoPoints */
  caducidadDias: 90,

  /** Gasto mensual mínimo para activar multiplicador Top-of-Wallet ($) */
  topOfWalletThreshold: 200,

  /** Multiplicador real de puntos cuando Top-of-Wallet está activo */
  topOfWalletMultiplier: 1.5,

  /** Cuota de manejo mensual ($) */
  cuotaManejoUSD: 8,

  /** Puntos necesarios para canjear 1 milla Diners */
  millaPts: 300,

  // ---------------------------------------------------------------------------
  // Tope de canje por nivel (porcentaje de comisión disponible para canje)
  // ---------------------------------------------------------------------------

  topePctPorNivel: {
    descubierto: 0.0,
    activado: 0.40,
    constante: 0.45,
    verde: 0.50,
    guardian: 0.55,
  },

  // ---------------------------------------------------------------------------
  // Días activos consecutivos requeridos para alcanzar cada nivel
  // ---------------------------------------------------------------------------

  diasParaNivel: {
    activado: 0,    // nivel base al registrarse
    constante: 45,
    verde: 90,
    guardian: 180,
  },

  // ---------------------------------------------------------------------------
  // Bandas de usuario según gasto mensual promedio
  // ---------------------------------------------------------------------------

  bandas: {
    A: { gastoPiso: 600, generacionMaxPts: 2000, saldoMaxPts: 5000 },
    B: { gastoPiso: 300, generacionMaxPts: 1200, saldoMaxPts: 3000 },
    C: { gastoPiso: 0,   generacionMaxPts: 600,  saldoMaxPts: 1500 },
  },

  // ---------------------------------------------------------------------------
  // Retos
  // ---------------------------------------------------------------------------

  retos: {
    stravaPtsPorKm: 5,
    stravaMetaKm: 35,
    reciVeciPtsPorKg: 20,
    reciVeciMetaKg: 50,
    metroMaxRecargasMes: 10,
    /** Puntos bonus por recarga de Metro (además del MCC) */
    metroPtsPorRecarga: 50,
    metroMetaPts: 200,
  },

  // ---------------------------------------------------------------------------
  // CO₂
  // ---------------------------------------------------------------------------

  /** kg CO₂ máximo teórico para normalizar el gauge */
  co2Max: 8,

  /** Bonus en puntos por mantener huella de carbono baja */
  bonusBajoCarbonoPts: 100,

  /** Score COI mínimo para obtener el bonus de bajo carbono */
  bonusBajoCarbonoScore: 6,

  /** Tasa de interchange base asumida */
  tasaInterchangeBase: 0.02,

  // ---------------------------------------------------------------------------
  // Canjes especiales
  // ---------------------------------------------------------------------------

  /** Monto máximo de descuento en pago de predial ($) */
  bonoPredialMaxUSD: 50,

  /** Comisión histórica mínima acumulada para aplicar al predial ($) */
  bonoPredialMinComisionHistorica: 100,
} as const;

// ---------------------------------------------------------------------------
// Tipos derivados
// ---------------------------------------------------------------------------

export type NivelEcoClub = keyof typeof ECOCLUB.topePctPorNivel;
export type BandaEcoClub = keyof typeof ECOCLUB.bandas;
