/**
 * TourContext — Controlador del tour guiado interactivo de EcoClub (5 pasos).
 *
 * Flujo de cada paso:
 *   1. goToStep(i) → status = "navigating", se invoca onStepChange(step)
 *      (por defecto cambia de pestaña / navega con Expo Router).
 *   2. Un efecto observa usePathname(): cuando coincide con la ruta del paso,
 *      espera a que termine la animación de transición y mide el target.
 *   3. Con el layout medido → status = "showing" y TourOverlay pinta el spotlight.
 *
 * Sincronización con la navegación:
 *   - Si el usuario sale de la pantalla del paso durante el tour, el spotlight
 *     se oculta (el tooltip queda centrado para poder continuar o saltar) y se
 *     vuelve a medir automáticamente al regresar.
 *   - skipTour() cancela cualquier medición/timeout pendiente: nunca bloquea la UI.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { type View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import {
  navigateToTourStep,
  TOUR_SCREEN_ROUTES,
  TOUR_STEPS,
  type TourStep,
} from "../config/tourSteps";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface TargetLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TourStatus = "idle" | "navigating" | "measuring" | "showing";

export interface TourContextValue {
  steps: TourStep[];
  /** Índice 0-based del paso actual. null = tour inactivo */
  stepIndex: number | null;
  currentStep: TourStep | null;
  status: TourStatus;
  /** Layout (coordenadas de ventana) del target, null si no hay spotlight */
  targetLayout: TargetLayout | null;
  isActive: boolean;

  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  /** Finaliza el tour en cualquier momento */
  skipTour: () => void;

  registerTarget: (id: string, ref: RefObject<View | null>) => void;
  unregisterTarget: (id: string, ref: RefObject<View | null>) => void;
  remeasure: () => void;
}

export interface TourProviderProps {
  children: ReactNode;
  steps?: TourStep[];
  /**
   * Se ejecuta ANTES de posicionar el spotlight de cada paso. Debe llevar al
   * usuario a la pantalla/pestaña del paso. Por defecto usa Expo Router.
   */
  onStepChange?: (step: TourStep, index: number) => void;
  /** Se ejecuta al terminar (completed = true) o al saltar (false) el tour */
  onFinish?: (completed: boolean) => void;
  /** Inicia el tour automáticamente al abrir la app (una vez por arranque) */
  autoStart?: boolean;
  /** Espera antes del auto-inicio, para dejar terminar el splash (ms) */
  autoStartDelayMs?: number;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Espera tras llegar a la ruta para que acabe la animación de la pantalla */
const TRANSITION_SETTLE_MS = 380;
/** Si la ruta nunca coincide (p.ej. ruta renombrada), medir igualmente */
const NAVIGATION_TIMEOUT_MS = 2000;
const MEASURE_RETRIES = 10;
const MEASURE_RETRY_DELAY_MS = 120;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TourProvider({
  children,
  steps = TOUR_STEPS,
  onStepChange,
  onFinish,
  autoStart = false,
  autoStartDelayMs = 1200,
}: TourProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<TourStatus>("idle");
  const [targetLayout, setTargetLayout] = useState<TargetLayout | null>(null);

  /** targetId → ref del View registrado */
  const targets = useRef(new Map<string, RefObject<View | null>>());
  /** Token de ejecución: invalida timeouts/mediciones de pasos anteriores */
  const runId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const currentStep = stepIndex !== null ? (steps[stepIndex] ?? null) : null;

  // ── Timers ────────────────────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // ── Registro de targets ───────────────────────────────────────────────────

  const registerTarget = useCallback(
    (id: string, ref: RefObject<View | null>) => {
      targets.current.set(id, ref);
    },
    [],
  );

  const unregisterTarget = useCallback(
    (id: string, ref: RefObject<View | null>) => {
      // Solo borrar si sigue siendo el mismo ref (evita carreras al remontar)
      if (targets.current.get(id) === ref) targets.current.delete(id);
    },
    [],
  );

  // ── Medición ──────────────────────────────────────────────────────────────

  const measure = useCallback(
    (targetId: string, token: number) => {
      const attempt = (retriesLeft: number): void => {
        if (token !== runId.current) return;

        const retry = () => {
          if (retriesLeft > 0) {
            schedule(() => attempt(retriesLeft - 1), MEASURE_RETRY_DELAY_MS);
          } else {
            // El target no apareció: mostramos el tooltip sin spotlight
            setTargetLayout(null);
            setStatus("showing");
          }
        };

        const node = targets.current.get(targetId)?.current;
        if (!node) return retry();

        node.measureInWindow((x, y, width, height) => {
          if (token !== runId.current) return;
          if (!width || !height) return retry();
          setTargetLayout({ x, y, width, height });
          setStatus("showing");
        });
      };
      attempt(MEASURE_RETRIES);
    },
    [schedule],
  );

  // ── Navegación entre pasos ────────────────────────────────────────────────

  const finish = useCallback(
    (completed: boolean) => {
      runId.current += 1;
      clearTimers();
      setStepIndex(null);
      setStatus("idle");
      setTargetLayout(null);
      onFinish?.(completed);
    },
    [clearTimers, onFinish],
  );

  const goToStep = useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step) return;

