/**
 * MCC Scoring — Motor de puntuación ambiental de EcoClub Diners
 *
 * Merchant Category Code (MCC): código de 4 dígitos que identifica el tipo
 * de comercio en cada transacción. Diners ya lo conoce en cada compra.
 *
 * Fuente CO₂: factores IPCC calibrados a Ecuador / Quito.
 * Las tasas de comisión son hipótesis a calibrar con datos reales de Diners.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type McCategory =
  | "gasolinera"
  | "restaurante"
  | "supermercado"
  | "metro"
  | "gimnasio"
  | "eco_aliado"
  | "otros";

export interface MccRule {
  mccs: number[];
  category: McCategory;
  label: string;
  /** EcoPoints por cada $1 gastado */
  pointsPerDollar: number;
  /** CO₂ evitado estimado (kg) por cada $1 respecto al baseline gasolina */
  co2SavedKgPerDollar: number;
  /** Comisión interbancaria hipotética (% del monto) — calibrar con Diners */
  commissionRate: number;
  /** ¿Aplica bonus de impacto verde? */
  greenBonus: boolean;
}

export interface ScoredTransaction {
  transactionId: string;
  amount: number;
  mcc: number;
  category: McCategory;
  label: string;
  ecoPoints: number;
  co2SavedKg: number;
  commissionGenerated: number;
  date: Date;
}

// ---------------------------------------------------------------------------
// Tabla MCC — hipótesis a calibrar con Diners
// ---------------------------------------------------------------------------

export const MCC_RULES: MccRule[] = [
  {
    mccs: [5541, 5542, 5172],
    category: "gasolinera",
    label: "Gasolinera",
    pointsPerDollar: 0.5,
    co2SavedKgPerDollar: 0, // sin beneficio ambiental
    commissionRate: 0.018, // 1.8% hipótesis
    greenBonus: false,
  },
  {
    mccs: [5812, 5814, 5811],
    category: "restaurante",
    label: "Restaurante",
    pointsPerDollar: 1,
    co2SavedKgPerDollar: 0.04,
    commissionRate: 0.02, // 2.0% hipótesis
    greenBonus: false,
  },
  {
    mccs: [5411, 5422, 5912],
    category: "supermercado",
    label: "Supermercado",
    pointsPerDollar: 1,
    co2SavedKgPerDollar: 0.03,
    commissionRate: 0.015, // 1.5% hipótesis (margen bajo en grocery)
    greenBonus: false,
  },
  {
    mccs: [4111, 4131, 4112],
    category: "metro",
    label: "Metro / Transporte Público",
    pointsPerDollar: 2,
    co2SavedKgPerDollar: 0.21, // vs conducir carro solo — fuente IPCC
    commissionRate: 0.02,
    greenBonus: true,
  },
  {
    mccs: [7941, 7997, 7011],
    category: "gimnasio",
    label: "Gimnasio / Deporte",
    pointsPerDollar: 2,
    co2SavedKgPerDollar: 0.15,
    commissionRate: 0.02,
    greenBonus: true,
  },
  {
    mccs: [5999, 5945, 5947],
    category: "eco_aliado",
    label: "Comercio Eco-Aliado",
    pointsPerDollar: 3,
    co2SavedKgPerDollar: 0.3,
    commissionRate: 0.025, // 2.5%: comisión normal + fee de aliado
    greenBonus: true,
  },
];

// Regla por defecto para MCCs no clasificados
const DEFAULT_RULE: MccRule = {
  mccs: [],
  category: "otros",
  label: "Otros",
  pointsPerDollar: 0.5,
  co2SavedKgPerDollar: 0,
  commissionRate: 0.018,
  greenBonus: false,
};

// ---------------------------------------------------------------------------
// Funciones de scoring
// ---------------------------------------------------------------------------

/** Devuelve la regla MCC para un código dado */
export function getRuleForMcc(mcc: number): MccRule {
  return MCC_RULES.find((rule) => rule.mccs.includes(mcc)) ?? DEFAULT_RULE;
}

/**
 * Calcula EcoPoints y CO₂ para una transacción individual.
 * Los puntos se calculan antes de aplicar el tope mensual.
 */
export function scoreTransaction(
  transactionId: string,
  amount: number,
  mcc: number,
  date: Date = new Date(),
): ScoredTransaction {
  const rule = getRuleForMcc(mcc);

  const rawPoints = amount * rule.pointsPerDollar;
  const ecoPoints = Math.floor(rawPoints); // siempre enteros
  const co2SavedKg = parseFloat((amount * rule.co2SavedKgPerDollar).toFixed(3));
  const commissionGenerated = parseFloat(
    (amount * rule.commissionRate).toFixed(4),
  );

  return {
    transactionId,
    amount,
    mcc,
    category: rule.category,
    label: rule.label,
    ecoPoints,
    co2SavedKg,
    commissionGenerated,
    date,
  };
}

/**
 * Calcula el score mensual de CO₂ sobre el total de transacciones del mes.
 * Devuelve CO₂ total evitado y el score COI normalizado de 0–10.
 */
export function calculateMonthlyCOIScore(
  transactions: ScoredTransaction[],
): { totalCo2Saved: number; coiScore: number; breakdown: Record<McCategory, number> } {
  const breakdown: Record<McCategory, number> = {
    gasolinera: 0,
    restaurante: 0,
    supermercado: 0,
    metro: 0,
    gimnasio: 0,
    eco_aliado: 0,
    otros: 0,
  };

  let totalCo2Saved = 0;

  for (const tx of transactions) {
    breakdown[tx.category] += tx.co2SavedKg;
    totalCo2Saved += tx.co2SavedKg;
  }

  // Score COI: normalizado al máximo teórico de 8 kg CO₂/mes (usuario muy verde)
  const CO2_MAX = 8;
  const coiScore = parseFloat(
    Math.min((totalCo2Saved / CO2_MAX) * 10, 10).toFixed(1),
  );

  return {
    totalCo2Saved: parseFloat(totalCo2Saved.toFixed(2)),
    coiScore,
    breakdown,
  };
}

/**
 * Verifica si el usuario califica para el bonus mensual de bajo carbono.
 * Condición: score COI >= 6 (equivale a ~4.8 kg CO₂ evitado ese mes)
 */
export function qualifiesForMonthlyBonus(coiScore: number): boolean {
  return coiScore >= 6;
}

export const MONTHLY_BONUS_POINTS = 100;
