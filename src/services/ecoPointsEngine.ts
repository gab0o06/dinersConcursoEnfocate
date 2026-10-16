/**
 * EcoPoints Engine — Motor financiero de EcoClub Diners
 *
 * Implementa los controles financieros del pitch (§04):
 *   1. Tope mensual = 40% de la comisión real generada por el usuario
 *   2. Caducidad de 90 días
 *   3. Umbral mínimo de canje: 200 pts
 *   4. Umbral Top-of-Wallet: $200/mes en transacciones
 *   5. Los tres niveles de canje (Básico / Verde / Guardián)
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

// ---------------------------------------------------------------------------
// Constantes financieras del modelo
// ---------------------------------------------------------------------------

/** Porcentaje máximo de la comisión que se puede canjear */
export const REDEEM_CAP_RATE = 0.4;

/** Mínimo de puntos para hacer cualquier canje */
export const MIN_REDEEM_POINTS = 200;

/** Gasto mínimo mensual para activar multiplicadores ($) */
export const TOP_OF_WALLET_THRESHOLD = 200;

/** Días antes de que expiren los EcoPoints */
export const POINTS_EXPIRY_DAYS = 90;

/** Tasa de conversión: 100 pts = $0.50 de eco-cashback */
export const POINTS_TO_DOLLARS_RATE = 0.005;

/** Puntos requeridos para canje nivel Verde (cuota de manejo) */
export const VERDE_LEVEL_POINTS = 2000;

/** Puntos requeridos para 1 milla Diners (nivel Guardián) */
export const GUARDIAN_POINTS_PER_MILE = 300;

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

export interface RedeemOption {
  id: "basico" | "verde" | "guardian";
  label: string;
  pointsCost: number;
  benefit: string;
  dollarValue: number;
  available: boolean;
  reason?: string; // por qué no está disponible
}

// ---------------------------------------------------------------------------
// Funciones financieras
// ---------------------------------------------------------------------------

/**
 * Calcula el resumen financiero mensual del usuario.
 * Esta es la función central que implementa el modelo de costo variable.
 */
export function calculateMonthlyFinancials(
  transactions: ScoredTransaction[],
  accumulatedPoints: PointsBatch[],
): MonthlyFinancialSummary {
  // Totales del mes
  const totalSpent = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const totalCommission = transactions.reduce(
    (acc, tx) => acc + tx.commissionGenerated,
    0,
  );

  // REGLA CENTRAL: tope = 40% de la comisión real
  const redeemCap = parseFloat((totalCommission * REDEEM_CAP_RATE).toFixed(2));
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
 * Filtra los batches de puntos que aún no han expirado.
 * Implementa el control de caducidad de 90 días.
 */
export function getValidPoints(batches: PointsBatch[]): number {
  const now = new Date();
  return batches
    .filter((batch) => batch.expiresAt > now)
    .reduce((acc, batch) => acc + batch.points, 0);
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
 * Genera las 3 opciones de canje según los puntos disponibles y el tope.
 * Implementa §03 del pitch: Básico / Verde / Guardián.
 */
export function getRedeemOptions(
  availablePoints: number,
  redeemCap: number,
): RedeemOption[] {
  const capInPoints = Math.floor(redeemCap / POINTS_TO_DOLLARS_RATE);
  const effectivePoints = Math.min(availablePoints, capInPoints);

  const basicValue = parseFloat(
    (MIN_REDEEM_POINTS * POINTS_TO_DOLLARS_RATE).toFixed(2),
  );

  return [
    {
      id: "basico",
      label: "Eco-Cashback",
      pointsCost: MIN_REDEEM_POINTS,
      benefit: `$${basicValue} de descuento sobre tu factura Diners`,
      dollarValue: basicValue,
      available:
        effectivePoints >= MIN_REDEEM_POINTS && redeemCap >= basicValue,
      reason:
        effectivePoints < MIN_REDEEM_POINTS
          ? `Te faltan ${MIN_REDEEM_POINTS - effectivePoints} pts`
          : redeemCap < basicValue
            ? "Tu comisión mensual no respalda este canje aún"
            : undefined,
    },
    {
      id: "verde",
      label: "Cuota Cero",
      pointsCost: VERDE_LEVEL_POINTS,
      benefit: "Cuota de manejo mensual completa cubierta",
      dollarValue: parseFloat(
        (VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE).toFixed(2),
      ),
      available:
        effectivePoints >= VERDE_LEVEL_POINTS &&
        redeemCap >= VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE,
      reason:
        effectivePoints < VERDE_LEVEL_POINTS
          ? `Te faltan ${VERDE_LEVEL_POINTS - effectivePoints} pts`
          : redeemCap < VERDE_LEVEL_POINTS * POINTS_TO_DOLLARS_RATE
            ? "Tu comisión mensual no respalda este canje"
            : undefined,
    },
    {
      id: "guardian",
      label: "1 Milla Diners",
      pointsCost: GUARDIAN_POINTS_PER_MILE,
      benefit: "1 milla del programa Diners (programa premium existente)",
      dollarValue: 0, // valor en millas, no en dólares directos
      available: effectivePoints >= GUARDIAN_POINTS_PER_MILE,
      reason:
        effectivePoints < GUARDIAN_POINTS_PER_MILE
          ? `Te faltan ${GUARDIAN_POINTS_PER_MILE - effectivePoints} pts`
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