      runId.current += 1;
      clearTimers();
      setTargetLayout(null);
      setStepIndex(index);
      setStatus("navigating");

      // Callback de cambio de paso: cambia pestaña / navega ANTES del spotlight
      if (onStepChange) onStepChange(step, index);
      else navigateToTourStep(router, step);
    },
    [steps, clearTimers, onStepChange, router],
  );

  const startTour = useCallback(() => goToStep(0), [goToStep]);

  // ── Auto-inicio al abrir la app ───────────────────────────────────────────

  const autoStarted = useRef(false);

  useEffect(() => {
    if (!autoStart || autoStarted.current) return;
    const timer = setTimeout(() => {
      // No interrumpir si el usuario ya inició el tour manualmente
      if (autoStarted.current) return;
      autoStarted.current = true;
      if (runId.current === 0) startTour();
    }, autoStartDelayMs);
    return () => clearTimeout(timer);
  }, [autoStart, autoStartDelayMs, startTour]);

  const nextStep = useCallback(() => {
    if (stepIndex === null) return;
    if (stepIndex >= steps.length - 1) finish(true);
    else goToStep(stepIndex + 1);
  }, [stepIndex, steps.length, finish, goToStep]);

  const prevStep = useCallback(() => {
    if (stepIndex === null || stepIndex === 0) return;
    goToStep(stepIndex - 1);
  }, [stepIndex, goToStep]);

  const skipTour = useCallback(() => finish(false), [finish]);

  // ── Sincronización paso ↔ ruta actual ─────────────────────────────────────

  const expectedPath = currentStep
    ? TOUR_SCREEN_ROUTES[currentStep.screen].pathname
    : null;
  const onExpectedRoute = expectedPath !== null && pathname === expectedPath;

  /** ¿Estaba el usuario en la ruta del paso en la evaluación anterior? */
  const wasOnRoute = useRef(false);

  useEffect(() => {
    const prevOnRoute = wasOnRoute.current;
    wasOnRoute.current = onExpectedRoute;
    if (!currentStep) return;

    const token = runId.current;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (status === "navigating") {
      // Ruta alcanzada → esperar la animación; si no, red de seguridad.
      timer = setTimeout(
        () => {
          if (token !== runId.current) return;
          setStatus("measuring");
          measure(currentStep.targetId, token);
        },
        onExpectedRoute ? TRANSITION_SETTLE_MS : NAVIGATION_TIMEOUT_MS,
      );
    } else if (status === "showing" && onExpectedRoute && !prevOnRoute) {
      // El usuario volvió a la pantalla del paso: re-medir el target
      timer = setTimeout(
        () => measure(currentStep.targetId, token),
        TRANSITION_SETTLE_MS,
      );
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, status, onExpectedRoute, measure]);

  /** Fuera de la pantalla del paso no hay spotlight (solo tooltip centrado) */
  const visibleLayout = onExpectedRoute ? targetLayout : null;

  const remeasure = useCallback(() => {
    if (!currentStep || !onExpectedRoute) return;
    measure(currentStep.targetId, runId.current);
  }, [currentStep, onExpectedRoute, measure]);

  // ── Value ─────────────────────────────────────────────────────────────────

  const value = useMemo<TourContextValue>(
    () => ({
      steps,
      stepIndex,
      currentStep,
      status,
      targetLayout: visibleLayout,
      isActive: stepIndex !== null,
      startTour,
      nextStep,
      prevStep,
      goToStep,
      skipTour,
      registerTarget,
      unregisterTarget,
      remeasure,
    }),
    [
      steps,
      stepIndex,
      currentStep,
      status,
      visibleLayout,
      startTour,
      nextStep,
      prevStep,
      goToStep,
      skipTour,
      registerTarget,
      unregisterTarget,
      remeasure,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
