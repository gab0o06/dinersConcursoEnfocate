/**
 * TourContext — Controlador del tour guiado interactivo de EcoClub.
 *
 * Flujo de cada paso:
 *   1. goToStep(i) → status = "navigating", se invoca onStepChange(step)
 *      (por defecto cambia de pestaña / navega con Expo Router).
 *   2. Un efecto observa usePathname(): cuando coincide con la ruta del paso,
 *      espera a que termine la animación de transición y mide el target hasta
 *      obtener DOS mediciones iguales seguidas (layout estabilizado).
 *   3. Con el layout medido → status = "showing" y TourOverlay pinta el spotlight.
 *
 * Seguimiento en vivo:
 *   - recalculateSpotlight() vuelve a medir el target activo, como mucho una vez
 *     por frame (requestAnimationFrame). Lo disparan el scroll de las pantallas
 *     (useTourScroll), sus cambios de layout y el propio overlay.
 *
 * Dos contextos para no re-renderizar pantallas en cada frame de scroll:
 *   - TourActionsContext: estable (registro de targets, scroll, startTour).
 *     Lo consumen las pantallas vía useTourHighlight / useTourScroll / useTourActions.
 *   - TourStateContext: cambia con el spotlight. Solo lo consume el overlay (useTour).
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

export interface TourActions {
  startTour: () => void;
  registerTarget: (id: string, ref: RefObject<View | null>) => void;
  unregisterTarget: (id: string, ref: RefObject<View | null>) => void;
  /** Re-mide el target activo (throttled a 1 vez por frame). Barato si no hay tour. */
  recalculateSpotlight: () => void;
  /** Marca el tour como completado si está activo (no-op si ya terminó) */
  endTour: () => void;
}

export interface TourContextValue extends TourActions {
  steps: TourStep[];
  /** Índice 0-based del paso actual. null = tour inactivo */
  stepIndex: number | null;
  currentStep: TourStep | null;
  status: TourStatus;
  /** Layout (coordenadas de ventana) del target, null si no hay spotlight */
  targetLayout: TargetLayout | null;
  isActive: boolean;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  /** Finaliza el tour en cualquier momento */
  skipTour: () => void;
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
const MEASURE_RETRIES = 12;
const MEASURE_RETRY_DELAY_MS = 90;
/** Tolerancia (px) para considerar dos mediciones iguales */
const LAYOUT_EPSILON = 0.5;

const sameLayout = (a: TargetLayout | null, b: TargetLayout | null) =>
  !!a &&
  !!b &&
  Math.abs(a.x - b.x) < LAYOUT_EPSILON &&
  Math.abs(a.y - b.y) < LAYOUT_EPSILON &&
  Math.abs(a.width - b.width) < LAYOUT_EPSILON &&
  Math.abs(a.height - b.height) < LAYOUT_EPSILON;

// ---------------------------------------------------------------------------
// Contextos y hooks
// ---------------------------------------------------------------------------

const TourActionsContext = createContext<TourActions | null>(null);
const TourStateContext = createContext<TourContextValue | null>(null);

/** Estado completo del tour (re-renderiza con cada movimiento del spotlight). */
export function useTour(): TourContextValue {
  const ctx = useContext(TourStateContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}

/** Acciones estables del tour: no provocan re-render al mover el spotlight. */
export function useTourActions(): TourActions {
  const ctx = useContext(TourActionsContext);
  if (!ctx)
    throw new Error("useTourActions must be used inside <TourProvider>");
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

  /** Target que el seguimiento en vivo debe medir (null = no seguir) */
  const liveTargetId = useRef<string | null>(null);
  const rafId = useRef<number | null>(null);
  const lastLayout = useRef<TargetLayout | null>(null);

  const currentStep = stepIndex !== null ? (steps[stepIndex] ?? null) : null;

  // ── Timers ────────────────────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  /** Actualiza el layout solo si cambió (evita renders inútiles del overlay) */
  const commitLayout = useCallback((layout: TargetLayout | null) => {
    if (
      layout === null
        ? lastLayout.current === null
        : sameLayout(layout, lastLayout.current)
    ) {
      return;
    }
    lastLayout.current = layout;
    setTargetLayout(layout);
  }, []);

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

  // ── Medición inicial (espera a que el layout se estabilice) ───────────────

  const measure = useCallback(
    (targetId: string, token: number) => {
      let previous: TargetLayout | null = null;

      const attempt = (retriesLeft: number): void => {
        if (token !== runId.current) return;

        const retry = () => {
          if (retriesLeft > 0) {
            schedule(() => attempt(retriesLeft - 1), MEASURE_RETRY_DELAY_MS);
          } else {
            // Se agotó la espera: usar la última medición válida, o tooltip sin spotlight
            liveTargetId.current = previous ? targetId : null;
            commitLayout(previous);
            setStatus("showing");
          }
        };

        const node = targets.current.get(targetId)?.current;
        if (!node) return retry();

        node.measureInWindow((x, y, width, height) => {
          if (token !== runId.current) return;
          if (!width || !height) return retry();

          const layout = { x, y, width, height };
          if (!sameLayout(layout, previous)) {
            // Aún se está moviendo (animación / contenido cargando): medir otra vez
            previous = layout;
            return retry();
          }
          liveTargetId.current = targetId;
          commitLayout(layout);
          setStatus("showing");
        });
      };
      attempt(MEASURE_RETRIES);
    },
    [schedule, commitLayout],
  );

  // ── Seguimiento en vivo (scroll / layout) ─────────────────────────────────

  const recalculateSpotlight = useCallback(() => {
    if (liveTargetId.current === null || rafId.current !== null) return;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const id = liveTargetId.current;
      const node = id ? targets.current.get(id)?.current : null;
      if (!node) return;
      const token = runId.current;
      node.measureInWindow((x, y, width, height) => {
        if (token !== runId.current || liveTargetId.current !== id) return;
        if (!width || !height) return;
        commitLayout({ x, y, width, height });
      });
    });
  }, [commitLayout]);

