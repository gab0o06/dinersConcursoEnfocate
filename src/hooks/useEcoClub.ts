/**
 * useEcoClub — Hook de presentación de alto nivel para pantallas EcoClub
 *
 * Agrupa selectores del store, cálculos de nivel, configuración y mock de usuario
 * para que los componentes de la interfaz no tengan que conectar múltiples piezas.
 */

import { ECOCLUB, type NivelEcoClub } from "../config/ecoclub.config";
import { MOCK_USUARIO } from "../data/mock/usuario";
import { getLevelState, getLevelLabel, type LevelState } from "../lib/levels";
import { pointsToDollars } from "../services/ecoPointsEngine";
import {
  selectAmountToMultiplier,
  selectMultiplierActive,
  selectValidPoints,
  useEcoStore,
} from "../store/useEcoStore";

export interface EcoClubPresentation {
  // Puntos
  validPoints: number;
  pointsAsDollars: number;
  redeemableThisMonth: number;

  // Multiplicador Top-of-Wallet
  multiplierActive: boolean;
  amountLeftForMultiplier: number;

  // Financieros
  financials: ReturnType<typeof useEcoStore.getState>["financials"];

  // Niveles
  levelState: LevelState;
  levelLabel: string;
  nivelActual: NivelEcoClub;

  // Usuario
  usuario: typeof MOCK_USUARIO;

  // Retos
  stravaKm: number;
  reciVeciKg: number;
  metroPoints: number;

  // Métricas CO2
  coiScore: number;
  totalCo2Saved: number;

  // Opciones de canje
  redeemOptions: ReturnType<typeof useEcoStore.getState>["redeemOptions"];

  // Acciones
  redeemPoints: (optionId: string) => boolean;
  setNivel: (nivel: NivelEcoClub) => void;
}

export function useEcoClub(): EcoClubPresentation {
  const validPoints = useEcoStore(selectValidPoints);
  const multiplierActive = useEcoStore(selectMultiplierActive);
  const amountLeftForMultiplier = useEcoStore(selectAmountToMultiplier);
  const financials = useEcoStore((s) => s.financials);
  const nivelActual = useEcoStore((s) => s.nivelActual);
  const diasActivos = useEcoStore((s) => s.diasActivosConsecutivos);
  const canjeadoEsteMes = useEcoStore((s) => s.canjeadoEsteMes);
  const coiScore = useEcoStore((s) => s.coiScore);
  const totalCo2Saved = useEcoStore((s) => s.totalCo2Saved);
  const stravaKm = useEcoStore((s) => s.strava.totalKm);
  const reciVeciKg = useEcoStore((s) => s.reciVeciKgTotal);
  const scoredTransactions = useEcoStore((s) => s.scoredTransactions);
  const redeemOptions = useEcoStore((s) => s.redeemOptions);
  const redeemPoints = useEcoStore((s) => s.redeemPoints);
  const setNivel = useEcoStore((s) => s.setNivel);

  const metroPoints = scoredTransactions
    .filter((tx) => tx.category === "metro")
    .reduce((acc, tx) => acc + tx.ecoPoints, 0);

  const levelState = getLevelState(diasActivos, true);
  const levelLabel = getLevelLabel(nivelActual);

  const capInPoints = financials
    ? Math.floor(financials.redeemCap / ECOCLUB.valorPuntoUSD)
    : 0;
  const remainingCapPoints = Math.max(0, capInPoints - canjeadoEsteMes);
  const redeemableThisMonth = Math.min(validPoints, remainingCapPoints);

  return {
    validPoints,
    pointsAsDollars: pointsToDollars(validPoints),
    redeemableThisMonth,
    multiplierActive,
    amountLeftForMultiplier,
    financials,
    levelState,
    levelLabel,
    nivelActual,
    usuario: MOCK_USUARIO,
    stravaKm,
    reciVeciKg,
    metroPoints,
    coiScore,
    totalCo2Saved,
    redeemOptions,
    redeemPoints,
    setNivel,
  };
}
