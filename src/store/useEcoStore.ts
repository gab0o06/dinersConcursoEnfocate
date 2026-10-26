/**
 * useEcoStore — Store global de EcoClub con Zustand + AsyncStorage
 *
 * Fuente única de verdad para:
 *  - EcoPoints acumulados (batches con expiración)
 *  - Transacciones procesadas del mes
 *  - Resumen financiero mensual (tope, comisión, multiplicador)
 *  - Score COI / CO₂
 *  - Estado de integración Strava
 *
 * Los datos se persisten en AsyncStorage para sobrevivir reinicios.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  MOCK_TRANSACTIONS,
  type RawTransaction,
} from "../data/mockTransactions";
import { type NivelEcoClub } from "../config/ecoclub.config";
import {
  calculateMonthlyCOIScore,
  calculateMonthlyFinancials as _calculateMonthlyFinancials,
  createPointsBatch,
  getRedeemOptions,
  getValidPoints,
  MONTHLY_BONUS_POINTS,
  pointsFromReciVeci,
  pointsFromStrava,
  qualifiesForMonthlyBonus,
  scoreTransaction,
  type MonthlyFinancialSummary,
  type PointsBatch,
  type RedeemOption,
  type RedeemOptionId,
  type ScoredTransaction,
} from "../services/ecoPointsEngine";

// ---------------------------------------------------------------------------
// Tipos del store
// ---------------------------------------------------------------------------

interface StravaState {
  accessToken: string | null;
  refreshToken: string | null;
  totalKm: number;
  activities: Array<{
    id: number;
    name: string;
    type: string;
    distance: number;
    moving_time: number;
    start_date_local: string;
  }>;
}

interface EcoState {
  // --- Transacciones ---
  rawTransactions: RawTransaction[];
  scoredTransactions: ScoredTransaction[];

  // --- Puntos ---
  pointsBatches: PointsBatch[];

  // --- Nivel y canjes ---
  nivelActual: NivelEcoClub;
  diasActivosConsecutivos: number;
  canjeadoEsteMes: number;

  // --- Resumen calculado ---
  financials: MonthlyFinancialSummary | null;
  coiScore: number;
  totalCo2Saved: number;
  redeemOptions: RedeemOption[];

  // --- Strava ---
  strava: StravaState;

  // --- ReciVeci ---
  reciVeciKgTotal: number;
  reciVeciDeliveries: Array<{
    date: Date;
    kg: number;
    materials: string[];
    pointsEarned: number;
  }>;

  // --- UI ---
  isInitialized: boolean;
}

interface EcoActions {
  /** Inicializa el store con las transacciones mock (primera carga) */
  initialize: () => void;

  /** Procesa todas las transacciones y recalcula el resumen */
  processTransactions: (transactions: RawTransaction[]) => void;

  /** Agrega puntos de Strava tras sincronización exitosa */
  addStravaPoints: (km: number) => void;

  /** Actualiza el estado de Strava (token + actividades) */
  updateStravaState: (partial: Partial<StravaState>) => void;

  /** Desconecta Strava */
  disconnectStrava: () => void;

  /** Agrega puntos de ReciVeci tras confirmación de recolección */
  addReciVeciDelivery: (kg: number, materials: string[]) => void;

  /** Canjea puntos (retorna true si el canje fue exitoso) */
  redeemPoints: (optionId: RedeemOptionId | string) => boolean;

  /** Cambia el nivel actual (útil para demos) */
  setNivel: (nivel: NivelEcoClub) => void;

  /** Recalcula todo (útil al volver al foreground) */
  recalculate: () => void;
}

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

const INITIAL_STRAVA: StravaState = {
  accessToken: null,
  refreshToken: null,
  totalKm: 0,
  activities: [],
};

