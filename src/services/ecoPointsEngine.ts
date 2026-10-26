/**
 * EcoPoints Engine — Motor financiero de EcoClub Diners
 *
 * Implementa los controles financieros del pitch (§04):
 *   1. Tope mensual variable por nivel (% de la comisión real generada)
 *   2. Caducidad de 90 días
 *   3. Umbral mínimo de canje: 200 pts
 *   4. Umbral Top-of-Wallet: $200/mes en transacciones (×1.5 pts)
 *   5. Los cinco tipos de canje (eco-cashback / cuota-cero / milla-diners / bono-predial / eco-aliado)
 *   6. Bandas A/B/C por gasto mensual
 *   7. Reto Metro: 50 pts/recarga, máximo 10 recargas/mes
 *
 * NOTE: Las constantes de ECOCLUB se definen localmente aquí.
 * Cuando `/src/config/ecoclub.config.ts` esté disponible, importar desde allí
 * y eliminar la sección "Constantes locales ECOCLUB" de este archivo.
 */

import {
  calculateMonthlyCOIScore,
  qualifiesForMonthlyBonus,
  MONTHLY_BONUS_POINTS,
  scoreTransaction,
  type ScoredTransaction,
} from "./mccScoring";

export {
  calculateMonthlyCOIScore,
  qualifiesForMonthlyBonus,
  MONTHLY_BONUS_POINTS,
  scoreTransaction,
  type ScoredTransaction,
};

import { ECOCLUB, type NivelEcoClub } from "../config/ecoclub.config";

export type { NivelEcoClub };

// ---------------------------------------------------------------------------
// Constantes financieras del modelo (centralizadas en ECOCLUB)
// ---------------------------------------------------------------------------

/** Porcentaje máximo de la comisión que se puede canjear (nivel por defecto) */
export const REDEEM_CAP_RATE = ECOCLUB.topePctPorNivel["activado"];

/** Mínimo de puntos para hacer cualquier canje */
export const MIN_REDEEM_POINTS = ECOCLUB.minCanjePts;

/** Gasto mínimo mensual para activar multiplicadores ($) */
export const TOP_OF_WALLET_THRESHOLD = ECOCLUB.topOfWalletThreshold;

/** Días antes de que expiren los EcoPoints */
export const POINTS_EXPIRY_DAYS = ECOCLUB.caducidadDias;

/** Tasa de conversión: 100 pts = $0.50 de eco-cashback */
export const POINTS_TO_DOLLARS_RATE = ECOCLUB.valorPuntoUSD;

/** Puntos requeridos para canje nivel Verde (cuota de manejo) */
export const VERDE_LEVEL_POINTS = 2000;

/** Puntos requeridos para 1 milla Diners (nivel Guardián) */
export const GUARDIAN_POINTS_PER_MILE = ECOCLUB.millaPts;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface PointsBatch {
  points: number;
  earnedAt: Date;
  expiresAt: Date;
  source: "mcc" | "strava" | "reciveci" | "monthly_bonus";
  description: string;
}

export interface MonthlyFinancialSummary {
  /** Total gastado con Diners ese mes ($) */
  totalSpent: number;
  /** Comisión generada ese mes ($) */
  totalCommission: number;
  /** Tope de canje disponible ese mes ($) */
  redeemCap: number;
  /** EcoPoints brutos ganados (antes del tope) */
  rawPointsEarned: number;
  /** EcoPoints disponibles para canje (respetando el tope) */
  redeemablePoints: number;
  /** ¿Está activo el multiplicador Top-of-Wallet? */
  multiplierActive: boolean;
  /** Cuánto le falta para activar el multiplicador ($) */
  amountToActivateMultiplier: number;
}

export type RedeemOptionId =
  | "eco-cashback"
  | "cuota-cero"
  | "milla-diners"
  | "bono-predial"
  | "eco-aliado";

export interface RedeemOption {
  id: RedeemOptionId;
  label: string;
  pointsCost: number;
  benefit: string;
  dollarValue: number;
  available: boolean;
  nivelMinimo: NivelEcoClub;
  reason?: string; // por qué no está disponible
}

// ---------------------------------------------------------------------------
// Bandas A/B/C
// ---------------------------------------------------------------------------

export type BandaEcoClub = "A" | "B" | "C";

/**
 * Determina la banda del usuario según su gasto mensual total.
 *   A: >= $600/mes
 *   B: >= $300/mes
 *   C:  < $300/mes
 */
export function getBanda(monthlySpend: number): BandaEcoClub {
  if (monthlySpend >= 600) return "A";
  if (monthlySpend >= 300) return "B";
  return "C";
}

/**
 * Aplica los límites de generación y saldo máximo por banda.
 * Retorna los puntos a acreditar (0 si ya se alcanzó el saldo máximo).
 *
 * Límites por banda:
 *   A: gen 2000 pts/mes, saldo máximo 5000 pts
 *   B: gen 1200 pts/mes, saldo máximo 3000 pts
 *   C: gen  600 pts/mes, saldo máximo 1500 pts
 */