  // ── Navegación entre pasos ────────────────────────────────────────────────

  const resetMeasurement = useCallback(() => {
    runId.current += 1;
    clearTimers();
    liveTargetId.current = null;
    lastLayout.current = null;
    setTargetLayout(null);
  }, [clearTimers]);

  /** ¿Ya se disparó (o se canceló) el auto-inicio de este arranque? */
  const autoStarted = useRef(false);
  /** ¿Hay un tour en curso? (ref para que endTour sea estable) */
  const activeRef = useRef(false);

  const finish = useCallback(
    (completed: boolean) => {
      activeRef.current = false;
      resetMeasurement();
      setStepIndex(null);
      setStatus("idle");
      onFinish?.(completed);
    },
    [resetMeasurement, onFinish],
  );

  const goToStep = useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step) return;

      activeRef.current = true;
      resetMeasurement();
      setStepIndex(index);
      setStatus("navigating");

      // Callback de cambio de paso: cambia pestaña / navega ANTES del spotlight
      if (onStepChange) onStepChange(step, index);
      else navigateToTourStep(router, step);
    },
    [steps, resetMeasurement, onStepChange, router],
  );

  const startTour = useCallback(() => goToStep(0), [goToStep]);

  const endTour = useCallback(() => {
    autoStarted.current = true; // evita que un auto-inicio pendiente lo relance
    if (activeRef.current) finish(true);
  }, [finish]);

  // ── Auto-inicio al abrir la app ───────────────────────────────────────────

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
      liveTargetId.current = currentStep.targetId;
      timer = setTimeout(recalculateSpotlight, TRANSITION_SETTLE_MS);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, status, onExpectedRoute, measure, recalculateSpotlight]);

  /** Fuera de la pantalla del paso no hay spotlight (solo tooltip centrado) */
  const visibleLayout = onExpectedRoute ? targetLayout : null;

  // ── Values ────────────────────────────────────────────────────────────────

  const actions = useMemo<TourActions>(
    () => ({
      startTour,
      registerTarget,
      unregisterTarget,
      recalculateSpotlight,
      endTour,
    }),
    [
      startTour,
      registerTarget,
      unregisterTarget,
      recalculateSpotlight,
      endTour,
    ],
  );

  const state = useMemo<TourContextValue>(
    () => ({
      ...actions,
      steps,
      stepIndex,
      currentStep,
      status,
      targetLayout: visibleLayout,
      isActive: stepIndex !== null,
      nextStep,
      prevStep,
      goToStep,
      skipTour,
    }),
    [
      actions,
      steps,
      stepIndex,
      currentStep,
      status,
      visibleLayout,
      nextStep,
      prevStep,
      goToStep,
      skipTour,
    ],
  );

  return (
    <TourActionsContext.Provider value={actions}>
      <TourStateContext.Provider value={state}>
        {children}
      </TourStateContext.Provider>
    </TourActionsContext.Provider>
  );
}