const INITIAL_FINANCIALS: MonthlyFinancialSummary = {
  totalSpent: 0,
  totalCommission: 0,
  redeemCap: 0,
  rawPointsEarned: 0,
  redeemablePoints: 0,
  multiplierActive: false,
  amountToActivateMultiplier: 200,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useEcoStore = create<EcoState & EcoActions>()(
  persist(
    (set, get) => ({
      // Estado inicial
      rawTransactions: [],
      scoredTransactions: [],
      pointsBatches: [],
      nivelActual: "activado",
      diasActivosConsecutivos: 52,
      canjeadoEsteMes: 0,
      financials: INITIAL_FINANCIALS,
      coiScore: 0,
      totalCo2Saved: 0,
      redeemOptions: [],
      strava: INITIAL_STRAVA,
      reciVeciKgTotal: 0,
      reciVeciDeliveries: [],
      isInitialized: false,

      // -----------------------------------------------------------------------
      initialize: () => {
        if (get().isInitialized) return;
        // Carga las transacciones mock en el primer arranque
        get().processTransactions(MOCK_TRANSACTIONS);
        set({ isInitialized: true });
      },

      // -----------------------------------------------------------------------
      processTransactions: (transactions) => {
        const scored = transactions.map((tx) =>
          scoreTransaction(tx.id, tx.amount, tx.mcc, tx.date),
        );

        // Crear batch de puntos MCC para este mes
        const mccBatch = createPointsBatch(
          scored.reduce((acc, tx) => acc + tx.ecoPoints, 0),
          "mcc",
          "EcoPoints por transacciones MCC del mes",
        );

        const allBatches = [...get().pointsBatches, mccBatch];

        // Score COI
        const { totalCo2Saved, coiScore } = calculateMonthlyCOIScore(scored);

        // Bonus mensual de bajo carbono
        let finalBatches = allBatches;
        if (qualifiesForMonthlyBonus(coiScore)) {
          const bonusBatch = createPointsBatch(
            MONTHLY_BONUS_POINTS,
            "monthly_bonus",
            "Bonus bajo carbono del mes 🌱",
          );
          finalBatches = [...allBatches, bonusBatch];
        }

        // Resumen financiero
        const financials = _calculateMonthlyFinancials(
          scored,
          finalBatches,
          get().nivelActual,
        );
        const redeemOptions = getRedeemOptions(
          getValidPoints(finalBatches),
          financials.redeemCap,
          get().canjeadoEsteMes,
        );

        set({
          rawTransactions: transactions,
          scoredTransactions: scored,
          pointsBatches: finalBatches,
          financials,
          coiScore,
          totalCo2Saved,
          redeemOptions,
        });
      },

      // -----------------------------------------------------------------------
      addStravaPoints: (km) => {
        const batch = pointsFromStrava(km);
        const allBatches = [...get().pointsBatches, batch];
        const financials = get().financials!;
        const redeemOptions = getRedeemOptions(
          getValidPoints(allBatches),
          financials.redeemCap,
        );
        set({ pointsBatches: allBatches, redeemOptions });
      },

      // -----------------------------------------------------------------------
      updateStravaState: (partial) => {
        set({ strava: { ...get().strava, ...partial } });
      },

      disconnectStrava: () => {
        set({ strava: INITIAL_STRAVA });
      },

      // -----------------------------------------------------------------------
      addReciVeciDelivery: (kg, materials) => {
        const batch = pointsFromReciVeci(kg);
        const allBatches = [...get().pointsBatches, batch];
        const financials = get().financials!;
        const redeemOptions = getRedeemOptions(
          getValidPoints(allBatches),
          financials.redeemCap,
        );

        const newDelivery = {
          date: new Date(),
          kg,
          materials,
          pointsEarned: batch.points,
        };

        set({
          pointsBatches: allBatches,
          redeemOptions,
          reciVeciKgTotal: get().reciVeciKgTotal + kg,
          reciVeciDeliveries: [...get().reciVeciDeliveries, newDelivery],
        });
      },

      // -----------------------------------------------------------------------
      redeemPoints: (optionId) => {
        const { redeemOptions, pointsBatches, financials, canjeadoEsteMes } = get();
        const normalizedId =
          optionId === "basico"
            ? "eco-cashback"
            : optionId === "verde"
              ? "cuota-cero"
              : optionId === "guardian"
                ? "milla-diners"
                : optionId;

        const option = redeemOptions.find(
          (o) => o.id === optionId || o.id === normalizedId,
        );

        if (!option?.available) return false;

        // Descuenta los puntos del batch más antiguo primero (FIFO)
        let pointsToRemove = option.pointsCost;
        const updatedBatches = [...pointsBatches]
          .sort((a, b) => a.earnedAt.getTime() - b.earnedAt.getTime())
          .map((batch) => {
            if (pointsToRemove <= 0) return batch;
            const deducted = Math.min(batch.points, pointsToRemove);
            pointsToRemove -= deducted;
            return { ...batch, points: batch.points - deducted };
          })
          .filter((batch) => batch.points > 0);

        const newCanjeado = canjeadoEsteMes + option.pointsCost;
        const updatedRedeemOptions = getRedeemOptions(
          getValidPoints(updatedBatches),
          financials?.redeemCap ?? 0,
          newCanjeado,
        );

        set({
          pointsBatches: updatedBatches,
          redeemOptions: updatedRedeemOptions,
          canjeadoEsteMes: newCanjeado,
        });
        return true;
      },

      setNivel: (nivel) => {
        set({ nivelActual: nivel });
        get().recalculate();
      },

      // -----------------------------------------------------------------------
      recalculate: () => {
        const { rawTransactions, pointsBatches, nivelActual, canjeadoEsteMes } = get();
        if (rawTransactions.length === 0) return;

        const scored = rawTransactions.map((tx) =>
          scoreTransaction(tx.id, tx.amount, tx.mcc, tx.date),
        );
        const { totalCo2Saved, coiScore } = calculateMonthlyCOIScore(scored);
        const financials = _calculateMonthlyFinancials(
          scored,
          pointsBatches,
          nivelActual,
        );
        const redeemOptions = getRedeemOptions(
          getValidPoints(pointsBatches),
          financials.redeemCap,
          canjeadoEsteMes,
        );

        set({ scoredTransactions: scored, financials, coiScore, totalCo2Saved, redeemOptions });
      },
    }),

    // Configuración de persistencia
    {
      name: "ecoclub-store",
      storage: createJSONStorage(() => AsyncStorage),
      // No persistir funciones, solo datos
      partialize: (state) => ({
        rawTransactions: state.rawTransactions,
        pointsBatches: state.pointsBatches,
        nivelActual: state.nivelActual,
        diasActivosConsecutivos: state.diasActivosConsecutivos,
        canjeadoEsteMes: state.canjeadoEsteMes,
        strava: state.strava,
        reciVeciKgTotal: state.reciVeciKgTotal,
        reciVeciDeliveries: state.reciVeciDeliveries,
        isInitialized: state.isInitialized,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Selectores utilitarios (para usar con useShallow si hay rendimiento)
// ---------------------------------------------------------------------------

/** Total de EcoPoints válidos (no expirados) */
export const selectValidPoints = (state: EcoState) =>
  getValidPoints(state.pointsBatches);

/** ¿El multiplicador Top-of-Wallet está activo? */
export const selectMultiplierActive = (state: EcoState) =>
  state.financials?.multiplierActive ?? false;

/** Cuánto falta para activar el multiplicador */
export const selectAmountToMultiplier = (state: EcoState) =>
  state.financials?.amountToActivateMultiplier ?? 200;