export function applyBandaLimits(
  newPoints: number,
  currentBalance: number,
  banda: BandaEcoClub,
): number {
  const limits: Record<BandaEcoClub, { gen: number; saldo: number }> = {
    A: { gen: 2000, saldo: 5000 },
    B: { gen: 1200, saldo: 3000 },
    C: { gen: 600, saldo: 1500 },
  };
  const { gen, saldo } = limits[banda];
  const canEarn = Math.max(0, Math.min(newPoints, gen));
  const spaceLeft = Math.max(0, saldo - currentBalance);
  return Math.min(canEarn, spaceLeft);
}

// ---------------------------------------------------------------------------
// Funciones financieras
// ---------------------------------------------------------------------------

/**
 * Calcula el resumen financiero mensual del usuario.
 * Esta es la función central que implementa el modelo de costo variable.
 *
 * @param nivel - Nivel EcoClub del usuario; determina el % del tope de canje.
 */
export function calculateMonthlyFinancials(
  transactions: ScoredTransaction[],
  accumulatedPoints: PointsBatch[],
  nivel: NivelEcoClub = "activado",
): MonthlyFinancialSummary {
  // Totales del mes
  const totalSpent = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const totalCommission = transactions.reduce(
    (acc, tx) => acc + tx.commissionGenerated,
    0,
  );

  // REGLA CENTRAL: tope variable según nivel del usuario
  const topePct = ECOCLUB.topePctPorNivel[nivel];
  const redeemCap = parseFloat((totalCommission * topePct).toFixed(2));
  const redeemCapInPoints = Math.floor(redeemCap / POINTS_TO_DOLLARS_RATE);

  // Puntos brutos del mes (suma de todos los batches del mes actual)
  const rawPointsEarned = transactions.reduce(
    (acc, tx) => acc + tx.ecoPoints,
    0,
  );

  // Puntos disponibles para canje (limitados por el tope)
  const validPoints = getValidPoints(accumulatedPoints);
  const redeemablePoints = Math.min(validPoints, redeemCapInPoints);

  // Top-of-Wallet: activo si gastó >= $200 este mes
  const multiplierActive = totalSpent >= TOP_OF_WALLET_THRESHOLD;
  const amountToActivateMultiplier = Math.max(
    0,
    TOP_OF_WALLET_THRESHOLD - totalSpent,
  );

  return {
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    totalCommission: parseFloat(totalCommission.toFixed(2)),
    redeemCap,
    rawPointsEarned,
    redeemablePoints,
    multiplierActive,
    amountToActivateMultiplier: parseFloat(
      amountToActivateMultiplier.toFixed(2),
    ),
  };
}

/**
 * Crea un nuevo batch de puntos con su fecha de expiración.
 */
export function createPointsBatch(
  points: number,
  source: PointsBatch["source"],
  description: string,
  earnedAt: Date = new Date(),
): PointsBatch {
  const expiresAt = new Date(earnedAt);
  expiresAt.setDate(expiresAt.getDate() + POINTS_EXPIRY_DAYS);

  return { points, earnedAt, expiresAt, source, description };
}

/**
 * Suma los puntos de los batches válidos (no expirados).
 * Implementa el control de caducidad de 90 días.
 */
export function getValidPoints(batches: PointsBatch[]): number {
  const now = new Date();
  return batches
    .filter((b) => b.expiresAt > now)
    .reduce((acc, b) => acc + b.points, 0);
}

/**
 * Retorna solo los batches que aún no han expirado.
 * Útil para limpiar el store de batches caducados.
 */
export function filterValidBatches(batches: PointsBatch[]): PointsBatch[] {
  const now = new Date();
  return batches.filter((b) => b.expiresAt > now);
}

/**
 * Agrega puntos de Strava: 5 pts por km verificado por GPS.
 */
export function pointsFromStrava(km: number): PointsBatch {
  const points = Math.floor(km * 5);
  return createPointsBatch(points, "strava", `${km.toFixed(1)} km en Strava`);
}

/**
 * Agrega puntos de ReciVeci: 20 pts por kg reciclado confirmado.
 */
export function pointsFromReciVeci(kg: number): PointsBatch {
  const points = Math.floor(kg * 20);
  return createPointsBatch(
    points,
    "reciveci",
    `${kg} kg reciclados con ReciVeci`,
  );
}

/**
 * Calcula bonus de Metro: 50 pts/recarga, máximo 10 recargas/mes.
 */
export function calculateMetroBonus(
  metroTransactions: ScoredTransaction[],
): number {
  const capped = Math.min(metroTransactions.length, 10);
  return capped * 50;
}

/**
 * Genera las opciones de canje según los puntos disponibles y el tope.
 * Implementa §03 del pitch: eco-cashback / cuota-cero / milla-diners /
 * bono-predial / eco-aliado.
 */
export function getRedeemOptions(
  availablePoints: number,
  redeemCap: number,
  canjeadoEsteMes: number = 0,
): RedeemOption[] {
  const capInPoints = Math.floor(redeemCap / POINTS_TO_DOLLARS_RATE);
  const effectivePoints = Math.min(availablePoints, capInPoints);

  const basicValue = parseFloat(
    (MIN_REDEEM_POINTS * POINTS_TO_DOLLARS_RATE).toFixed(2),
  );

  // Puntos restantes dentro del tope mensual de canje
  const remainingCapPoints = Math.max(0, capInPoints - canjeadoEsteMes);
  const spendablePoints = Math.min(effectivePoints, remainingCapPoints);

  return [
    {
      id: "eco-cashback",
      label: "Eco-Cashback",
      pointsCost: MIN_REDEEM_POINTS,
      benefit: `$${basicValue} de descuento sobre tu factura Diners`,
      dollarValue: basicValue,
      nivelMinimo: "activado",
      available:
        spendablePoints >= MIN_REDEEM_POINTS && redeemCap >= basicValue,
      reason:
        spendablePoints < MIN_REDEEM_POINTS
          ? `Te faltan ${MIN_REDEEM_POINTS - spendablePoints} pts`
          : redeemCap < basicValue
            ? "Tu comisión mensual no respalda este canje aún"
            : undefined,
    },
    {
      id: "cuota-cero",
      label: "Cuota Cero",
      pointsCost: VERDE_LEVEL_POINTS,
      benefit: "Cuota de manejo mensual completa cubierta",
      dollarValue: parseFloat(
        (VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE).toFixed(2),
      ),
      nivelMinimo: "verde",
      available:
        spendablePoints >= VERDE_LEVEL_POINTS &&
        redeemCap >= VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE,
      reason:
        spendablePoints < VERDE_LEVEL_POINTS
          ? `Te faltan ${VERDE_LEVEL_POINTS - spendablePoints} pts`
          : redeemCap < VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE
            ? "Tu comisión mensual no respalda este canje"
            : undefined,
    },
    {
      id: "milla-diners",
      label: "1 Milla Diners",
      pointsCost: GUARDIAN_POINTS_PER_MILE,
      benefit: "1 milla del programa Diners (programa premium existente)",
      dollarValue: 0, // valor en millas, no en dólares directos
      nivelMinimo: "guardian",
      available: spendablePoints >= GUARDIAN_POINTS_PER_MILE,
      reason:
        spendablePoints < GUARDIAN_POINTS_PER_MILE
          ? `Te faltan ${GUARDIAN_POINTS_PER_MILE - spendablePoints} pts`
          : undefined,
    },
    {
      id: "bono-predial",
      label: "Bono Predial",
      pointsCost: VERDE_LEVEL_POINTS,
      benefit: "Abono al impuesto predial municipal",
      dollarValue: parseFloat(
        (VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE).toFixed(2),
      ),
      nivelMinimo: "verde",
      available:
        spendablePoints >= VERDE_LEVEL_POINTS &&
        redeemCap >= VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE,
      reason:
        spendablePoints < VERDE_LEVEL_POINTS
          ? `Te faltan ${VERDE_LEVEL_POINTS - spendablePoints} pts`
          : redeemCap < VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE
            ? "Tu comisión mensual no respalda este canje"
            : undefined,
    },
    {
      id: "eco-aliado",
      label: "Eco-Aliado",
      pointsCost: MIN_REDEEM_POINTS,
      benefit: "Descuento en comercios eco-aliados de la red Diners",
      dollarValue: basicValue,
      nivelMinimo: "activado",
      available:
        spendablePoints >= MIN_REDEEM_POINTS && redeemCap >= basicValue,
      reason:
        spendablePoints < MIN_REDEEM_POINTS
          ? `Te faltan ${MIN_REDEEM_POINTS - spendablePoints} pts`
          : redeemCap < basicValue
            ? "Tu comisión mensual no respalda este canje aún"
            : undefined,
    },
  ];
}

/**
 * Convierte puntos a dólares de cashback (para mostrar en UI).
 */
export function pointsToDollars(points: number): number {
  return parseFloat((points * POINTS_TO_DOLLARS_RATE).toFixed(2));
}

/**
 * Proyección anual de margen por segmento de usuario (§06 del pitch).
 * Útil para la pantalla de impacto / demo financiera.
 */
export function calculateAnnualMarginProjection(monthlySpend: number): {
  annualCommission: number;
  annualMaxRewards: number;
  annualMargin: number;
  segment: "bajo" | "medio" | "alto";
} {
  const commissionRate = 0.02; // supuesto base 2%
  const annualCommission = monthlySpend * 12 * commissionRate;
  const annualMaxRewards = annualCommission * REDEEM_CAP_RATE;
  const annualMargin = annualCommission - annualMaxRewards;

  const segment =
    monthlySpend >= 600
      ? "alto"
      : monthlySpend >= 300
        ? "medio"
        : "bajo";

  return {
    annualCommission: parseFloat(annualCommission.toFixed(2)),
    annualMaxRewards: parseFloat(annualMaxRewards.toFixed(2)),
    annualMargin: parseFloat(annualMargin.toFixed(2)),
    segment,
  };
}
